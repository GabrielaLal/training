require("dotenv").config();
const cron = require("node-cron");
const EventObject = require("../models/event");
const { sendEmail } = require("../services/brevo");
const { buildGenericTemplate } = require("../emails");
const { APP_URL } = require("../config");

async function sendEventReminders() {
  try {
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const startWindow = new Date(in24Hours.getTime() - 30 * 60 * 1000);
    const endWindow = new Date(in24Hours.getTime() + 30 * 60 * 1000);

    const events = await EventObject.find({
      status: "published",
      start_date: {
        $gte: startWindow,
        $lte: endWindow,
      },
    });

    let emailsSent = 0;
    let errors = 0;

    for (const event of events) {
      try {
        if (!event.organizer_email) {
          continue;
        }

        const eventDate = new Date(event.start_date);
        const formattedDate = eventDate.toLocaleString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        const venueAddress = [event.venue_address, event.venue_city, event.venue_country].filter(Boolean).join(", ");

        const recipients = [
          {
            email: event.organizer_email,
            name: event.organizer_name || "Organizer",
          },
        ];

        const emailHtml = buildGenericTemplate({
          title: `Reminder: Your event "${event.title}" starts tomorrow!`,
          message: `Hi ${event.organizer_name || "there"}!\n\nThis is a friendly reminder that your event "${
            event.title
          }" is starting tomorrow (${formattedDate}).\n\nEvent Details:\n- Date: ${formattedDate}\n- Location: ${venueAddress}\n${
            event.description ? `- Description: ${event.description}\n` : ""
          }\nMake sure everything is ready for your event!`,
          cta_title: "View Event",
          cta_link: `${APP_URL}/events/${event._id}`,
        });

        await sendEmail(recipients, `Reminder: Your event "${event.title}" starts tomorrow!`, emailHtml);

        emailsSent++;
      } catch (error) {
        errors++;
      }
    }

  } catch (error) {
    console.error("[Cron] Error in event reminders job:", error);
  }
}

function start() {
  cron.schedule("0 * * * *", async () => {
    await sendEventReminders();
  });
}

module.exports = {
  start,
  sendEventReminders,
};
