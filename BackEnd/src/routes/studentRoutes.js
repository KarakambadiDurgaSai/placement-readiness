const express = require("express");
const router = express.Router();

const {
  createProfile,
  updateProfile,
  applyToCompany,
  getMyApplications,
  getMyProfile, // ✅ CORRECT & EXISTS
} = require("../controllers/studentController");

const authMiddleware = require("../middleware/authMiddleware");

/* =======================
   STUDENT ROUTES
======================= */

// Create student profile
router.post(
  "/profile",
  authMiddleware("student"),
  createProfile
);

// Update student profile (e.g. for photo/resume)
router.put(
  "/profile",
  authMiddleware("student"),
  updateProfile
);

// Get logged-in student profile
router.get(
  "/me",
  authMiddleware("student"),
  getMyProfile
);

// Apply to a company
router.post("/apply/:companyId", authMiddleware("student"), applyToCompany);

// View my applications
router.get(
"/applications",
  authMiddleware("student"),
  getMyApplications
);

module.exports = router;
