const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getCompanyApplicants,
  updateApplicationStatus,
} = require("../controllers/companyController");

const {
  createCompanyProfile,
  getMyCompanyProfile,
  verifyCompanyEmail,
  getCompanyList,
} = require("../controllers/companyController");

/* =======================
   COMPANY ROUTES
======================= */

// CREATE company profile (company only)
router.post(
  "/profile",
  authMiddleware("company"),
  createCompanyProfile
);

// ✅ GET logged-in company profile
router.get(
  "/me",
  authMiddleware("company"),
  getMyCompanyProfile
);

// VERIFY company email (OTP)
router.post(
  "/verify-email",
  authMiddleware("company"),
  verifyCompanyEmail
);

// STUDENT: get company list
router.get(
  "/list",
  getCompanyList
);

// Company → view applicants
router.get(
  "/applicants",
  authMiddleware("company"),
  getCompanyApplicants
);

// Company → accept / reject
router.patch(
  "/applications/:id",
  authMiddleware("company"),
  updateApplicationStatus
);

module.exports = router;
