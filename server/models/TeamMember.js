const mongoose = require("mongoose");

const TeamMemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name"],
    trim: true,
  },
  role: {
    type: String,
    required: [true, "Please provide a role"],
    trim: true,
  },
  image: {
    type: String,
    required: [true, "Please provide an image URL"],
  },
  animation: {
    type: String,
    enum: ["left", "right", "top", "down"],
    default: "left",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  order: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
TeamMemberSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("TeamMember", TeamMemberSchema);
