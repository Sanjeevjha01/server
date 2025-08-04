import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import facultyModel from "../models/facultyModel.js";
import adminModel from "../models/adminModel.js";

// USER AUTH
export const isAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    // validation
    if (!token) {
      return res.status(401).send({
        success: false,
        message: "Unauthorized user",
      });
    }
    const decodeData = jwt.verify(token, process.env.JWT_SECRET);
    let user = await userModel.findById(decodeData.userId);

    // If not found in users, try admin model
    if (!user) {
      user = await adminModel.findById(decodeData.userId);
      if (user) {
        req.admin = user;
      }
    }

    if (!user) {
      return res.status(401).send({
        success: false,
        message: "User not found",
      });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).send({
      success: false,
      message: "Invalid token",
    });
  }
};

// FACULTY AUTH - Separate middleware for faculty
export const isFacAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    // validation
    if (!token) {
      return res.status(401).send({
        success: false,
        message: "Unauthorized faculty",
      });
    }
    const decodeData = jwt.verify(token, process.env.JWT_SECRET);
    // Look for faculty using facultyId (check your token structure)
    req.faculty = await facultyModel.findById(
      decodeData.facultyId || decodeData.userId
    );

    if (!req.faculty) {
      return res.status(401).send({
        success: false,
        message: "Faculty not found",
      });
    }
    next();
  } catch (error) {
    return res.status(401).send({
      success: false,
      message: "Invalid token",
    });
  }
};

// ADMIN AUTH
export const isAdmin = async (req, res, next) => {
  try {
    if (!req.admin) {
      return res.status(401).send({
        success: false,
        message: "Authentication required",
      });
    }

    if (req.admin.role !== "admin") {
      return res.status(403).send({
        success: false,
        message: "Admin access only",
      });
    }

    next();
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Error in admin authorization",
      error: error.message,
    });
  }
};
