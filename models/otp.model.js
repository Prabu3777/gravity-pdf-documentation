const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  username: String,
  otp: String,
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600 // 600 seconds = 10 minutes
  }
});

module.exports = mongoose.model("Otp", otpSchema);