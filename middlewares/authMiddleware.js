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
  if (req.user.role !== "faculty") {
    return res.status(401).send({
      success: false,
      message: "Unauthorized Faculty",
    });
  }
  next();
};

// ADMIN AUTH
export const isAdmin = async (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(401).send({
      success: false,
      message: "Unauthorized admin",
    });
  }
  next();
};
