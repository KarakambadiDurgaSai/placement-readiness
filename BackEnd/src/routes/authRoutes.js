const express = require("express");
const router = express.Router();

const {
  register,
  login,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

/* =======================
   AUTH ROUTES
======================= */

// Register
router.post("/register", register);

// Login
router.post("/login", login);

// Forgot password (send OTP)
router.post("/forgot-password", forgotPassword);

// Reset password (verify OTP + update password)
router.post("/reset-password", resetPassword);

module.exports = router;
