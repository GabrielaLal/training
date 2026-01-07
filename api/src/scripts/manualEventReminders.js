require("dotenv").config();
const mongoose = require("mongoose");
const { MONGODB_ENDPOINT } = require("../config");
const { sendEventReminders } = require("../cron/eventReminders");
const EventObject = require("../models/event");

async function manualEventReminders() {
  try {
    await mongoose.connect(MONGODB_ENDPOINT);

    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const startWindow = new Date(in24Hours.getTime() - 30 * 60 * 1000);
    const endWindow = new Date(in24Hours.getTime() + 30 * 60 * 1000);

    const eventsNeedingReminders = await EventObject.find({
      status: "published",
      start_date: {
        $gte: startWindow,
        $lte: endWindow
      },
      organizer_email: { $exists: true, $ne: null, $ne: "" }
    });

    if (eventsNeedingReminders.length > 0) {
      eventsNeedingReminders.forEach((event, index) => {
        const hoursUntil = (new Date(event.start_date) - now) / (1000 * 60 * 60);
        console.log(`   ${index + 1}. "${event.title}"`);
        console.log(`      Start: ${new Date(event.start_date).toISOString()}`);
        console.log(`      Hours until start: ${hoursUntil.toFixed(2)}`);
        console.log(`      Organizer: ${event.organizer_email}`);
        console.log("");
      });
    } else {
      console.log("   (No events match the criteria)\n");
    }
    await sendEventReminders();

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    await mongoose.disconnect();
    process.exit(1);
  }
}

manualEventReminders();