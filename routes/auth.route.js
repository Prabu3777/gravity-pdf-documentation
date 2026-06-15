const express = require("express");

const {
  signup,
  sendOtp,
  verifyOtp,
  login,
  logout,
  getMe
} = require("../controllers/auth.controller");

const {protectRoute} = require("../middleware/protectedRoute")

const router = express.Router();

router.post("/signup", signup);
router.post("/sendOtp", sendOtp);
router.post("/verifyOtp", verifyOtp);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me",protectRoute, getMe);

module.exports = router;