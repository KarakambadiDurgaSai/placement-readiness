const Application = require("../models/Application");

/* =======================
   APPLY TO COMPANY
======================= */
exports.applyToCompany = async (req, res) => {
  try {
    const studentId = req.user.userId;
    const { companyId } = req.body;

    if (!companyId) {
      return res.status(400).json({ message: "Company is required" });
    }

    await Application.create({
      studentId,
      companyId,
    });

    res.status(201).json({
      message: "Application submitted successfully",
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "You have already applied to this company",
      });
    }

    console.error("Apply error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
