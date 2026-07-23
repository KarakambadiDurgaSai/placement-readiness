const Application = require("../models/Application");
const Student = require("../models/Student");
const Company = require("../models/Company");

// CREATE OR UPDATE COMPANY PROFILE
exports.createCompanyProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const {
      companyName,
      companyEmail,
      location,
      hiringType,
      techHiringCount,
      nonTechHiringCount,
      roles,
      offerType,
      minimumPercentage,
      companyLogo
    } = req.body;

    // Required fields base check
    if (!companyName || !companyEmail || !location || !hiringType || !roles || !offerType) {
      return res.status(400).json({ message: "All required fields must be filled" });
    }

    // Role array check
    if (!Array.isArray(roles) || roles.length === 0) {
      return res.status(400).json({ message: "Select at least one role" });
    }

    // Conditional Count check
    if (hiringType === "tech") {
      if (!techHiringCount || techHiringCount < 1) return res.status(400).json({ message: "Enter valid tech hiring count" });
    } else if (hiringType === "non-tech") {
      if (!nonTechHiringCount || nonTechHiringCount < 1) return res.status(400).json({ message: "Enter valid non-tech hiring count" });
    } else if (hiringType === "both") {
      if (!techHiringCount || techHiringCount < 1 || !nonTechHiringCount || nonTechHiringCount < 1) {
        return res.status(400).json({ message: "Enter valid tech and non-tech hiring counts" });
      }
    }

    // Check if company already exists
    const existingCompany = await Company.findOne({ userId });
    
    if (existingCompany) {
      // Editable fields only setup
      existingCompany.hiringType = hiringType;
      existingCompany.roles = roles;
      existingCompany.offerType = offerType;
      existingCompany.minimumPercentage = minimumPercentage;

      if (hiringType === "tech") {
        existingCompany.techHiringCount = techHiringCount;
        existingCompany.nonTechHiringCount = undefined;
      } else if (hiringType === "non-tech") {
        existingCompany.techHiringCount = undefined;
        existingCompany.nonTechHiringCount = nonTechHiringCount;
      } else {
        existingCompany.techHiringCount = techHiringCount;
        existingCompany.nonTechHiringCount = nonTechHiringCount;
      }

      if (companyLogo) existingCompany.companyLogo = companyLogo;

      await existingCompany.save();

      return res.status(200).json({
        message: "Company profile updated successfully",
        profileStatus: existingCompany.profileStatus,
      });
    }

    // Create new profile
    const company = await Company.create({
      userId,
      companyName,
      companyEmail,
      location,
      hiringType,
      techHiringCount: hiringType === "tech" || hiringType === "both" ? techHiringCount : undefined,
      nonTechHiringCount: hiringType === "non-tech" || hiringType === "both" ? nonTechHiringCount : undefined,
      roles,
      offerType,
      minimumPercentage,
      companyLogo
    });

    return res.status(201).json({
      message: "Company profile created successfully",
      companyId: company._id
    });

  } catch (error) {
    console.error("Company Profile Error:", error);
    return res.status(500).json({
      message: "Server error"
    });
  }
};

/* =======================
   VERIFY COMPANY EMAIL
======================= */
exports.verifyCompanyEmail = async (req, res) => {
  try {
    const { companyEmail } = req.body;

    if (!companyEmail) {
      return res.status(400).json({
        message: "Company email is required",
      });
    }

    await Company.findOneAndUpdate(
      { companyEmail },
      { profileStatus: "verified" }
    );

    return res.status(200).json({
      message: "Company email verified successfully",
    });
  } catch (error) {
    console.error("Verify company email error:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

// GET ALL COMPANIES (FOR STUDENTS)
exports.getCompanyList = async (req, res) => {
  try {
    const companies = await Company.find(
      { isBlocked: { $ne: true }, profileStatus: "verified" }, 
      { 
        companyName: 1, 
        companyLogo: 1, 
        location: 1, 
        hiringType: 1, 
        minimumPercentage: 1,
        companyEmail: 1,
        roles: 1,
        offerType: 1
      }
    );

    res.status(200).json(companies);
  } catch (error) {
    console.error("Get company list error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET LOGGED-IN COMPANY PROFILE
exports.getMyCompanyProfile = async (req, res) => {
  try {
    const company = await Company.findOne({ userId: req.user.userId });

    if (!company) {
      return res.status(404).json({ message: "Company profile not found" });
    }

    res.status(200).json(company);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getCompanyApplicants = async (req, res) => {
  try {
    const company = await Company.findOne({ userId: req.user.userId });

    if (!company) {
      return res.status(404).json({ message: "Company profile not found" });
    }

    const applications = await Application.find({
      companyId: company._id,
    }).populate({
      path: "studentId",
      select:
        "firstName lastName collegeName roleType projects resume readinessScore collegeEmail phone",
    });

    const maxHiringLimit = (company.techHiringCount || 0) + (company.nonTechHiringCount || 0);

    const applicants = applications
      .filter((app) => app.studentId != null)
      .map((app) => {
        const student = app.studentId;
        return {
          applicationId: app._id,
          status: app.status,
          // Always visible
          name: `${student.firstName} ${student.lastName}`,
          college: student.collegeName,
          score: student.readinessScore,
          roleType: student.roleType || "Not Specified",
          projects: student.projects || [],
          resume: student.resume || null,
          // Privacy-gated: only after acceptance
          email: app.status === "accepted" ? student.collegeEmail : null,
          phone: app.status === "accepted" ? (student.phone || null) : null,
        };
      });

    res.status(200).json({
       maxHiringLimit,
       applicants
    });
  } catch (error) {
    console.error("Get applicants error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const application = await Application.findById(id).populate({
      path: "studentId",
      select:
        "firstName lastName collegeName roleType projects resume readinessScore collegeEmail phone",
    });

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }
    
    // Prevent state modifications to finalized records
    if (application.status === "accepted") {
      return res.status(400).json({ message: "Application is already finalized" });
    }

    const company = await Company.findById(application.companyId);
    
    if (status === "accepted") {
      // Calculate active acceptances
      const currentAccepted = await Application.countDocuments({
         companyId: application.companyId,
         status: "accepted"
      });
      
      const maxHiringLimit = (company.techHiringCount || 0) + (company.nonTechHiringCount || 0);

      if (currentAccepted >= maxHiringLimit) {
         return res.status(400).json({ message: "Hiring limit reached. Cannot accept more candidates." });
      }
    }

    application.status = status;
    await application.save();

    const student = application.studentId;

    res.status(200).json({
      message: `Application ${status} successfully`,
      applicationId: application._id,
      status: application.status,
      name: `${student.firstName} ${student.lastName}`,
      college: student.collegeName,
      score: student.readinessScore,
      roleType: student.roleType || "Not Specified",
      projects: student.projects || [],
      resume: student.resume || null,
      email: application.status === "accepted" ? student.collegeEmail : null,
      phone: application.status === "accepted" ? (student.phone || null) : null,
    });
  } catch (error) {
    console.error("Update application status error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
