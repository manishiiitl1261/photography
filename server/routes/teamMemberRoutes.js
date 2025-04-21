const express = require("express");
const router = express.Router();
const { adminAuth } = require("../middleware/adminAuth");
const { teamMemberUpload, cloudinary } = require("../config/cloudinary");
const logger = require("../utils/logger");
const TeamMember = require("../models/TeamMember");

const {
  getAllTeamMembers,
  getAllTeamMembersAdmin,
  getTeamMember,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
} = require("../controllers/teamMemberController");

// Public routes
router.get("/", getAllTeamMembers);
router.get("/:id", getTeamMember);

// Diagnostic route for testing Cloudinary uploads directly
router.post(
  "/test-upload",
  adminAuth,
  teamMemberUpload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      logger.info("Test file upload successful:", {
        file: req.file.originalname,
        size: req.file.size,
        cloudinaryPath: req.file.path,
      });

      return res.status(200).json({
        success: true,
        message: "File uploaded successfully",
        imageUrl: req.file.path,
      });
    } catch (error) {
      logger.error("Test upload error:", error);
      return res.status(500).json({
        success: false,
        message: "Error uploading file",
        error: error.message,
      });
    }
  }
);

// Admin routes - protected
router.get("/admin/all", adminAuth, getAllTeamMembersAdmin);
router.post("/", adminAuth, teamMemberUpload.single("image"), createTeamMember);
router.put(
  "/:id",
  adminAuth,
  teamMemberUpload.single("image"),
  updateTeamMember
);
router.delete("/:id", adminAuth, deleteTeamMember);

module.exports = router;
