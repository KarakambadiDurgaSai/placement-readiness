const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { submitComplaint } = require("../controllers/complaintController");

router.post(
  "/",
  authMiddleware("student"),
  submitComplaint
);

module.exports = router;
