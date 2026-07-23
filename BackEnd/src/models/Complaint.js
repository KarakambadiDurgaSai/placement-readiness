const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    reason: {
      type: String,
      enum: [
        "Fake hiring",
        "Asking money",
        "No response after selection",
        "Mismatch job details",
        "Suspicious company",
      ],
      required: true,
    },
  },
  { timestamps: true }
);

// One complaint per student per company
complaintSchema.index({ studentId: 1, companyId: 1 }, { unique: true });

module.exports = mongoose.model("Complaint", complaintSchema);
