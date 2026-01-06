const fetch = require("node-fetch");
const EventObject = require("../models/event");
const { GOOGLE_CALENDAR_ACCESS_TOKEN, GOOGLE_CALENDAR_CALENDAR_ID } = require("../config");

async function exportEvent(eventId) {
  try {
    if (!GOOGLE_CALENDAR_ACCESS_TOKEN || !GOOGLE_CALENDAR_CALENDAR_ID) {
      console.warn("[googleCalendar] Google Calendar not configured, skipping export");
      return { success: false, reason: "not_configured" };
    }

    const event = await EventObject.findById(eventId);
    if (!event) {
      console.warn(`[googleCalendar] Event not found for id=${eventId}`);
      return { success: false, reason: "event_not_found" };
    }

    if (event.status !== "published") {
      return { success: false, reason: "not_published" };
    }

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

    const calendarId = encodeURIComponent(GOOGLE_CALENDAR_CALENDAR_ID);
    let url;
    let method;

    // If event already has a Google Calendar ID, update it; otherwise create new
    if (event.google_calendar_id) {
      url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${encodeURIComponent(
        event.google_calendar_id,
      )}`;
      method = "PUT";
    } else {
      url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`;
      method = "POST";
    }

    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${GOOGLE_CALENDAR_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(googleEventPayload),
    });

    if (!response.ok) {
      return { success: false, reason: "api_error", status: response.status };
    }

    const googleEvent = await response.json();

    if (!event.google_calendar_id && googleEvent.id) {
      event.google_calendar_id = googleEvent.id;
      await event.save();
    }

    return { success: true, googleEventId: googleEvent.id };
  } catch (error) {
    return { success: false, reason: "exception", error: error.message };
  }
}

/**
 * Delete an event from Google Calendar
 */
async function deleteEvent(eventId) {
  try {
    if (!GOOGLE_CALENDAR_ACCESS_TOKEN || !GOOGLE_CALENDAR_CALENDAR_ID) {
      return { success: false, reason: "not_configured" };
    }

    const event = await EventObject.findById(eventId);
    if (!event || !event.google_calendar_id) {
      return { success: false, reason: "no_google_calendar_id" };
    }

    const calendarId = encodeURIComponent(GOOGLE_CALENDAR_CALENDAR_ID);
    const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${encodeURIComponent(
      event.google_calendar_id,
    )}`;

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${GOOGLE_CALENDAR_ACCESS_TOKEN}`,
      },
    });

    if (!response.ok && response.status !== 404) {
      return { success: false, reason: "api_error", status: response.status };
    }

    event.google_calendar_id = null;
    await event.save();

    console.log(`[googleCalendar] Deleted Google Calendar event ${event.google_calendar_id} for event ${eventId}`);
    return { success: true };
  } catch (error) {
    console.error("[googleCalendar] Error while deleting event", error);
    return { success: false, reason: "exception", error: error.message };
  }
}

module.exports = {
  exportEvent,
  deleteEvent,
};
