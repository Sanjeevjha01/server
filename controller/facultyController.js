import facultyModel from "../models/facultyModel.js";
import { getDataUri } from "../utils/features.js";
import cloudinary from "cloudinary";

// register faculty
export const facultyRegister = async (req, res) => {
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
    const existingUser = await facultyModel.findOne({ email });
    //validation
    if (existingUser) {
      return res.status(400).send({
        success: false,
        message: "email already exist",
      });
    }

    const faculty = new facultyModel({
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
    await faculty.save();
    res.status(201).send({
      success: true,
      message: "Registeration success, please login",
      faculty,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Faculty Register API",
      error,
    });
  }
};

// login for faculty
export const facultyLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    // validation
    if (!email || !password) {
      return res.status(404).send({
        success: false,
        message: "Please add email or password",
      });
    }
    // check faculty
    const faculty = await facultyModel.findOne({ email });
    // faculty validation
    if (!faculty) {
      return res.status(404).send({
        success: false,
        message: "Faculty not found",
      });
    }
    //check password
    const isMatch = await faculty.comparePassword(password);
    if (!isMatch) {
      return res.status(500).send({
        success: false,
        message: "invalid credentials",
      });
    }
    //token
    const token = faculty.generateToken();
    res
      .status(200)
      .cookie("token", token, {
        expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        secure: process.env.NODE_ENV === "production" ? true : false,
        httpOnly: process.env.NODE_ENV === "production" ? true : false,
        sameSite: process.env.NODE_ENV === "production" ? true : false,
      })
      .send({
        success: true,
        message: "Login successfully",
        token,
        faculty,
      });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Faculty Login API",
      error,
    });
  }
};

// faculty logout
export const facultyLogout = async (req, res) => {
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
      message: "Error in Faculty Logout API",
      error,
    });
  }
};

// faculty profile
export const facultyProfile = async (req, res) => {
  try {
    const faculty = await facultyModel.findById(req.faculty._id);
    res.status(200).send({
      success: true,
      message: "Faculty profile fetched successfully",
      faculty,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in faculty profile api",
      error,
    });
  }
};

// faculty update password
export const facultyUpdatePassword = async (req, res) => {
  try {
    // get faculty by id
    const faculty = await facultyModel.findById(req.faculty._id);
    const { oldPassword, newPassword } = req.body;

    // validation
    if (!oldPassword || !newPassword) {
      return res.status(400).send({
        success: false,
        message: "Please provide old or new password",
      });
    }

    // old password check
    const isMatch = await faculty.comparePassword(oldPassword);
    // validation
    if (!isMatch) {
      return res.status(404).send({
        success: false,
        message: "Invalid old password",
      });
    }
    faculty.password = newPassword;
    await faculty.save();
    res.status(200).send({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in faculty update password api",
      error,
    });
  }
};

// update profile pic
export const updateProfilePic = async (req, res) => {
  try {
    const faculty = await facultyModel.findById(req.faculty._id);

    // get file from fac
    const file = getDataUri(req.file);
    // del prev image
    if (faculty.profilePic && faculty.profilePic.public_id) {
      await cloudinary.v2.uploader.destroy(faculty.profilePic.public_id);
    }

    // updat profile pic
    const cloudDb = await cloudinary.v2.uploader.upload(file.content);
    faculty.profilePic = {
      public_id: cloudDb.public_id,
      url: cloudDb.secure_url,
    };
    //save func
    await faculty.save();
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

// Delete faculty through admin
export const dropFaculty = async (req, res) => {
  try {
    // find faculty id
    const facultyId = req.params.id;
    const faculty = await facultyModel.findByIdAndDelete(facultyId);

    // validation\
    if (!faculty) {
      return res.status(404).send({
        success: false,
        message: "Faculty not found",
      });
    }
    res.status(200).send({
      success: true,
      message: "Faculty deleted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in delete faculty api",
      error,
    });
  }
};
