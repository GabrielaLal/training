const express = require("express");
const passport = require("passport");
const router = express.Router();

const EventObject = require("../models/event");
const VenueObject = require("../models/venue");
const ERROR_CODES = require("../utils/errorCodes");
const { capture } = require("../services/sentry");
const googleCalendar = require("../services/googleCalendar");

// ============ PUBLIC ROUTES ============

router.post("/search", async (req, res) => {
  try {
    const { search, category, city, sort, per_page, page } = req.body;

    let query = { status: "published", start_date: { $gte: new Date() } };

    if (search) {
      const searchValue = search.replace(/[#-.]|[[-^]|[?|{}]/g, "\\$&");
      query = {
        ...query,
        $or: [
          { title: { $regex: searchValue, $options: "i" } },
          { description: { $regex: searchValue, $options: "i" } },
        ],
      };
    }

    if (category) query.category = category;
    if (city) query.venue_city = { $regex: city, $options: "i" };

    const limit = per_page || 10;
    const offset = page ? (page - 1) * limit : 0;

    const data = await EventObject.find(query)
      .skip(offset)
      .limit(limit)
      .sort(sort || { start_date: 1 });

    const total = await EventObject.countDocuments(query);

    return res.status(200).send({ ok: true, data, total });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERROR_CODES.SERVER_ERROR, error });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const data = await EventObject.findById(req.params.id);
    if (!data) return res.status(404).send({ ok: false, code: ERROR_CODES.NOT_FOUND });
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERROR_CODES.SERVER_ERROR, error });
  }
});

// ============ USER ROUTES (Authenticated) ============

router.post("/", passport.authenticate("user", { session: false }), async (req, res) => {
  try {
    const {
      title,
      description,
      start_date,
      end_date,
      venue_id,
      capacity,
      price,
      currency,
      status,
      category,
      image_url,
      registration_deadline,
      requires_approval,
    } = req.body;

    if (!title || !start_date || !venue_id) {
      return res.status(400).send({ ok: false, code: "TITLE_START_DATE_AND_VENUE_REQUIRED" });
    }

    const venue = await VenueObject.findById(venue_id);
    if (!venue) {
      return res.status(404).send({ ok: false, code: "VENUE_NOT_FOUND" });
    }

    const event = await EventObject.create({
      title,
      description,
      start_date,
      end_date,
      venue_id: venue._id.toString(),
      venue_name: venue.name,
      venue_address: venue.address,
      venue_city: venue.city,
      venue_country: venue.country,
      capacity,
      available_spots: capacity || 0,
      price,
      currency,
      status: status || "draft",
      category,
      image_url,
      registration_deadline,
      requires_approval,
      organizer_id: req.user._id.toString(),
      organizer_name: req.user.name,
      organizer_email: req.user.email,
    });

    if (status === "published") {
      const googleEventPayload = {
        summary: event.title,
        description: event.description || "",
        location: [event.venue_address, event.venue_city, event.venue_country].filter(Boolean).join(", "),
        start: {
          dateTime: event.start_date.toISOString(),
          timeZone: "UTC",
        },
        end: {
          dateTime: (event.end_date || event.start_date).toISOString(),
          timeZone: "UTC",
        },
      };

      console.log("[event] Adding event to Google Calendar:", { eventId: event._id, payload: googleEventPayload });
      googleCalendar
        .addEvent(googleEventPayload)
        .then((result) => {
          if (result.success && result.googleEventId) {
            event.google_calendar_id = result.googleEventId;
            return event.save();
          } else {
            console.error("[event] Failed to add event to Google Calendar:", result);
          }
        })
        .catch((error) => {
          console.error("[event] Error adding event to Google Calendar:", error);
          capture(error);
        });
    }

    return res.status(200).send({ ok: true, data: event });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERROR_CODES.SERVER_ERROR, error });
  }
});

router.post("/my-events/search", passport.authenticate(["user", "admin"], { session: false }), async (req, res) => {
  try {
    const { search, status, category, sort, per_page, page } = req.body;

    let query = {};
    if (req.user.role === "user") {
      query.organizer_id = req.user._id.toString();
    }

    if (search) {
      const searchValue = search.replace(/[#-.]|[[-^]|[?|{}]/g, "\\$&");
      query = {
        ...query,
        $or: [
          { title: { $regex: searchValue, $options: "i" } },
          { description: { $regex: searchValue, $options: "i" } },
        ],
      };
    }

    if (status) query.status = status;
    if (category) query.category = category;

    const limit = per_page || 10;
    const offset = page ? (page - 1) * limit : 0;

    const data = await EventObject.find(query)
      .skip(offset)
      .limit(limit)
      .sort(sort || { created_at: -1 });

    const total = await EventObject.countDocuments(query);

    return res.status(200).send({ ok: true, data, total });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERROR_CODES.SERVER_ERROR, error });
  }
});

router.put("/:id", passport.authenticate(["user", "admin"], { session: false }), async (req, res) => {
  try {
    const event = await EventObject.findById(req.params.id);
    if (!event) return res.status(404).send({ ok: false, code: ERROR_CODES.NOT_FOUND });

    const isOwner = event.organizer_id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).send({ ok: false, code: "FORBIDDEN" });
    }

    const updates = { ...req.body };
    const previousStatus = event.status;

    const venueIdToCheck = updates.venue_id || event.venue_id;
    const newCapacity = updates.capacity || event.capacity;
    const shouldValidateCapacity = updates.venue_id || (updates.capacity && updates.capacity !== event.capacity);

    if (shouldValidateCapacity) {
      const venue = await VenueObject.findById(venueIdToCheck);
      if (!venue) {
        return res.status(404).send({ ok: false, code: "VENUE_NOT_FOUND" });
      }

      if (venue.capacity !== 0 && newCapacity > venue.capacity) {
        return res.status(400).send({
          ok: false,
          code: "CAPACITY_EXCEEDS_VENUE_CAPACITY",
          message: `Event capacity (${newCapacity}) cannot exceed venue capacity (${venue.capacity})`,
        });
      }

      if (updates.venue_id) {
        updates.venue_id = updates.venue_id.toString();
        updates.venue_name = venue.name;
        updates.venue_address = venue.address;
        updates.venue_city = venue.city;
        updates.venue_country = venue.country;
      }
    }

    if (updates.capacity && updates.capacity !== event.capacity) {
      const bookedSpots = event.capacity - event.available_spots;
      updates.available_spots = updates.capacity - bookedSpots;
    }

    event.set(updates);
    await event.save();

    const newStatus = event.status;

    const googleEventPayload = {
      summary: event.title,
      description: event.description || "",
      location: [event.venue_address, event.venue_city, event.venue_country].filter(Boolean).join(", "),
      start: {
        dateTime: event.start_date.toISOString(),
        timeZone: "UTC",
      },
      end: {
        dateTime: (event.end_date || event.start_date).toISOString(),
        timeZone: "UTC",
      },
    };

    if (newStatus === "published") {
      if (event.google_calendar_id) {
        googleCalendar
          .findEvent(event.google_calendar_id)
          .then((findResult) => {
            if (findResult.success) {
              return googleCalendar.updateEvent(event.google_calendar_id, googleEventPayload);
            } else {
              console.warn(`[event] Google Calendar event ${event.google_calendar_id} not found, creating new one`);
              return googleCalendar.addEvent(googleEventPayload).then((addResult) => {
                if (addResult.success && addResult.googleEventId) {
                  event.google_calendar_id = addResult.googleEventId;
                  return event.save();
                } else {
                  console.error("[event] Failed to add event to Google Calendar:", addResult);
                }
              });
            }
          })
          .then((updateResult) => {
            if (updateResult && !updateResult.success) {
              console.error("[event] Failed to update event in Google Calendar:", updateResult);
            }
          })
          .catch((error) => {
            console.error("[event] Error syncing with Google Calendar:", error);
            capture(error);
          });
      } else {
        googleCalendar
          .addEvent(googleEventPayload)
          .then((addResult) => {
            if (addResult.success && addResult.googleEventId) {
              event.google_calendar_id = addResult.googleEventId;
              return event.save();
            } else {
              console.error("[event] Failed to add event to Google Calendar:", addResult);
            }
          })
          .catch((error) => {
            console.error("[event] Error adding event to Google Calendar:", error);
            capture(error);
          });
      }
    }

    if (previousStatus === "published" && newStatus !== "published" && event.google_calendar_id) {
      googleCalendar
        .findEvent(event.google_calendar_id)
        .then((findResult) => {
          if (findResult.success) {
            return googleCalendar.deleteEvent(event.google_calendar_id);
          }
        })
        .then(() => {
          event.google_calendar_id = null;
          return event.save();
        })
        .catch((error) => {
          console.error("[event] Failed to sync with Google Calendar:", error);
          capture(error);
        });
    }

    res.status(200).send({ ok: true, data: event });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERROR_CODES.SERVER_ERROR, error });
  }
});

router.delete("/:id", passport.authenticate(["user", "admin"], { session: false }), async (req, res) => {
  try {
    const event = await EventObject.findById(req.params.id);
    if (!event) return res.status(404).send({ ok: false, code: ERROR_CODES.NOT_FOUND });

    const isOwner = event.organizer_id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).send({ ok: false, code: "FORBIDDEN" });
    }

    if (event.google_calendar_id) {
      googleCalendar
        .findEvent(event.google_calendar_id)
        .then((findResult) => {
          if (findResult.success) {
            return googleCalendar.deleteEvent(event.google_calendar_id);
          }
        })
        .catch((error) => {
          capture(error);
        });
    }

    await EventObject.findByIdAndDelete(req.params.id);

    res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERROR_CODES.SERVER_ERROR, error });
  }
});

module.exports = router;
