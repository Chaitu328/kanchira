const bcrypt = require("bcrypt");
const User = require("../models/user");
const { sendEmail } = require("../middleware/nodeMailer");
const { generateOtp } = require("../middleware/authMiddleware");
const jwt = require("jsonwebtoken");
const { sendOtp } = require("../middleware/otpMiddleware");
const JWT_SECRET = process.env.JWT_SECRET_USER;
const Categories = require("../models/categories");
const subSubcategories = require("../models/sub-subcategories");
const subCategory = require("../models/subCategory");

exports.createUser = async (req, res) => {
  try {
    let { email, phone, password, name } = req.body;

    if (!phone) {
      return res.status(200).json({
        responseCode: 400,
        message: "Phone is required",
      });
    }

    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      if (!existingPhone.isVerified) {
        await User.findByIdAndDelete(existingPhone._id);
      } else {
        return res.status(200).json({
          responseCode: 400,
          message: "Phone number already in use. Please use another.",
        });
      }
    }

    const OTP = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("Generated OTP:", OTP);

    const sendOtpToMobile = await sendOtp(phone, OTP);
    console.log("OTP sent status:", sendOtpToMobile);

    if (sendOtpToMobile === false) {
      return res.status(500).json({
        responseCode: 500,
        message: "Failed to send OTP. Please try again.",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password || phone + Date.now(),
      10,
    );

    const user = new User({
      phone,
      email,
      name,
      password: hashedPassword,
      OTP,
      isVerified: false,
      OTPExpires: new Date(Date.now() + 10 * 60 * 1000),
    });

    await user.save();

    return res.status(200).json({
      responseCode: 200,
      message: "OTP sent successfully. Verify to complete registration.",
      userId: user._id,
    });
  } catch (error) {
    console.error("Error during user registration:", error);
    return res.status(500).json({
      responseCode: 500,
      message: "Registration failed",
      error: error.message,
    });
  }
};

exports.verifyUser = async (req, res) => {
  try {
    const { phone, OTP } = req.body;
    console.log(phone, OTP);

    if (!phone || !OTP) {
      return res
        .status(200)
        .json({ responseCode: 400, message: "Phone and OTP are required" });
    }

    const otpRecord = await User.findOne({ phone, OTP });

    if (!otpRecord) {
      return res
        .status(200)
        .json({ responseCode: 400, message: "Invalid or expired OTP" });
    }

    if (otpRecord.isVerified) {
      return res
        .status(200)
        .json({ responseCode: 400, message: "OTP already used" });
    }

    if (otpRecord.OTPExpires && otpRecord.OTPExpires < new Date()) {
      return res.status(200).json({
        responseCode: 400,
        message: "OTP has expired. Please request a new one.",
      });
    }

    const updatedUser = await User.findOneAndUpdate(
      { phone },
      { isVerified: true, OTP: "", OTPExpires: null },
      { new: true },
    );

    if (!updatedUser) {
      return res.status(500).json({
        responseCode: 500,
        message: "Failed to update user verification status",
      });
    }

    res
      .status(200)
      .json({ responseCode: 200, message: "User verified successfully" });
  } catch (error) {
    console.error("OTP Verification Error:", error);
    res.status(500).json({
      responseCode: 500,
      message: "Verification failed",
      error: error.message,
    });
  }
};

exports.resendOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res
        .status(200)
        .json({ responseCode: 400, message: "Phone is required" });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res
        .status(200)
        .json({ responseCode: 400, message: "User not found" });
    }

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    user.OTP = newOtp;
    user.OTPExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    const sent = await sendOtp(phone, newOtp);
    if (sent === false) {
      return res
        .status(500)
        .json({ responseCode: 500, message: "Failed to resend OTP" });
    }

    res
      .status(200)
      .json({ responseCode: 200, message: "OTP resent successfully" });
  } catch (error) {
    console.error("Error resending OTP:", error);
    res
      .status(500)
      .json({ responseCode: 500, message: "Failed to resend OTP" });
  }
};

exports.userLogin = async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;

    if (!emailOrPhone || !password) {
      return res.status(400).json({
        responseCode: 400,
        message: "Email/Phone and Password are required",
      });
    }

    let user;
    if (emailOrPhone.includes("@")) {
      user = await User.findOne({ email: emailOrPhone.toLowerCase() });
    } else {
      user = await User.findOne({ phone: emailOrPhone });
    }

    if (!user) {
      return res
        .status(400)
        .json({ responseCode: 400, message: "User not found" });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        responseCode: 400,
        message: "Please verify your phone number before logging in.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ responseCode: 400, message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      responseCode: 200,
      message: "Login successful",
      token,
      userId: user._id,
      name: user.name,
      phone: user.phone,
      email: user.email,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ responseCode: 500, message: "Internal server error" });
  }
};

exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const otp = generateOtp();
    user.OTP = otp;
    user.OTPExpires = new Date(Date.now() + 300000);
    await user.save();

    await sendEmail(email, "OTP Verification", `Your OTP is: ${otp}`);

    res.status(200).json({ message: "OTP sent to your email.", otp });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

exports.VerifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.OTP !== otp || user.OTPExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    user.OTP = undefined;
    user.OTPExpires = undefined;
    await user.save();

    res.status(200).json({ message: "OTP verified successfully.", email });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

exports.setPassword = async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password set successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

exports.updateUser = async (req, res) => {
  try {
    // ✅ FIX: route is PUT /user/update/:id — get userId from req.params
    const userId = req.params.id;
    const { name, email, phone } = req.body;

    if (!name && !email && !phone) {
      return res.status(400).json({
        responseCode: 400,
        message: "At least one field (name, email, or phone) is required for update",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ responseCode: 404, message: "User not found" });
    }

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({
          responseCode: 400,
          message: "Email already in use by another account",
        });
      }
    }

    if (phone && phone !== user.phone) {
      const phoneExists = await User.findOne({ phone });
      if (phoneExists) {
        return res.status(400).json({
          responseCode: 400,
          message: "Phone number already in use by another account",
        });
      }
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;

    await user.save();

    res.status(200).json({
      responseCode: 200,
      message: "User updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res
      .status(500)
      .json({ responseCode: 500, message: "Server error while updating user" });
  }
};

exports.getSearchSlugs = async (req, res) => {
  try {
    const categories = await Categories.find({}, "slug _id");
    const subCategories = await subCategory.find({}, "slug categoryId");
    const subSubCategories = await subSubcategories.find({}, "slug categoryId");

    const slugs = [
      ...categories.map((cat) => ({
        slug: cat.slug,
        categoryId: cat._id.toString(),
        type: "category",
      })),
      ...subCategories.map((sub) => ({
        slug: sub.slug,
        categoryId: sub.categoryId.toString(),
        type: "subCategory",
      })),
      ...subSubCategories.map((subSub) => ({
        slug: subSub.slug,
        categoryId: subSub.categoryId.toString(),
        type: "subSubCategory",
      })),
    ];

    res.status(200).json({
      responseCode: 200,
      message: "All slugs retrieved successfully",
      slugs,
    });
  } catch (error) {
    console.error("Error retrieving slugs:", error);
    res.status(500).json({
      responseCode: 500,
      message: "Server error while retrieving slugs",
    });
  }
};

exports.getAllusers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({
      responseCode: 200,
      message: "All Users retrieved successfully",
      users,
    });
  } catch (error) {
    console.error("Error retrieving users:", error);
    res.status(200).json({
      responseCode: 500,
      message: "Server error while retrieving users",
    });
  }
};

exports.deleteUserById = async (req, res) => {
  try {
    // ✅ FIX: route is DELETE /user/:id — read from req.params, not req.body
    const userId = req.params.id;

    if (!userId) {
      return res
        .status(400)
        .json({ responseCode: 400, message: "User ID is required" });
    }

    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res
        .status(404)
        .json({ responseCode: 404, message: "User not found" });
    }

    res.status(200).json({
      responseCode: 200,
      message: "User deleted successfully",
      deletedUser,
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      responseCode: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.getProfileUser = async (req, res) => {
  try {
    // ✅ FIX: route is GET /user/profile/:id — read from req.params, not req.body
    const userId = req.params.id;

    if (!userId) {
      return res
        .status(400)
        .json({ responseCode: 400, message: "User ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ responseCode: 404, message: "User not found" });
    }

    res.status(200).json({
      responseCode: 200,
      user,
      message: "User Details Fetched Successfully",
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      responseCode: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};