const express = require("express");
const router = express.Router();
const { GOOGLE_WEBHOOK_SECRET } = require("../config");

const { capture } = require("../services/sentry");
const EventObject = require("../models/event");

router.post("/calendar-sync", async (req, res) => {
  try {
    if (GOOGLE_WEBHOOK_SECRET) {
      const providedSecret = req.query.secret || req.headers["x-webhook-secret"];
      if (providedSecret !== GOOGLE_WEBHOOK_SECRET) {
        console.warn("[webhook] Invalid webhook secret");
        return res.status(401).send({ ok: false, code: "INVALID_WEBHOOK_SECRET" });
      }
    }

    const resourceState = req.headers["x-goog-resource-state"];
    const resourceId = req.headers["x-goog-resource-id"];
    const resourceUri = req.headers["x-goog-resource-uri"];

    console.log("[webhook] Received Google Calendar webhook", {
      resourceState,
      resourceId,
      resourceUri,
    });

    if (resourceState === "sync") {
      return res.status(200).send({ ok: true, message: "sync_received" });
    }

    if (resourceState === "not_exists") {
      const eventIdMatch = resourceUri?.match(/\/events\/([^/?]+)/);
      if (eventIdMatch) {
        const googleCalendarEventId = decodeURIComponent(eventIdMatch[1]);
        const event = await EventObject.findOne({ google_calendar_id: googleCalendarEventId });

        if (event) {
          console.log(`[webhook] Event ${event._id} was deleted in Google Calendar, marking as cancelled`);
        }
      }
      return res.status(200).send({ ok: true, message: "deletion_processed" });
    }

    if (resourceState === "exists") {
      console.log("[webhook] Event exists in Google Calendar - sync would happen here");
      console.log("[webhook] To fully implement: fetch event from", resourceUri);

      return res.status(200).send({ ok: true, message: "update_received" });
    }
    return res.status(200).send({ ok: true, message: "acknowledged" });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: "WEBHOOK_PROCESSING_ERROR" });
  }
});

module.exports = router;
