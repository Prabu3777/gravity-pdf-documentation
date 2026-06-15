const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },

    lastName: {
      type: String,
      required: true,
    },

    username: {
      type: String, // email or login username
      required: true,
      unique: true,
    },

    mobileNumber: {
      type: String,
      default: "",
      unique: true,
      sparse: true, // allows multiple docs with empty values
    },

    image: {
      type: String,
      default: "",
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["customer", "staff"],
      default: "customer",
    },

    joiningDate: {
      type: Date,
      default: Date.now,
    },

    isAdmin: {
      type: Boolean,
      default: false,
    },

    isSuperadmin: {
      type: Boolean,
      default: false,
    },

    premium_start_dt: {
      type: Date,
      default: null,
    },

    premium_end_date: {
      type: Date,
      default: null,
    },

    relievingDate: {
      type: Date,
      default: null,
    },

    admin_status: {
      type: String,
      default: "active",
    },

    otpVerified: {
      type: Boolean,
      default: false,
    },

    wishlist: {
      type: [mongoose.Schema.Types.Mixed], // JSON array
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", UserSchema);