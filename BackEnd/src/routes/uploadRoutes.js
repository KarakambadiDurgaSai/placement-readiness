const express = require("express");
const router = express.Router();

const upload = require("../middleware/uploadMiddleware");

// Upload profile photo
router.post("/profile-photo", upload.single("photo"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    return res.status(200).json({
      message: "Image uploaded successfully",
      imageUrl,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
});

router.post("/resume", upload.single("resume"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    return res.status(200).json({
      message: "Resume uploaded successfully",
      fileUrl,
    });
  } catch (error) {
    console.error("Resume Upload Error:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
});

module.exports = router;