const express = require("express");
const passport = require("passport");
const router = express.Router();

const EventObject = require("../models/event");
const VenueObject = require("../models/venue");
const ERROR_CODES = require("../utils/errorCodes");
const { capture } = require("../services/sentry");

/**
 * 📚 LEARNING NOTE: Controller Organization & Role-Based Access
 *
 * We organize routes into 2 sections:
 * 1. PUBLIC - No authentication required (anyone can access)
 * 2. AUTHENTICATED - Requires authentication (user OR admin)
 *
 * 📚 WHY not separate admin routes?
 * - Avoid code duplication (admin routes were 90% same as user routes)
 * - Use role checks INSIDE routes instead: if (req.user.role === "admin") { ... }
 * - Cleaner API surface: /event/:id instead of /event/:id + /admin/event/:id
 * - Easier to maintain: one update/delete function with conditional logic
 *
 * This makes it clear who can access what, and helps with security audits.
 */

// ============ PUBLIC ROUTES ============

/**
 * POST /event/search - Search published events (PUBLIC)
 *
 * 📚 WHY POST instead of GET?
 * - GET is typically for simple lookups (/event/:id)
 * - POST allows complex filtering in request body (search, filters, pagination)
 * - Keeps URLs clean and supports larger filter objects
 * - This is Selego's standard pattern for all search endpoints
 *
 * 📚 WHY separate from /event/my-events/search?
 * - Public search: Only published, future events
 * - My events: ALL user's events (drafts, cancelled, past)
 * - Security: Prevents users from querying other organizers' drafts
 */
router.post("/search", async (req, res) => {
  try {
    const { search, category, city, sort, per_page, page } = req.body;

    // 📚 Base query: Only show published events in the future
    // This is a security measure - drafts and cancelled events are private

    let query = { status: "published", start_date: { $gte: new Date() } };

    if (search) {
      // 📚 WHY escape regex characters?
      // Prevents regex injection attacks. User input like "test[" would break the regex.
      const searchValue = search.replace(/[#-.]|[[-^]|[?|{}]/g, "\\$&");

      // 📚 $or: Search across multiple fields
      // options: "i" = case insensitive (Test, test, TEST all match)
      query = {
        ...query,
        $or: [
          { title: { $regex: searchValue, $options: "i" } },
          { description: { $regex: searchValue, $options: "i" } },
        ],
      };
    }

    if (category) query.category = category;

    if (city) {
      query.venue_city = { $regex: city, $options: "i" };
    }

    // 📚 Pagination pattern
    // Frontend sends: { per_page: 10, page: 2 }
    // We calculate: skip first 10 results, return next 10
    const limit = per_page || 10;
    const offset = page ? (page - 1) * limit : 0;

    // 📚 Query execution
    // .skip() and .limit() for pagination
    // .sort() for ordering (1 = ascending, -1 = descending)
    const data = await EventObject.find(query)
      .skip(offset)
      .limit(limit)
      .sort(sort || { start_date: 1 });

    // 📚 WHY count separately?
    // Frontend needs total count for pagination UI ("Page 2 of 10")
    const total = await EventObject.countDocuments(query);

    // 📚 Response pattern: { ok: true, data, total }
    // - ok: Indicates success/failure (helps frontend distinguish errors)
    // - data: The actual results
    // - total: Total count (for pagination)
    return res.status(200).send({ ok: true, data, total });
  } catch (error) {
    // 📚 Error handling
    // - Sentry captures error for monitoring
    // - Return standardized error response
    // - 500 = Internal Server Error
    capture(error);
    res.status(500).send({ ok: false, code: ERROR_CODES.SERVER_ERROR, error });
  }
});

/**
 * GET /event/:id - Get single event by ID (PUBLIC)
 *
 * 📚 WHY GET for single resource?
 * - GET is perfect for simple lookups by ID
 * - RESTful convention: GET /resource/:id
 * - No complex filtering needed, just direct lookup
 */
router.get("/:id", async (req, res) => {
  try {
    // 📚 req.params.id comes from the URL: /event/123abc -> params.id = "123abc"
    const data = await EventObject.findById(req.params.id);

    // 📚 404 = Not Found (resource doesn't exist)
    if (!data) return res.status(404).send({ ok: false, code: ERROR_CODES.NOT_FOUND });

    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERROR_CODES.SERVER_ERROR, error });
  }
});

// ============ USER ROUTES (Authenticated) ============

/**
 * POST /event - Create event (AUTHENTICATED)
 *
 * 📚 passport.authenticate("user", { session: false })
 * - This is middleware that runs BEFORE our handler
 * - Checks JWT token in Authorization header
 * - If valid: Adds req.user to the request and continues
 * - If invalid: Returns 401 Unauthorized automatically
 * - { session: false }: We use JWT, not sessions
 *
 * 📚 WHY authenticate?
 * - Only logged-in users can create events
 * - We need req.user._id to set as organizer
 * - Prevents anonymous spam
 */
router.post("/", passport.authenticate("user", { session: false }), async (req, res) => {
  try {
    // 📚 Destructure only what we need from req.body
    // This is cleaner than using req.body.title, req.body.description, etc.
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

    // 📚 Validation: Check required fields
    // 400 = Bad Request (client sent invalid data)
    if (!title || !start_date || !venue_id) {
      return res.status(400).send({ ok: false, code: "TITLE_START_DATE_AND_VENUE_REQUIRED" });
    }

    const venue = await VenueObject.findById(venue_id);
    if (!venue) {
      return res.status(404).send({ ok: false, code: "VENUE_NOT_FOUND" });
    }

    // 📚 Security: Set organizer from authenticated user
    // NEVER trust organizer_id from request body - users could impersonate others!
    // Always use req.user._id (set by passport middleware)
    const event = await EventObject.create({
      title,
      description,
      start_date,
      end_date,
      venue_id: venue._id,
      venue_name: venue.name,
      venue_address: venue.address,
      venue_city: venue.city,
      venue_country: venue.country,
      capacity,
      available_spots: capacity || 0, // Initially, all spots are available
      price,
      currency,
      status: status || "draft", // Default to draft (not published)
      category,
      image_url,
      registration_deadline,
      requires_approval,
      organizer_id: req.user._id, // 🔒 From JWT token
      organizer_name: req.user.name, // Denormalized for faster queries
      organizer_email: req.user.email, // Denormalized for faster queries
    });

    // 📚 201 = Created (new resource was created successfully)
    return res.status(201).send({ ok: true, data: event });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERROR_CODES.SERVER_ERROR, error });
  }
});

/**
 * POST /event/my-events/search - Search user's own events (USER/ADMIN)
 *
 * 📚 WHY /search suffix?
 * - Makes it clear this endpoint searches, not creates
 * - Consistent with POST /event/search pattern
 *
 * 📚 WHY separate from POST /event/search?
 * - Public search: Only published, future events
 * - This route: ALL user's events (drafts, cancelled, past)
 * - Automatically filters by req.user._id for security
 * - Admins see ALL events (no filter) for moderation
 */
router.post("/my-events/search", passport.authenticate(["user", "admin"], { session: false }), async (req, res) => {
  try {
    const { search, status, category, sort, per_page, page } = req.body;

    // 📚 Role-based filtering:
    // - Regular users: Only their own events (security!)
    // - Admins: All events (for moderation)
    let query = {};
    if (req.user.role === "user") {
      query.organizer_id = req.user._id;
    }
    // Admins get no organizer filter = see everything

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

    // Venue details are stored directly in event (denormalized)
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

/**
 * PUT /event/:id - Update event (AUTHENTICATED, OWNER OR ADMIN)
 *
 * 📚 Ownership check pattern:
 * 1. Authenticate user (passport middleware)
 * 2. Fetch the resource
 * 3. Check if req.user owns the resource OR is admin
 * 4. If neither, return 403 Forbidden
 * 5. If yes, perform the update
 *
 * This prevents users from updating other people's events!
 * Admins can update any event for moderation purposes.
 */
router.put("/:id", passport.authenticate(["user", "admin"], { session: false }), async (req, res) => {
  try {
    const event = await EventObject.findById(req.params.id);
    if (!event) return res.status(404).send({ ok: false, code: ERROR_CODES.NOT_FOUND });

    // 📚 Security: Ownership check OR admin role
    // .toString() because MongoDB IDs are ObjectId objects, not strings
    // 403 = Forbidden (authenticated, but not authorized for THIS resource)
    // Admins can update any event
    const isOwner = event.organizer_id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).send({ ok: false, code: "FORBIDDEN" });
    }

    const updates = { ...req.body };

    if (updates.venue_id) {
      const venue = await VenueObject.findById(updates.venue_id);
      if (!venue) {
        return res.status(404).send({ ok: false, code: "VENUE_NOT_FOUND" });
      }

      const capacityToCheck = updates.capacity || event.capacity;
      if (venue.capacity !== 0 && capacityToCheck > venue.capacity) {
        return res.status(400).send({
          ok: false,
          code: "CAPACITY_EXCEEDS_VENUE_CAPACITY",
          message: `Event capacity (${capacityToCheck}) cannot exceed venue capacity (${venue.capacity})`,
        });
      }

      updates.venue_name = venue.name;
      updates.venue_address = venue.address;
      updates.venue_city = venue.city;
      updates.venue_country = venue.country;
    }

    if (updates.capacity !== undefined && updates.capacity !== event.capacity && !updates.venue_id) {
      const venue = await VenueObject.findById(event.venue_id);
      if (!venue) {
        return res.status(404).send({ ok: false, code: "VENUE_NOT_FOUND" });
      }

      if (venue.capacity !== 0 && updates.capacity > venue.capacity) {
        return res.status(400).send({
          ok: false,
          code: "CAPACITY_EXCEEDS_VENUE_CAPACITY",
          message: `Event capacity (${updates.capacity}) cannot exceed venue capacity (${venue.capacity})`,
        });
      }
    }

    // 📚 Business logic: Recalculate available spots when capacity changes
    // If event had 100 capacity, 30 booked (70 available)
    // And we change capacity to 80
    // Then available = 80 - 30 = 50
    if (updates.capacity !== undefined && updates.capacity !== event.capacity) {
      const bookedSpots = event.capacity - event.available_spots;
      updates.available_spots = updates.capacity - bookedSpots;
    }

    // 📚 .set() updates the document, .save() persists to DB
    event.set(updates);
    await event.save();

    res.status(200).send({ ok: true, data: event });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERROR_CODES.SERVER_ERROR, error });
  }
});

/**
 * DELETE /event/:id - Delete event (AUTHENTICATED, OWNER OR ADMIN)
 *
 * 📚 Same ownership pattern as PUT - regular users can only delete their own events, admins can delete any
 */
router.delete("/:id", passport.authenticate(["user", "admin"], { session: false }), async (req, res) => {
  try {
    const event = await EventObject.findById(req.params.id);
    if (!event) return res.status(404).send({ ok: false, code: ERROR_CODES.NOT_FOUND });

    // 📚 Security: Ownership check OR admin role
    const isOwner = event.organizer_id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).send({ ok: false, code: "FORBIDDEN" });
    }

    await EventObject.findByIdAndDelete(req.params.id);

    // 📚 No data to return on successful delete, just ok: true
    res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERROR_CODES.SERVER_ERROR, error });
  }
});

module.exports = router;
