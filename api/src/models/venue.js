const mongoose = require("mongoose");

const MODELNAME = "venue";

const Schema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },

    capacity: { type: Number, default: 0 },

    amenities: [{ type: String, trim: true }],

    owner_id: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } },
);

// Index for searching
Schema.index({ name: "text", address: "text", city: "text" });
Schema.index({ city: 1 });

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
