const Otp = require("../models/Otp");
const Student = require("../models/Student");
const nodemailer = require("nodemailer");

/* =======================
   OTP GENERATOR
======================= */
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/* =======================
   SEND OTP (EMAIL)
======================= */
exports.sendOtp = async (req, res) => {
  try {
    const { collegeEmail } = req.body;

    if (!collegeEmail) {
      return res.status(400).json({
        message: "College email is required",
      });
    }

    // 1️⃣ Generate OTP
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // 2️⃣ Save OTP to DB
    await Otp.create({
      target: collegeEmail,
      otp,
      type: "email",
      expiresAt,
    });

    // 3️⃣ Configure Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // APP PASSWORD
      },
    });

    // 4️⃣ Email content
    const mailOptions = {
      from: `"Smart Placement Platform" <${process.env.EMAIL_USER}>`,
      to: collegeEmail,
      subject: "College Email Verification OTP",
      html: `
        <h2>Email Verification</h2>
        <p>Your OTP is:</p>
        <h1 style="letter-spacing: 4px;">${otp}</h1>
        <p>This OTP is valid for 10 minutes.</p>
        <br/>
        <p>Smart Placement Readiness Platform</p>
      `,
    };

    // 5️⃣ Send email (REAL OTP)
    await transporter.sendMail(mailOptions);

    // 6️⃣ Respond immediately (NO BLOCKING)
    return res.status(200).json({
      message: "OTP sent successfully to email",
    });
  } catch (error) {
    console.error("❌ Send OTP Error:", error);
    return res.status(500).json({
      message: "Failed to send OTP",
    });
  }
};

/* =======================
   VERIFY OTP
======================= */
exports.verifyOtp = async (req, res) => {
  try {
    let { email, otp, role } = req.body;

    if (!email || !otp || !role) {
      return res.status(400).json({
        message: "Email, OTP, and role are required",
      });
    }

    email = email.toLowerCase().trim();

    const otpRecord = await Otp.findOne({
      target: email,
      type: "email",
    });

    if (!otpRecord) {
      return res.status(400).json({
        message: "OTP not found or expired",
      });
    }

    if (otpRecord.otp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    if (role === "student") {
      await Student.findOneAndUpdate(
        { collegeEmail: email },
        { profileStatus: "verified" }
      );
    }

    if (role === "company") {
      const Company = require("../models/Company");
      await Company.findOneAndUpdate(
        { companyEmail: email },
        { profileStatus: "verified" }
      );
    }

    await Otp.deleteOne({ target: email, type: "email" });

    return res.status(200).json({
      message: `${role} email verified successfully`,
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};
