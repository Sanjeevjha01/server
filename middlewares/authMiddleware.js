import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import facultyModel from "../models/facultyModel.js";
import adminModel from "../models/adminModel.js";

// UNIFIED AUTH - Check all user types
export const isAuth = async (req, res, next) => {
  try {
    // Try to get token from multiple sources
    let token = req.cookies?.token || 
                req.headers?.authorization?.replace('Bearer ', '') ||
                req.headers?.cookie?.split('token=')[1]?.split(';')[0];
    
    // validation
    if (!token) {
      return res.status(401).send({
        success: false,
        message: "Unauthorized - No token provided",
      });
    }

    const decodeData = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token data:", decodeData); // For debugging
    
    let user = null;
    
    // Try to find user in all models
    // Check regular user model first
    if (decodeData.userId) {
      user = await userModel.findById(decodeData.userId);
      if (user) {
        req.user = user;
        req.userType = 'user';
        return next();
      }
    }

    // Try faculty model
      user = await facultyModel.findById(decodeData.userId);
      if (user) {
        req.faculty = user;
        req.user = user; // Also set as user for compatibility
        req.userType = 'faculty';
        return next();
      }

    // Try admin model
      user = await adminModel.findById(decodeData.userId);
      if (user) {
        req.admin = user;
        req.user = user; // Also set as user for compatibility
        req.userType = 'admin';
        return next();
      }
    }
  // Fallback: Try old token formats
    if (decodeData.facultyId) {
      user = await facultyModel.findById(decodeData.facultyId);
      if (user) {
        req.faculty = user;
        req.user = user;
        req.userType = 'faculty';
        return next();
      }
    }

    if (decodeData.adminId) {
      user = await adminModel.findById(decodeData.adminId);
      if (user) {
        req.admin = user;
        req.user = user;
        req.userType = 'admin';
        return next();
      }
    }

    return res.status(401).send({
      success: false,
      message: "User not found in any user type",
    });

  } catch (error) {
    console.log("Auth error:", error);
    return res.status(401).send({
      success: false,
      message: "Invalid token",
      error: error.message,
    });
  }
};

// FACULTY AUTH - Specific faculty middleware
export const isFacAuth = async (req, res, next) => {
  try {
    // If already authenticated by isAuth, check if it's faculty
    if (req.userType === 'faculty' && req.faculty) {
      return next();
    }

     // Get token from multiple sources
    let token = req.cookies?.token || 
                req.headers?.authorization?.replace('Bearer ', '') ||
                req.headers?.cookie?.split('token=')[1]?.split(';')[0];
    
    if (!token) {
      return res.status(401).send({
        success: false,
        message: "Unauthorized faculty - No token",
      });
    }

    const decodeData = jwt.verify(token, process.env.JWT_SECRET);
    
    // Look for faculty using facultyId or userId
    const faculty = await facultyModel.findById(decodeData.facultyId || decodeData.userId);

    if (!faculty) {
      return res.status(401).send({
        success: false,
        message: "Faculty not found",
      });
    }

    req.faculty = faculty;
    req.user = faculty; // for compatibility
    req.userType = 'faculty';
    next();
  } catch (error) {
    return res.status(401).send({
      success: false,
      message: "Invalid faculty token",
      error: error.message,
    });
  }
};

// ADMIN AUTH
export const isAdmin = async (req, res, next) => {
  try {
    // If already authenticated by isAuth, check if it's admin
    if (req.userType === 'admin' && req.admin) {
      return next();
    }

    // Get token from multiple sources
    let token = req.cookies?.token || 
                req.headers?.authorization?.replace('Bearer ', '') ||
                req.headers?.cookie?.split('token=')[1]?.split(';')[0];
    
    if (!token) {
      return res.status(401).send({
        success: false,
        message: "Unauthorized admin - No token",
      });
    }

    const decodeData = jwt.verify(token, process.env.JWT_SECRET);
    
    // Look for admin using adminId or userId
    const admin = await adminModel.findById(decodeData.adminId || decodeData.userId);

    if (!admin) {
      return res.status(401).send({
        success: false,
        message: "Admin not found",
      });
    }

    req.admin = admin;
    req.user = admin; // For compatibility
    req.userType = 'admin';
    next();
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Error in admin authorization",
      error: error.message,
    });
  }
};

