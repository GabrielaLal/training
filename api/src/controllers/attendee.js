const express = require("express");
const passport = require("passport");
const router = express.Router();
const crypto = require("crypto");

const AttendeeObject = require("../models/attendee");
const EventObject = require("../models/event");
const ERROR_CODES = require("../utils/errorCodes");
const { capture } = require("../services/sentry");

// ============ USER ROUTES (Authenticated) ============

// Register for an event
router.post("/register", passport.authenticate("user", { session: false }), async (req, res) => {
  try {
    const { event_id, notes } = req.body;

    if (!event_id) {
      return res.status(400).send({ ok: false, code: "EVENT_ID_REQUIRED" });
    }

    // Check if event exists and is published
    const event = await EventObject.findById(event_id);
    if (!event) {
      return res.status(404).send({ ok: false, code: ERROR_CODES.NOT_FOUND });
    }

    if (event.status !== "published") {
      return res.status(400).send({ ok: false, code: "EVENT_NOT_AVAILABLE" });
    }

    // Check if event is in the future
    if (new Date(event.start_date) < new Date()) {
      return res.status(400).send({ ok: false, code: "EVENT_ALREADY_STARTED" });
    }

    // Check if registration deadline has passed
    if (event.registration_deadline && new Date(event.registration_deadline) < new Date()) {
      return res.status(400).send({ ok: false, code: "REGISTRATION_CLOSED" });
    }

    // Check if there are available spots
    if (event.capacity > 0 && event.available_spots <= 0) {
      return res.status(400).send({ ok: false, code: "EVENT_FULL" });
    }

    // Check if user already registered
    const existingAttendee = await AttendeeObject.findOne({ event_id, user_id: req.user._id });
    if (existingAttendee) {
      return res.status(400).send({ ok: false, code: "ALREADY_REGISTERED" });
    }

    // Generate ticket number
    const ticket_number = `TKT-${event_id.toString().slice(-6).toUpperCase()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

    // Create attendee
    const attendee = await AttendeeObject.create({
      event_id,
      user_id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      ticket_number,
      status: event.requires_approval ? "pending" : "confirmed",
      payment_status: event.price > 0 ? "pending" : "free",
      payment_amount: event.price,
      notes,
    });

    // Update available spots
    if (event.capacity > 0) {
      event.available_spots = Math.max(0, event.available_spots - 1);
      await event.save();
    }

    return res.status(201).send({ ok: true, data: attendee });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).send({ ok: false, code: "ALREADY_REGISTERED" });
    }
    capture(error);
    res.status(500).send({ ok: false, code: ERROR_CODES.SERVER_ERROR, error });
  }
});

/**
 * POST /attendee/my-registrations/search - Search user's own registrations
 * 
 * 📚 WHY /search suffix?
 * - Makes it clear this endpoint searches, not creates
 * - Consistent with POST /event/search and /event/my-events/search pattern
 * - Automatically filters by req.user._id for security
 */
router.post("/my-registrations/search", passport.authenticate("user", { session: false }), async (req, res) => {
  try {
    const { search, status, per_page, page } = req.body;
    // Security: user_id is set from authenticated user, not from request body
    let query = { user_id: req.user._id };

    if (status) query.status = status;

    if (search) {
      const searchValue = search.replace(/[#-.]|[[-^]|[?|{}]/g, "\\$&");
      // Search in ticket number or populated event title
      query.ticket_number = { $regex: searchValue, $options: "i" };
    }

    const limit = per_page || 20;
    const offset = page ? (page - 1) * limit : 0;

    const data = await AttendeeObject.find(query)
      .skip(offset)
      .limit(limit)
      .sort({ created_at: -1 });

    const total = await AttendeeObject.countDocuments(query);

    return res.status(200).send({ ok: true, data, total });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERROR_CODES.SERVER_ERROR, error });
  }
});

// Cancel registration
router.delete("/:id", passport.authenticate("user", { session: false }), async (req, res) => {
  try {
    const attendee = await AttendeeObject.findById(req.params.id);
    if (!attendee) {
      return res.status(404).send({ ok: false, code: ERROR_CODES.NOT_FOUND });
    }

    // Check if user owns this registration
    if (attendee.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).send({ ok: false, code: "FORBIDDEN" });
    }

    // Get event to update available spots
    const event = await EventObject.findById(attendee.event_id);

    // Update status to cancelled
    attendee.status = "cancelled";
    await attendee.save();

    // Restore available spot
    if (event && event.capacity > 0) {
      event.available_spots = Math.min(event.capacity, event.available_spots + 1);
      await event.save();
    }

    return res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERROR_CODES.SERVER_ERROR, error });
  }
});

// ============ ORGANIZER ROUTES ============

// Get attendees for organizer's event
router.post("/event/:event_id", passport.authenticate("user", { session: false }), async (req, res) => {
  try {
    const { event_id } = req.params;
    const { status, search, per_page, page } = req.body;

    // Check if event exists and user is the organizer
    const event = await EventObject.findById(event_id);
    if (!event) {
      return res.status(404).send({ ok: false, code: ERROR_CODES.NOT_FOUND });
    }

    if (event.organizer_id.toString() !== req.user._id.toString()) {
      return res.status(403).send({ ok: false, code: "FORBIDDEN" });
    }

    let query = { event_id };

    if (status) query.status = status;

    if (search) {
      const searchValue = search.replace(/[#-.]|[[-^]|[?|{}]/g, "\\$&");
      query = {
        ...query,
        $or: [
          { name: { $regex: searchValue, $options: "i" } },
          { email: { $regex: searchValue, $options: "i" } },
          { ticket_number: { $regex: searchValue, $options: "i" } },
        ],
      };
    }

    const limit = per_page || 10;
    const offset = page ? (page - 1) * limit : 0;

    const data = await AttendeeObject.find(query)
      .skip(offset)
      .limit(limit)
      .sort({ created_at: -1 });

    const total = await AttendeeObject.countDocuments(query);

    return res.status(200).send({ ok: true, data, total });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERROR_CODES.SERVER_ERROR, error });
  }
});

// Update attendee status (organizer only)
router.put("/:id/status", passport.authenticate("user", { session: false }), async (req, res) => {
  try {
    const { status } = req.body;

    const attendee = await AttendeeObject.findById(req.params.id);
    if (!attendee) {
      return res.status(404).send({ ok: false, code: ERROR_CODES.NOT_FOUND });
    }

    // Check if user is the event organizer
    const event = await EventObject.findById(attendee.event_id);
    if (!event || event.organizer_id.toString() !== req.user._id.toString()) {
      return res.status(403).send({ ok: false, code: "FORBIDDEN" });
    }

    attendee.status = status;
    if (status === "checked_in") {
      attendee.checked_in_at = new Date();
    }
    await attendee.save();

    return res.status(200).send({ ok: true, data: attendee });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERROR_CODES.SERVER_ERROR, error });
  }
});

// ============ ADMIN ROUTES ============

// Search all attendees (admin only)
router.post("/admin/search", passport.authenticate("admin", { session: false }), async (req, res) => {
  try {
    const { search, status, event_id, sort, per_page, page } = req.body;
    let query = {};

    if (search) {
      const searchValue = search.replace(/[#-.]|[[-^]|[?|{}]/g, "\\$&");
      query = {
        ...query,
        $or: [
          { name: { $regex: searchValue, $options: "i" } },
          { email: { $regex: searchValue, $options: "i" } },
          { ticket_number: { $regex: searchValue, $options: "i" } },
        ],
      };
    }

    if (status) query.status = status;
    if (event_id) query.event_id = event_id;

    const limit = per_page || 10;
    const offset = page ? (page - 1) * limit : 0;

    const data = await AttendeeObject.find(query)
      .skip(offset)
      .limit(limit)
      .sort(sort || { created_at: -1 });

    const total = await AttendeeObject.countDocuments(query);

    return res.status(200).send({ ok: true, data, total });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERROR_CODES.SERVER_ERROR, error });
  }
});

module.exports = router;

