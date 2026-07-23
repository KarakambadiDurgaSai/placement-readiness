const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  target: {
    type: String,
    required: true,
    index: true,
    // phone number OR email
  },

  otp: {
    type: String,
    required: true,
  },

  type: {
    type: String,
    enum: ["phone", "email"],
    required: true,
  },

  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }, // MongoDB TTL
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Otp", otpSchema);
