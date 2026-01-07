const mongoose = require("mongoose");

const MODELNAME = "event";

const Schema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },

    description: { type: String, trim: true },

    // Event date and time
    start_date: { type: Date, required: true },
    end_date: { type: Date },

    venue_id: { type: String, required: true },
    venue_name: { type: String, trim: true },
    venue_address: { type: String, trim: true },
    venue_city: { type: String, trim: true },
    venue_country: { type: String, trim: true },

    // Capacity
    capacity: { type: Number, default: 0 },
    available_spots: { type: Number, default: 0 },

    // Pricing
    price: { type: Number, default: 0 }, // 0 means free event
    currency: { type: String, default: "EUR" },

    // Status
    status: { type: String, enum: ["draft", "published", "cancelled"], default: "draft" },

    // Organizer
    organizer_id: { type: String, required: true },
    organizer_name: { type: String },
    organizer_email: { type: String },

    // Image
    image_url: { type: String, default: "" },

    // Categories
    category: {
      type: String,
      enum: ["conference", "workshop", "seminar", "networking", "social", "other"],
      default: "other",
    },

    // Registration
    registration_deadline: { type: Date },
    requires_approval: { type: Boolean, default: false },

    google_calendar_id: { type: String, default: null },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } },
);

// Index for searching
Schema.index({ title: "text", description: "text" });
Schema.index({ start_date: 1, status: 1 });

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
