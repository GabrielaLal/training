const mongoose = require("mongoose");

const MODELNAME = "attendee";

const Schema = new mongoose.Schema(
  {
    event_id: { type: String, required: true },
    user_id: { type: String, required: true },
    
    // Attendee info (cached from user)
    name: { type: String, required: true },
    email: { type: String, required: true },
    
    // Registration status
    status: { 
      type: String, 
      enum: ["pending", "confirmed", "cancelled", "checked_in"], 
      default: "confirmed" 
    },
    
    // Ticket info
    ticket_number: { type: String, unique: true },
    qr_code: { type: String }, // QR code for check-in
    
    // Payment info (for paid events)
    payment_status: { 
      type: String, 
      enum: ["free", "pending", "paid", "refunded"], 
      default: "free" 
    },
    payment_amount: { type: Number, default: 0 },
    payment_id: { type: String }, // Stripe payment ID
    
    // Check-in
    checked_in_at: { type: Date },
    
    // Notes
    notes: { type: String },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } },
);

// Compound index to ensure one user can only register once per event
Schema.index({ event_id: 1, user_id: 1 }, { unique: true });

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;

