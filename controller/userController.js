import userModel from "../models/userModel.js";
import cloudinary from "cloudinary";
import { getDataUri } from "../utils/features.js";
export const registerController = async (req, res) => {
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

    //check existing user
    const existingUser = await userModel.findOne({ email });
    //validation
    if (existingUser) {
      return res.status(500).send({
        success: false,
        message: "email already exist",
      });
    }

    const user = new userModel({
      name,
      email,
      password,
      address,
      city,
      country,
      phone,
      answer,
    });

    // Save the user to the database
    await user.save();
    res.status(201).send({
      success: true,
      message: "Registeration success, please login",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in register API",
      error,
    });
  }
};

//login function
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    //validation
    if (!email || !password) {
      return res.status(500).send({
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
      return res.status(500).send({
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
        secure: process.env.NODE_ENV === "development" ? true : false,
        httpOnly: process.env.NODE_ENV === "development" ? true : false,
        sameSite: process.env.NODE_ENV === "development" ? true : false,
      })
      .send({
        success: true,
        message: "Login successfully",
        token,
        user,
      });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Login API",
      error,
    });
  }
};

//get user profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    user.password = undefined;
    res.status(200).send({
      success: true,
      message: "User profile fetched successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in profile API",
      error,
    });
  }
};

//logout
export const logoutController = async (req, res) => {
  try {
    res
      .status(200)
      .cookie("token", "", {
        expires: new Date(Date.now()),
        secure: process.env.NODE_ENV === "development" ? true : false,
        httpOnly: process.env.NODE_ENV === "development" ? true : false,
        sameSite: process.env.NODE_ENV === "development" ? true : false,
      })
      .send({
        success: true,
        message: "logout successfully",
      });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Logout API",
      error,
    });
  }
};

//update user profile
export const updateProfileController = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    const { name, email, address, city, country, phone } = req.body;
    //validation + update
    if (name) user.name = name;
    if (email) user.email = email;
    if (address) user.address = address;
    if (city) user.city = city;
    if (country) user.country = country;
    if (phone) user.phone = phone;
    //save user
    await user.save();
    res.status(200).send({
      success: true,
      message: "user profile updated",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Update Profile API",
      error,
    });
  }
};

//update password controller
export const updatePasswordControll = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    const { oldPassword, newPassword } = req.body;
    //validation
    if (!oldPassword || !newPassword) {
      return res.status(500).send({
        success: false,
        message: "Please provide old or new password",
      });
    }
    //old password check
    const isMatch = await user.comparePassword(oldPassword);
    //validation
    if (!isMatch) {
      return res.status(500).send({
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
      message: "Error in Update Password API",
      error,
    });
  }
};

//update profile photo
export const updateProfilePhotoController = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    // get file from user
    const file = getDataUri(req.file);
    //delete prev image
    if (user.profilePic && user.profilePic.public_id) {
      await cloudinary.v2.uploader.destroy(user.profilePic.public_id);
    }
    //update
    const cloudDb = await cloudinary.v2.uploader.upload(file.content);
    user.profilePic = {
      public_id: cloudDb.public_id,
      url: cloudDb.secure_url,
    };
    //save func
    await user.save();
    res.status(200).send({
      success: true,
      message: "Profile pic updated",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Update Profile Photo API",
      error,
    });
  }
};

// forgot password
export const passwordResetController = async (req, res) => {
  try {
    // user get email || newPassword || answer
    const { email, newPassword, answer } = req.body;
    // validation
    if (!email || !newPassword || !answer) {
      res.status(500).send({
        success: false,
        message: "Please provide all fields",
      });
    }
    // find user
    const user = await userModel.findOne({ email, answer });
    //user validation
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Invalid user or answer",
      });
    }

    user.password = newPassword;
    await user.save();
    res.status(200).send({
      success: true,
      message: "Your password has been reset please login !",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in password reset api",
      error,
    });
  }
};
