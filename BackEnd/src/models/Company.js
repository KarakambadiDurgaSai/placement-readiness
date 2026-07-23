const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    companyEmail: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    location: {
      type: String,
      required: true,
    },

    hiringType: {
      type: String,
      enum: ["tech", "non-tech", "both"],
      required: true,
    },

    techHiringCount: {
      type: Number,
      min: 1,
    },

    nonTechHiringCount: {
      type: Number,
      min: 1,
    },

    roles: {
      type: [String],
      required: true,
    },

    offerType: {
      type: String,
      enum: ["Internship", "Full-Time", "Both"],
      required: true,
    },

    minimumPercentage: {
      type: Number,
      min: 0,
      max: 100,
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },

    profileStatus: {
      type: String,
      enum: ["pending", "verified"],
      default: "pending",
    },
    
    companyLogo: {
      type: String,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Company", companySchema);
