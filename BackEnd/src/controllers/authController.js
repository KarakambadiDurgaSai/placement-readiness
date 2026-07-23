const User = require("../models/User");
const Otp = require("../models/Otp");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

/* =======================
   REGISTER
======================= */
exports.register = async (req, res) => {
  try {
    let { email, phone, password, role } = req.body;

    if (!email || !phone || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    email = email.toLowerCase().trim();
    phone = phone.trim();

    if (!["student", "company"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email or phone already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      email,
      phone,
      password: hashedPassword,
      role,
      isVerified: false,
      isBlocked: false,
    });

    return res.status(201).json({
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* =======================
   LOGIN
======================= */
exports.login = async (req, res) => {
  try {
    let { email, phone, password } = req.body;

    if ((!email && !phone) || !password) {
      return res
        .status(400)
        .json({ message: "Email/Phone and password are required" });
    }

    if (email) email = email.toLowerCase().trim();
    if (phone) phone = phone.trim();

    const user = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.isBlocked) {
      return res
        .status(403)
        .json({ message: "Your account is blocked" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      role: user.role,
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* =======================
   FORGOT PASSWORD
======================= */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    console.log("Forgot password request:", email);

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔑 remove previous EMAIL OTPs for this email
    await Otp.deleteMany({
      type: "email",
      target: normalizedEmail,
    });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // ✅ MATCHES YOUR SCHEMA
    await Otp.create({
      type: "email",              // ✅ VALID ENUM
      target: normalizedEmail,    // email goes here
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: normalizedEmail,
      subject: "Password Reset OTP",
      text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
    });

    return res.status(200).json({
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


/* =======================
   RESET PASSWORD
======================= */
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const otpRecord = await Otp.findOne({
      type: "email",             // ✅ MATCH ENUM
      target: normalizedEmail,
      otp,
    });

    if (!otpRecord) {
      return res
        .status(400)
        .json({ message: "Invalid or expired OTP" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.updateOne(
      { email: normalizedEmail },
      { password: hashedPassword }
    );

    // 🔑 cleanup OTP
    await Otp.deleteMany({
      type: "email",
      target: normalizedEmail,
    });

    return res.status(200).json({
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    return res.status(500).json({
      message: "Server error" });
  }
};
