import cloudinary from "cloudinary";
import userModel from "../models/userModel.js";
import { getDataUri } from "../utils/features.js";

// register controller
export const registerController = async (req, res) => {
  try {
    const { name, email, password, address, city, country, phone } = req.body;

    // validation
    if (
      !name ||
      !email ||
      !password ||
      !address ||
      !city ||
      !country ||
      !phone
    ) {
      return res.status(400).send({
        success: false,
        message: "Please Provide all fields",
      });
    }

    // check existing user
    const existingUser = await userModel.findOne({ email });

    // validation
    if (existingUser) {
      return res.status(409).send({
        success: false,
        message: "Email already exist",
      });
    }

    // required to create user
    const user = await userModel.create({
      name,
      email,
      password,
      address,
      city,
      country,
      phone,
    });

    // save the user to the database
    await user.save();
    res.status(201).send({
      success: true,
      message: "Registration success, please login",
      user,
    });
  } catch (error) {
    console.log(`Register Error is ${error}`);
    res.status(500).send({
      success: false,
      message: "Error in register api",
      error: error.message,
    });
  }
};

// login controller
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    //validation
    if (!email || !password) {
      return res.status(400).send({
        success: false,
        message: "Please add email or password",
      });
    }
    //check user
    const user = await userModel.findOne({ email });
    //user validation
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "user not found",
      });
    }
    //check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).send({
        success: false,
        message: "invalid credentials",
      });
    }
    //token
    const token = user.generateToken();
    res
      .status(200)
      .cookie("token", token, {
        expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        secure: process.env.NODE_ENV === "production" ? true : false,
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      })
      .send({
        success: true,
        message: "Login successfully",
        token,
        user: { ...user._doc, role: "user" }, 
      });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Login API",
      error: error.message,
    });
  }
};

// logout user controller
export const logoutController = async (req, res) => {
  try {
    res
      .status(200)
      .cookie("token", "", {
        expires: new Date(Date.now()),
        secure: process.env.NODE_ENV === "production" ? true : false,
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      })
      .send({
        success: true,
        message: "Logout successfull",
      });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in logout user api",
    });
  }
};

// get user profile
export const getUserProfileController = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    res.status(200).send({
      success: true,
      message: "User profile fetched successfully",
      user,
    });
  } catch (error) {
    console.log(error);

    res.status(500).send({
      success: false,
      message: "Error in get user profile api",
      error: error.message,
    });
  }
};

// update password controller
export const updatePassController = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    const { oldPassword, newPassword } = req.body;
    // validation
    if (!oldPassword || !newPassword) {
      return res.status(404).send({
        success: false,
        message: "Please provide old or new password",
      });
    }
    // old password check
    const isMatch = await user.comparePassword(oldPassword);
    // validation
    if (!isMatch) {
      return res.status(404).send({
        success: false,
        message: "Invalid old password",
      });
    }
    user.password = newPassword;
    await user.save();
    res.status(200).send({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).send({
      success: false,
      message: "Error in update password api",
      error: error.message,
    });
  }
};

// update user profile photo
export const updatePicController = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    // getting file from user
    const file = getDataUri(req.file);
    // del prev image
    if (user.profilePic && user.profilePic.public_id) {
      await cloudinary.v2.uploader.destroy(user.profilePic.public_id);
    }
    // update
    const cdb = await cloudinary.v2.uploader.upload(file.content);
    user.profilePic = {
      public_id: cdb.public_id,
      url: cdb.secure_url,
    };
    // save func
    await user.save();
    res.status(200).send({
      success: true,
      message: "Profile picture updated",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in update profile pic api",
      error: error.message,
    });
  }
};

// Delete user through admin
export const dropUser = async (req, res) => {
  try {
    // find user id
    const userId = req.params.id;
    const user = await userModel.findByIdAndDelete(userId);

    // validation\
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "user not found",
      });
    }
    res.status(200).send({
      success: true,
      message: "user deleted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in delete user api",
      error,
    });
  }
};

