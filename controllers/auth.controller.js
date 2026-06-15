const OTP = require("../models/otp.model");
const bcrypt = require("bcryptjs");
const User = require("../models/user.model");
const cloudinary = require("cloudinary").v2;
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const {
  generateTokenAndSetCookie,
} = require("../lib/utils/generateToken");



exports.sendOtp = async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: "Username (email or mobile) is required",
      });
    }

    // Generate secure OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Hash OTP before storing
    const hashedOtp = await bcrypt.hash(otp, 10);

    // Store OTP with expiry (5 minutes)
    await OTP.findOneAndUpdate(
      { username },
      {
        $set: {
          otp: hashedOtp,
          expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        },
      },
      { upsert: true, new: true }
    );

    // Send via Email
    if (isEmail(username)) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: username,
        subject: "OTP Verification",
        html: `<h3>Your OTP is <b>${otp}</b></h3><p>Valid for 5 minutes.</p>`,
      });
    }

    // Send via SMS
    else if (isMobile(username)) {
      await client.messages.create({
        body: `Your OTP is ${otp}. Valid for 5 minutes.`,
        from: process.env.TWILIO_PHONE,
        to: username.startsWith("+") ? username : `+91${username}`,
      });
    }

    // Invalid input
    else {
      return res.status(400).json({
        success: false,
        message: "Invalid Email or Mobile Number",
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // App Password
  },
});
exports.sendOtp = async (req, res) => {
  try {
    const { username } = req.body;

    // Validate input
    if (!username) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Email validation (inside same file)
    const isEmail = (value) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    if (!isEmail(username)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address",
      });
    }

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Hash OTP
    const hashedOtp = await bcrypt.hash(otp, 10);

    // Save OTP (5 min expiry)
    await OTP.findOneAndUpdate(
      { username },
      {
        $set: {
          otp: hashedOtp,
          expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        },
      },
      { upsert: true, new: true }
    );

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: username,
      subject: "OTP Verification",
      html: `
        <h2>OTP Verification</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>Valid for 5 minutes</p>
      `,
    });

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


const isMobile = (value) => {
  return /^[0-9]{10}$/.test(value);
};


exports.verifyOtp = async (req, res) => {
  try {
    const { username, otp } = req.body;

    const otpRecord = await OTP.findOne({ username });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "OTP not found",
      });
    }

    // Check expiry
    if (new Date() > otpRecord.expiresAt) {
      await OTP.deleteOne({ username });

      return res.status(400).json({
        success: false,
        message: "OTP Expired",
      });
    }

    // Compare entered OTP with hashed OTP
    const isValidOtp = await bcrypt.compare(
      otp,
      otpRecord.otp
    );

    if (!isValidOtp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // Delete OTP after successful verification
    await OTP.deleteOne({ username });

    return res.status(200).json({
      success: true,
      message: "OTP Verified Successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.signup = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      username,
      password,
      role,
      joiningDate,
    } = req.body;

    const otpRecord = await OTP.findOne({ username });

    

    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Upload image to Cloudinary
    let imageUrl = "";

    if (req.file) {
      const uploadedImage = await cloudinary.uploader.upload(
        req.file.path,
        {
          folder: "twitter-clone",
        }
      );

      imageUrl = uploadedImage.secure_url;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName,
      lastName,
      username,
      password: hashedPassword,
      role,
      joiningDate,
      image: imageUrl, // Cloudinary URL stored in MongoDB
      otpVerified: true,
    });

    await OTP.deleteOne({ username });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User does not exist",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(400).json({
        success: false,
        message: "Invalid password",
      });
    }

    // Generate JWT and set cookie
    generateTokenAndSetCookie(user._id, res);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        role: user.role,
        image: user.image,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.logout=async (req,res)=>{
    try {
		res.cookie("jwt", "", { maxAge: 0 });
		res.status(200).json({ message: "Logged out successfully" });
	} catch (error) {
		console.log("Error in logout controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}

}

exports.getMe = async (req, res) => {
	try {
		const user = await User.findById(req.user._id).select("-password");
		res.status(200).json(user);
	} catch (error) {
		console.log("Error in getMe controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};
