// File: models/User.js

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    default: 0, // 🎯 This is used for leaderboard
  }
}, {
  timestamps: true, // optional: adds createdAt and updatedAt
});

const User = mongoose.model("User", userSchema);

module.exports = User;
