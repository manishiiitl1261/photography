const TeamMember = require("../models/TeamMember");
const logger = require("../utils/logger");
const { deleteImage, getPublicIdFromUrl } = require("../config/cloudinary");

/**
 * Get all team members
 * Public route
 */
exports.getAllTeamMembers = async (req, res) => {
  try {
    // For public API, only return active members sorted by order
    const members = await TeamMember.find({ isActive: true }).sort({
      order: 1,
      createdAt: 1,
    });

    res.status(200).json({
      success: true,
      count: members.length,
      members,
    });
  } catch (error) {
    logger.error("Error fetching team members:", error);
    res.status(500).json({
      success: false,
      message: "Unable to fetch team members, please try again later",
      error: error.message,
    });
  }
};

/**
 * Get all team members including inactive (admin only)
 */
exports.getAllTeamMembersAdmin = async (req, res) => {
  try {
    // Support pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Support search by name or role
    const searchQuery = {};
    if (req.query.search) {
      const search = req.query.search;
      searchQuery.$or = [
        { name: { $regex: search, $options: "i" } },
        { role: { $regex: search, $options: "i" } },
      ];
    }

    // Support filtering by active status
    if (req.query.isActive !== undefined) {
      searchQuery.isActive = req.query.isActive === "true";
    }

    // Get total count for pagination
    const totalMembers = await TeamMember.countDocuments(searchQuery);

    // Get members with pagination
    const members = await TeamMember.find(searchQuery)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: members.length,
      totalMembers,
      totalPages: Math.ceil(totalMembers / limit),
      currentPage: page,
      members,
    });
  } catch (error) {
    logger.error("Error fetching all team members for admin:", error);
    res.status(500).json({
      success: false,
      message: "Unable to fetch team members, please try again later",
      error: error.message,
    });
  }
};

/**
 * Get a single team member by ID
 */
exports.getTeamMember = async (req, res) => {
  try {
    const member = await TeamMember.findById(req.params.id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Team member not found",
      });
    }

    res.status(200).json({
      success: true,
      member,
    });
  } catch (error) {
    logger.error(`Error fetching team member with ID ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: "Unable to fetch team member, please try again later",
      error: error.message,
    });
  }
};

/**
 * Create a new team member (admin only)
 */
exports.createTeamMember = async (req, res) => {
  try {
    const { name, role, animation, isActive, order } = req.body;

    logger.info("Creating new team member:", {
      body: req.body,
      file: req.file
        ? {
            filename: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype,
          }
        : "No file uploaded",
    });

    // Validate required fields
    if (!name || !role) {
      return res.status(400).json({
        success: false,
        message: "Please provide name and role",
      });
    }

    // Check if image was uploaded via Cloudinary
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an image",
      });
    }

    // Get image URL from Cloudinary upload
    const image = req.file.path;
    logger.info("Cloudinary upload successful:", { path: image });

    const member = await TeamMember.create({
      name,
      role,
      image,
      animation: animation || "left",
      isActive: isActive !== undefined ? isActive : true,
      order: order || 0,
    });

    logger.info("Team member created successfully:", { id: member._id });

    res.status(201).json({
      success: true,
      message: "Team member created successfully",
      member,
    });
  } catch (error) {
    logger.error("Error creating team member:", error);

    // Check if error is from Cloudinary
    if (error.message && error.message.includes("Cloudinary")) {
      return res.status(500).json({
        success: false,
        message:
          "Unable to upload image to Cloudinary. Please try a different image or check Cloudinary configuration.",
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Unable to create team member, please try again later",
      error: error.message,
    });
  }
};

/**
 * Update a team member (admin only)
 */
exports.updateTeamMember = async (req, res) => {
  try {
    const { name, role, animation, isActive, order } = req.body;

    let member = await TeamMember.findById(req.params.id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Team member not found",
      });
    }

    // Prepare update data
    const updateData = {
      updatedAt: Date.now(),
    };

    // Update basic fields if provided
    if (name) updateData.name = name;
    if (role) updateData.role = role;
    if (animation) updateData.animation = animation;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (order !== undefined) updateData.order = order;

    // If a new image is uploaded, delete the old one from Cloudinary
    if (req.file) {
      // If there's an existing image in Cloudinary, delete it
      if (member.image && member.image.includes("cloudinary.com")) {
        try {
          const publicId = getPublicIdFromUrl(member.image);
          if (publicId) {
            logger.info(`Deleting old team member image: ${publicId}`);
            await deleteImage(publicId);
          }
        } catch (cloudinaryError) {
          logger.error(
            "Error deleting old team member image:",
            cloudinaryError
          );
          // Continue with update even if image deletion fails
        }
      }

      // Update with new Cloudinary image URL
      updateData.image = req.file.path;
    }

    // Update the member
    member = await TeamMember.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Team member updated successfully",
      member,
    });
  } catch (error) {
    logger.error(`Error updating team member with ID ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: "Unable to update team member, please try again later",
      error: error.message,
    });
  }
};

/**
 * Delete a team member (admin only)
 */
exports.deleteTeamMember = async (req, res) => {
  try {
    const member = await TeamMember.findById(req.params.id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Team member not found",
      });
    }

    // Delete the associated image from Cloudinary if it exists
    if (member.image && member.image.includes("cloudinary.com")) {
      try {
        const publicId = getPublicIdFromUrl(member.image);
        if (publicId) {
          logger.info(`Deleting team member image: ${publicId}`);
          await deleteImage(publicId);
        }
      } catch (cloudinaryError) {
        logger.error("Error deleting team member image:", cloudinaryError);
        // Continue with deletion even if image deletion fails
      }
    }

    await member.deleteOne();

    res.status(200).json({
      success: true,
      message: "Team member deleted successfully",
    });
  } catch (error) {
    logger.error(`Error deleting team member with ID ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: "Unable to delete team member, please try again later",
      error: error.message,
    });
  }
};
