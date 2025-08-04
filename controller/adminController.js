import adminModel from "../models/adminModel.js";
import { getDataUri } from "../utils/features.js";
import cloudinary from "cloudinary";

// register admin
export const adminRegister = async (req, res) => {
  try {
    const { name, email, password, address, city, country, phone, answer } =
      req.body;
    //validation
    if (
      !name ||
      !email ||
      !password ||
      !address ||
      !city ||
      !country ||
      !phone ||
      !answer
    ) {
      return res.status(400).send({
        success: false,
        message: "Please provide all fields",
      });
    }

    const normalizedEmail = email.toLowerCase();
    const existingUser = await adminModel.findOne({ email: normalizedEmail });
    //validation
    if (existingUser) {
      return res.status(400).send({
        success: false,
        message: "email already exist",
      });
    }

    const admin = new adminModel({
      name,
      email: normalizedEmail,
      password,
      address,
      city,
      country,
      phone,
      answer,
    });

    // Save the amin to the database
    await admin.save();
    res.status(201).send({
      success: true,
      message: "Registeration success, please login",
      admin,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).send({
        success: false,
        message: "Email already exists",
        error,
      });
    }
    // fallback for other errors
    return res.status(500).send({
      success: false,
      message: "Error in admin Register API",
      error: error.message,
    });
  }
};

// login for admin
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).send({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Find admin user (user with role 'admin')
    const admin = await adminModel.findOne({
      email,
    });

    // Admin validation
    if (!admin) {
      return res.status(404).send({
        success: false,
        message: "Admin not found or invalid credentials",
      });
    }

    // Check password
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).send({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate token
    const token = admin.generateToken();

    res
      .status(200)
      .cookie("token", token, {
        expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        secure: process.env.NODE_ENV === "production" ? true : false,
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      })
      .send({
        success: true,
        message: "Admin login successful",
        token,
        admin,
      });
  } catch (error) {
    console.log("Admin Login Error:", error);
    res.status(500).send({
      success: false,
      message: "Error in admin login API",
      error: error.message,
    });
  }
};
// };

// admin logout
export const adminLogout = async (req, res) => {
  try {
    res
      .status(200)
      .cookie("token", "", {
        expires: new Date(Date.now()),
        secure: process.env.NODE_ENV === "production" ? true : false,
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? true : false,
      })
      .send({
        success: true,
        message: "Logout successfully",
      });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in admin Logout API",
      error,
    });
  }
};

// admin profile
export const adminProfile = async (req, res) => {
  try {
    const admin = await adminModel.findById(req.admin._id);
    res.status(200).send({
      success: true,
      message: "admin profile fetched successfully",
      admin,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in admin profile api",
      error,
    });
  }
};

// admin update password
export const adminUpdatePassword = async (req, res) => {
  try {
    // get admin by id
    const admin = await adminModel.findById(req.admin._id);
    const { oldPassword, newPassword } = req.body;

    // validation
    if (!oldPassword || !newPassword) {
      return res.status(400).send({
        success: false,
        message: "Please provide old or new password",
      });
    }

    // old password check
    const isMatch = await admin.comparePassword(oldPassword);
    // validation
    if (!isMatch) {
      return res.status(404).send({
        success: false,
        message: "Invalid old password",
      });
    }
    admin.password = newPassword;
    await admin.save();
    res.status(200).send({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in admin update password api",
      error,
    });
  }
};

// update profile pic
export const updateProfilePic = async (req, res) => {
  try {
    const admin = await adminModel.findById(req.admin._id);

    // get file from fac
    const file = getDataUri(req.file);
    // del prev image
    if (admin.profilePic && admin.profilePic.public_id) {
      await cloudinary.v2.uploader.destroy(admin.profilePic.public_id);
    }

    // updat profile pic
    const cloudDb = await cloudinary.v2.uploader.upload(file.content);
    admin.profilePic = {
      public_id: cloudDb.public_id,
      url: cloudDb.secure_url,
    };
    //save func
    await admin.save();
    res.status(200).send({
      success: true,
      message: "Profile picture updated",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in profile pic update api",
    });
  }
};
