const express = require("express");
const router = express.Router();
const { applyToCompany } = require("../controllers/applicationController");
const authMiddleware = require("../middleware/authMiddleware");

// Student applies to company
router.post(
  "/apply",
  authMiddleware("student"),
  applyToCompany
);

module.exports = router;
