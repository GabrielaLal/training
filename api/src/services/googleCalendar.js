const fetch = require("node-fetch");
const {
    GOOGLE_CALENDAR_CLIENT_ID,
    GOOGLE_CALENDAR_CLIENT_SECRET,
    GOOGLE_CALENDAR_REFRESH_TOKEN,
    GOOGLE_CALENDAR_CALENDAR_ID
} = require("../config");

let cachedAccessToken = null;
let tokenExpiryTime = null;

async function getValidAccessToken() {
    if (cachedAccessToken && tokenExpiryTime && Date.now() < tokenExpiryTime - 300000) {
        return cachedAccessToken;
    }
    if (!GOOGLE_CALENDAR_CLIENT_ID || !GOOGLE_CALENDAR_CLIENT_SECRET || !GOOGLE_CALENDAR_REFRESH_TOKEN) {
        throw new Error("Missing Google Calendar OAuth credentials");
    }

    const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            client_id: GOOGLE_CALENDAR_CLIENT_ID,
            client_secret: GOOGLE_CALENDAR_CLIENT_SECRET,
            refresh_token: GOOGLE_CALENDAR_REFRESH_TOKEN,
            grant_type: "refresh_token",
        }),
    });

    if (!response.ok) {
        throw new Error("Failed to refresh Google Calendar token");
    }

    const data = await response.json();
    cachedAccessToken = data.access_token;
    tokenExpiryTime = Date.now() + data.expires_in * 1000;

    return cachedAccessToken;
}

async function addEvent(googleEventPayload) {
    try {
        if (!GOOGLE_CALENDAR_CALENDAR_ID) {
            console.warn("[googleCalendar] Google Calendar not configured");
            return {success: false, reason: "not_configured"};
        }

        const accessToken = await getValidAccessToken();
        const calendarId = encodeURIComponent(GOOGLE_CALENDAR_CALENDAR_ID);
        const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`;

        const response = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(googleEventPayload),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            return {success: false, reason: "api_error", status: response.status, error: errorBody};
        }

        const googleEvent = await response.json();
        return {success: true, googleEventId: googleEvent.id};
    } catch (error) {
        console.error("[googleCalendar] Exception while adding event:", error);
        return {success: false, reason: "exception", error: error.message};
    }
}

async function updateEvent(googleEventId, googleEventPayload) {
    try {
        if (!GOOGLE_CALENDAR_CALENDAR_ID) {
            return {success: false, reason: "not_configured"};
        }

        const accessToken = await getValidAccessToken();
        const calendarId = encodeURIComponent(GOOGLE_CALENDAR_CALENDAR_ID);
        const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${encodeURIComponent(
            googleEventId,
        )}`;

        const response = await fetch(url, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(googleEventPayload),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            return {success: false, reason: "api_error", status: response.status, error: errorBody};
        }

        const googleEvent = await response.json();
        return {success: true, googleEventId: googleEvent.id};
    } catch (error) {
        return {success: false, reason: "exception", error: error.message};
    }
}

async function deleteEvent(googleEventId) {
    try {
        if (!GOOGLE_CALENDAR_CALENDAR_ID) {
            return {success: false, reason: "not_configured"};
        }

        const accessToken = await getValidAccessToken();
        const calendarId = encodeURIComponent(GOOGLE_CALENDAR_CALENDAR_ID);
        const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${encodeURIComponent(
            googleEventId,
        )}`;

        const response = await fetch(url, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok && response.status !== 404) {
            const errorBody = await response.text();
            return {success: false, reason: "api_error", status: response.status, error: errorBody};
        }

        return {success: true};
    } catch (error) {
        return {success: false, reason: "exception", error: error.message};
    }
}

async function findEvent(googleEventId) {
    try {
        if (!GOOGLE_CALENDAR_CALENDAR_ID) {
            return {success: false, reason: "not_configured"};
        }

        const accessToken = await getValidAccessToken();
        const calendarId = encodeURIComponent(GOOGLE_CALENDAR_CALENDAR_ID);
        const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${encodeURIComponent(
            googleEventId,
        )}`;

        const response = await fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            return {success: false, reason: "api_error", status: response.status};
        }

        const googleEvent = await response.json();
        return {success: true, data: googleEvent};
    } catch (error) {
        return {success: false, reason: "exception", error: error.message};
    }
}

module.exports = {
    addEvent,
    updateEvent,
    deleteEvent,
    findEvent,
};