const express = require("express");
const router = express.Router();

const {
  adminLogin,
  getDashboardStats,
  getAllStudents,
  verifyStudent,
  toggleBlockStudent,
  getAllCompanies,
  verifyCompany,
  toggleBlockCompany,
  getPlacementStats,
  getAllComplaints,
} = require("../controllers/adminController");

const adminMiddleware = require("../middleware/adminMiddleware");

// Public
router.post("/login", adminLogin);

// Protected
router.get("/dashboard", adminMiddleware, getDashboardStats);
router.get("/students", adminMiddleware, getAllStudents);
router.patch("/verify-student/:id", adminMiddleware, verifyStudent);
router.patch("/block-student/:id", adminMiddleware, toggleBlockStudent);
router.get("/companies", adminMiddleware, getAllCompanies);
router.patch("/verify-company/:id", adminMiddleware, verifyCompany);
router.patch("/block-company/:id", adminMiddleware, toggleBlockCompany);
router.get("/placement-stats", adminMiddleware, getPlacementStats);
router.get("/complaints", adminMiddleware, getAllComplaints);

module.exports = router;