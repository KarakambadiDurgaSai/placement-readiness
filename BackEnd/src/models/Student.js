const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    dob: { type: Date, required: true },
    state: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    personalEmail: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },

    collegeName: { type: String, required: true, trim: true },
    collegeEmail: { type: String, required: true, lowercase: true, trim: true },
    joinYear: { type: Number, required: true },
    passOutYear: { type: Number, required: true },
    degree: { type: String, required: true, trim: true },
    branch: { type: String, required: true, trim: true },
    percentage: { type: Number, required: true, min: 0, max: 100 },

    skills: { type: [String], default: [] },

    // ✅ NEW FIELD: DOMAIN (Tech / Non-Tech)
    domain: {
      type: String,
      enum: ["tech", "non-tech"],
      default: "tech",
    },
    
    roleType: { type: String, trim: true },

    // ✅ NEW FIELD: PROJECTS
    projects: [
      {
        title: { type: String, trim: true },
        link: { type: String, trim: true },
      },
    ],

    resume: { type: String, default: "" },

    // ✅ NEW FIELD: READINESS SCORE
    readinessScore: {
      type: Number,
      default: 0,
    },

    profilePhoto: { type: String, default: "" },

    // OTP verification reflects here
    profileStatus: {
      type: String,
      enum: ["pending", "verified"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);