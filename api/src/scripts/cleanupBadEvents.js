require("dotenv").config();
const mongoose = require("mongoose");
const { MONGODB_ENDPOINT } = require("../config");
const EventObject = require("../models/event");

async function cleanupBadEvents() {
  try {
    await mongoose.connect(MONGODB_ENDPOINT);
    const badEvents = await EventObject.find({
      title: { $regex: /not-good/i },
    });

    if (badEvents.length === 0) {
      await mongoose.disconnect();
      process.exit(0);
    }

    console.log("Events to be deleted:");
    badEvents.forEach((event, index) => {
      console.log(`  ${index + 1}. "${event.title}" (ID: ${event._id})`);
    });

    const result = await EventObject.deleteMany({
      title: { $regex: /not-good/i },
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    await mongoose.disconnect();
    process.exit(1);
  }
}

cleanupBadEvents();

