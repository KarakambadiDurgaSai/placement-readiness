
const Student = require("../models/Student");
const Application = require("../models/Application");
const Company = require("../models/Company");

/* =======================
   🔥 GLOBAL AVERAGE (VERIFIED)
======================= */
const calculateGlobalAverage = async () => {
  const students = await Student.find(
    { profileStatus: "verified" },
    "percentage"
  );

  if (!students.length) return 0;

  const total = students.reduce((sum, s) => sum + (s.percentage || 0), 0);
  return total / students.length;
};

/* =======================
   🔥 COLLEGE AVERAGE (VERIFIED)
======================= */
const calculateCollegeAverage = async (collegeName) => {
  const students = await Student.find(
    { collegeName, profileStatus: "verified" },
    "percentage"
  );

  if (!students.length) return { avg: 0, count: 0 };

  const total = students.reduce((sum, s) => sum + (s.percentage || 0), 0);

  return {
    avg: total / students.length,
    count: students.length,
  };
};

/* =======================
   CREATE STUDENT PROFILE
======================= */
exports.createProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    let {
      firstName,
      lastName,
      dob,
      state,
      address,
      personalEmail,
      phone,
      collegeName,
      collegeEmail,
      joinYear,
      passOutYear,
      degree,
      branch,
      percentage,
      skills,
      domain,
      roleType,
      projects,
      resume,
      profilePhoto,
    } = req.body;

    // Required fields check
    if (
      !firstName ||
      !lastName ||
      !dob ||
      !state ||
      !address ||
      !personalEmail ||
      !phone ||
      !collegeName ||
      !collegeEmail ||
      !joinYear ||
      !passOutYear ||
      !degree ||
      !branch ||
      percentage === undefined
    ) {
      return res.status(400).json({
        message: "All required fields must be filled",
      });
    }

    // Join year validation
    if (Number(joinYear) >= Number(passOutYear)) {
      return res.status(400).json({
        message: "Join year must be less than pass-out year",
      });
    }

    // Percentage validation
    if (percentage < 0 || percentage > 100) {
      return res.status(400).json({
        message: "Percentage must be between 0 and 100",
      });
    }

    /* =======================
       DOB FORMAT HANDLING
    ======================= */
    let formattedDob;

    if (typeof dob === "string" && dob.includes("/")) {
      const [day, month, year] = dob.split("/");
      formattedDob = new Date(`${year}-${month}-${day}`);
    } else {
      formattedDob = new Date(dob);
    }

    if (isNaN(formattedDob.getTime())) {
      return res.status(400).json({
        message: "Invalid DOB format. Use DD/MM/YYYY or YYYY-MM-DD",
      });
    }

    // Check if profile already exists
    const existingProfile = await Student.findOne({ userId });

    if (existingProfile) {
      return res.status(400).json({
        message: "Student profile already exists",
      });
    }


    // Create student profile
    const student = await Student.create({
      userId,
      firstName,
      lastName,
      dob: formattedDob,
      state,
      address,
      personalEmail,
      phone,
      collegeName,
      collegeEmail,
      joinYear,
      passOutYear,
      degree,
      branch,
      percentage,
      skills: skills || [],
      domain: domain || "tech",
      roleType: roleType || "",
      projects: Array.isArray(projects) ? projects : [],
      resume: resume || "",
      readinessScore: 0, 
      profilePhoto: profilePhoto || "",
      profileStatus: "pending",
    });

    return res.status(201).json({
      message: "Student profile created successfully",
      profileStatus: student.profileStatus,
      readinessScore: 0, // ✅ RETURN
    });
  } catch (error) {
    console.error("Create Profile Error:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

/* =======================
   UPDATE STUDENT PROFILE (For Photo/Resume)
======================= */
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const updateData = req.body;

    const student = await Student.findOne({ userId });

    if (!student) {
      return res.status(404).json({
        message: "Student profile not found",
      });
    }

    // Allow updating specific fields
    const allowedFields = [
      "firstName", "lastName", "dob", "state", "address", "personalEmail", 
      "phone", "collegeName", "collegeEmail", "joinYear", "passOutYear", 
      "degree", "branch", "percentage", "skills", "domain", "roleType", 
      "projects", "profilePhoto", "resume"
    ];

    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        student[field] = updateData[field];
      }
    });

    await student.save();

    return res.status(200).json({
      message: "Student profile updated successfully",
      student,
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

/* =======================
   APPLY TO COMPANY
======================= */
exports.applyToCompany = async (req, res) => {
  try {
    const studentUserId = req.user.userId;
    const companyId = req.params.companyId;

    const student = await Student.findOne({ userId: studentUserId });
    const company = await Company.findById(companyId);

    if (!student || !company) {
      return res.status(404).json({
        message: "Student or Company not found",
      });
    }

    /* ==========================
       ✅ 1. MAX 3 ACTIVE APPLICATIONS
    ========================== */
    const pendingCount = await Application.countDocuments({
      studentId: student._id,
      status: "pending",
    });

    if (pendingCount >= 3) {
      return res.status(400).json({
        message: "Maximum 3 active applications allowed",
      });
    }

    /* ==========================
       ✅ 2. ALREADY APPLIED
    ========================== */
    const alreadyApplied = await Application.findOne({
      studentId: student._id,
      companyId,
    });

    if (alreadyApplied) {
      return res.status(400).json({
        message: "Already applied to this company",
      });
    }

    /* ==========================
       ✅ 3. PERCENTAGE CHECK
    ========================== */
    const studentPercentage = Number(student.percentage);
    const minPercentage = Number(company.minimumPercentage || 0);

    if (studentPercentage < minPercentage) {
      return res.status(400).json({
        message: `Minimum ${minPercentage}% required`,
      });
    }

    /* ==========================
       ✅ 4. DOMAIN CHECK
    ========================== */
    if (student.domain !== company.hiringType) {
      return res.status(400).json({
        message: `Only ${company.hiringType} students can apply`,
      });
    }


    
    
    /* ==========================
       ✅ 6. CREATE APPLICATION
    ========================== */
    const application = await Application.create({
      studentId: student._id,
      companyId,
      status: "pending",
    });

    return res.status(201).json({
      message: "Application submitted successfully",
      application,
    });

  } catch (error) {
    console.error("Apply Error:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};
/* =======================
   VIEW MY APPLICATIONS
======================= */
exports.getMyApplications = async (req, res) => {
  try {
    const userId = req.user.userId;

    const student = await Student.findOne({ userId });

    if (!student) {
      return res.status(400).json({
        message: "Student profile not found",
      });
    }

    const applications = await Application.find({
      studentId: student._id,
    }).populate("companyId", "companyName companyEmail");

    const result = applications.map((app) => ({
      applicationId: app._id,
      companyId: app.companyId._id.toString(),
      companyName: app.companyId.companyName,
      status: app.status,
      companyEmail:
        app.status === "accepted" ? app.companyId.companyEmail : null,
    }));

    return res.status(200).json({
      count: result.length,
      applications: result,
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

/* =======================
   GET LOGGED-IN STUDENT PROFILE
======================= */
exports.getMyProfile = async (req, res) => {
  try {
    const student = await Student.findOne({
      userId: req.user.userId,
    });

    if (!student) {
      return res.status(404).json({
        message: "Student profile not found",
      });
    }

    return res.status(200).json(student);
  } catch (error) {
    console.error("Get Student Profile Error:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};
