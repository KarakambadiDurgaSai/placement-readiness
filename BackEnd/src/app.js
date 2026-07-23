require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");


const app = express();

// DB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/student", require("./routes/studentRoutes"));
app.use("/api/company", require("./routes/companyRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
//app.use("/api/otp", require("./routes/otpRoutes"));
app.use("/api/complaints", require("./routes/complaintRoutes"));
app.use("/uploads", express.static("uploads"));
app.use("/api/upload", require("./routes/uploadRoutes"));
// Health check
app.get("/", (req, res) => {
  res.send("API running");
});

module.exports = app;
