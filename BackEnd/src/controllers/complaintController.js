const Complaint = require("../models/Complaint");
const Application = require("../models/Application");
const Company = require("../models/Company");
const Student = require("../models/Student");

const COMPLAINT_THRESHOLD = 3;

exports.submitComplaint = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { companyId, reason } = req.body;

    if (!companyId || !reason) {
      return res.status(400).json({ message: "All fields required" });
    }

    const student = await Student.findOne({ userId });
    if (!student) {
      return res.status(403).json({ message: "Student profile not found" });
    }

    // ✅ Check ACCEPTED status
    const application = await Application.findOne({
      studentId: student._id,
      companyId,
      status: "accepted",
    });

    if (!application) {
      return res.status(403).json({
        message: "Only accepted students can complain",
      });
    }

    // Save complaint
    await Complaint.create({
      studentId: student._id,
      companyId,
      reason,
    });

    // Count complaints
    const count = await Complaint.countDocuments({ companyId });

    // Auto block company
    if (count >= COMPLAINT_THRESHOLD) {
      await Company.findByIdAndUpdate(companyId, {
        isBlocked: true,
      });
    }

    res.status(201).json({
      message: "Complaint submitted successfully",
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "You already complained about this company",
      });
    }

    res.status(500).json({ message: "Server error" });
  }
};
