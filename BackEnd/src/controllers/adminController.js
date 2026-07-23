const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Student = require("../models/Student");
const Company = require("../models/Company");
const Application = require("../models/Application");
const Complaint = require("../models/Complaint");

/* =======================
   ADMIN LOGIN
======================= */
exports.adminLogin = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ message: "Request body missing" });
    }

    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (admin.isBlocked === true) {
      return res.status(403).json({ message: "Admin account is blocked" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { adminId: admin._id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      message: "Admin login successful",
      token,
    });

  } catch (error) {
    console.error("Admin Login Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* =======================
   ADMIN DASHBOARD STATS
======================= */
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await Student.countDocuments();
    const totalCompanies = await Company.countDocuments();
    const totalApplications = await Application.countDocuments();

    return res.status(200).json({
      totalUsers,
      totalStudents,
      totalCompanies,
      totalApplications,
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* =======================
   GET ALL STUDENTS (ADMIN) — minimal safe fields only
======================= */
exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().select(
      "userId firstName lastName collegeName collegeEmail passOutYear percentage profileStatus resume projects"
    );

    // Get all userIds to batch-fetch blocked status
    const userIds = students.map((s) => s.userId).filter(Boolean);
    const users = await User.find({ _id: { $in: userIds } }).select("_id isBlocked");
    const userBlockMap = {};
    users.forEach((u) => { userBlockMap[u._id.toString()] = u.isBlocked; });

    const result = students.map((s) => {
      const emailParts = s.collegeEmail.split("@");
      const masked = emailParts[0].slice(0, 2) + "***@" + (emailParts[1] || "");
      const isBlocked = s.userId ? (userBlockMap[s.userId.toString()] || false) : false;

      return {
        id: s._id,
        userId: s.userId,
        name: `${s.firstName} ${s.lastName}`,
        collegeName: s.collegeName,
        maskedEmail: masked,
        passOutYear: s.passOutYear,
        percentage: s.percentage,
        profileStatus: s.profileStatus,
        resumeUploaded: !!s.resume,
        projectsAdded: s.projects && s.projects.length > 0,
        isBlocked,
      };
    });

    return res.status(200).json({ count: result.length, students: result });
  } catch (error) {
    console.error("Get Students Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* =======================
   VERIFY STUDENT (ADMIN)
======================= */
exports.verifyStudent = async (req, res) => {
  try {
    const studentId = req.params.id;
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (student.profileStatus === "verified") {
      return res.status(400).json({ message: "Student already verified" });
    }

    student.profileStatus = "verified";
    await student.save();

    // Recalculate readiness scores for all verified students
    // Get all verified students
    const verifiedStudents = await Student.find({
      profileStatus: "verified",
    }).select("_id percentage collegeName");

    if (verifiedStudents.length === 0) {
      return res.status(200).json({
        message: "Student verified successfully",
      });
    }

    // Overall Average
    const overallAverage =
      verifiedStudents.reduce((sum, s) => sum + (s.percentage || 0), 0) /
      verifiedStudents.length;

    // Group by college
    const collegeMap = {};

    for (const student of verifiedStudents) {
      const college = (student.collegeName || "").trim().toLowerCase();

      if (!collegeMap[college]) {
        collegeMap[college] = [];
      }

      collegeMap[college].push(student);
    }

    const bulkUpdates = [];

    // Calculate readiness score
    for (const college in collegeMap) {
      const students = collegeMap[college];

      // Less than 10 verified students -> no normalization
      if (students.length < 10) {
        for (const student of students) {
          bulkUpdates.push({
            updateOne: {
              filter: { _id: student._id },
              update: {
                $set: {
                  readinessScore: Math.round(student.percentage || 0),
                },
              },
            },
          });
        }
        continue;
      }

      // College Average
      const collegeAverage =
        students.reduce((sum, s) => sum + (s.percentage || 0), 0) /
        students.length;

      // Adjustment
      const adjustment = overallAverage - collegeAverage;

      // Update students
      for (const student of students) {
        let readiness = (student.percentage || 0) + adjustment;

        readiness = Math.round(readiness);

        readiness = Math.max(0, Math.min(100, readiness));

        bulkUpdates.push({
          updateOne: {
            filter: { _id: student._id },
            update: {
              $set: {
                readinessScore: readiness,
              },
            },
          }
        });
      }
    }

    // Bulk update
    if (bulkUpdates.length > 0) {
      await Student.bulkWrite(bulkUpdates);
    }

    return res.status(200).json({
      message: "Student verified successfully",
    });
  } catch (error) {
    console.error("Verify Student Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* =======================
   BLOCK / UNBLOCK STUDENT
======================= */
exports.toggleBlockStudent = async (req, res) => {
  try {
    // Block is handled at User level — Student has no isBlocked field
    const student = await Student.findById(req.params.id).select("userId");
    if (!student) return res.status(404).json({ message: "Student not found" });
    if (!student.userId) return res.status(400).json({ message: "Student has no linked user account" });

    const user = await User.findById(student.userId);
    if (!user) return res.status(404).json({ message: "Linked user account not found" });

    user.isBlocked = !user.isBlocked;
    await user.save();

    return res.status(200).json({
      message: user.isBlocked ? "Student blocked successfully" : "Student unblocked successfully",
      isBlocked: user.isBlocked,
    });
  } catch (error) {
    console.error("Block Student Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* =======================
   GET ALL COMPANIES (ADMIN)
======================= */
exports.getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.find().select(
      "userId companyName companyEmail location hiringType techHiringCount nonTechHiringCount profileStatus isBlocked"
    );

    // Batch-fetch user blocked states
    const userIds = companies.map((c) => c.userId).filter(Boolean);
    const users = await User.find({ _id: { $in: userIds } }).select("_id isBlocked");
    const userBlockMap = {};
    users.forEach((u) => { userBlockMap[u._id.toString()] = u.isBlocked; });

    const result = companies.map((c) => {
      const emailParts = c.companyEmail.split("@");
      const masked = emailParts[0].slice(0, 2) + "***@" + (emailParts[1] || "");
      const totalCount = (c.techHiringCount || 0) + (c.nonTechHiringCount || 0);
      // Use Company.isBlocked OR User.isBlocked (whichever is set)
      const isBlockedViaUser = c.userId ? (userBlockMap[c.userId.toString()] || false) : false;
      const isBlocked = c.isBlocked || isBlockedViaUser;

      return {
        id: c._id,
        userId: c.userId,
        companyName: c.companyName,
        maskedEmail: masked,
        location: c.location,
        hiringType: c.hiringType,
        hiringCount: totalCount,
        profileStatus: c.profileStatus,
        isBlocked,
      };
    });

    return res.status(200).json({ count: result.length, companies: result });
  } catch (error) {
    console.error("Get Companies Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* =======================
   VERIFY COMPANY (ADMIN)
======================= */
exports.verifyCompany = async (req, res) => {
  try {
    const companyId = req.params.id;
    const company = await Company.findById(companyId);

    if (!company) return res.status(404).json({ message: "Company not found" });
    if (company.profileStatus === "verified") return res.status(400).json({ message: "Company already verified" });

    company.profileStatus = "verified";
    await company.save();

    return res.status(200).json({ message: "Company verified successfully" });
  } catch (error) {
    console.error("Verify Company Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* =======================
   BLOCK / UNBLOCK COMPANY
======================= */
exports.toggleBlockCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id).select("userId isBlocked");
    if (!company) return res.status(404).json({ message: "Company not found" });

    // Toggle on Company.isBlocked AND User.isBlocked
    const newBlockState = !company.isBlocked;
    company.isBlocked = newBlockState;
    await company.save();

    if (company.userId) {
      await User.findByIdAndUpdate(company.userId, { isBlocked: newBlockState });
    }

    return res.status(200).json({
      message: newBlockState ? "Company blocked successfully" : "Company unblocked successfully",
      isBlocked: newBlockState,
    });
  } catch (error) {
    console.error("Block Company Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* =======================
   PLACEMENT STATS (ADMIN)
======================= */
exports.getPlacementStats = async (req, res) => {
  try {
    const stats = await Application.aggregate([
      {
        $group: {
          _id: { companyId: "$companyId", status: "$status" },
          count: { $sum: 1 },
        },
      },
    ]);

    const companyMap = {};

    for (let item of stats) {
      const companyId = item._id.companyId.toString();

      if (!companyMap[companyId]) {
        const company = await Company.findById(companyId).select("companyName");
        companyMap[companyId] = {
          companyName: company?.companyName || "Unknown",
          accepted: 0,
          rejected: 0,
          pending: 0,
        };
      }

      companyMap[companyId][item._id.status] = item.count;
    }

    const result = Object.values(companyMap);
    return res.status(200).json({ count: result.length, stats: result });
  } catch (error) {
    console.error("Placement Stats Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* =======================
   GET ALL COMPLAINTS (ADMIN)
======================= */
exports.getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("studentId", "firstName lastName")
      .populate("companyId", "companyName");

    const result = complaints.map((c) => ({
      id: c._id,
      reportedCompany: c.companyId?.companyName || "Unknown",
      reportedBy: c.studentId
        ? `${c.studentId.firstName} ${c.studentId.lastName}`
        : "Unknown",
      reason: c.reason,
      createdAt: c.createdAt,
    }));

    return res.status(200).json({ count: result.length, complaints: result });
  } catch (error) {
    console.error("Get Complaints Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};