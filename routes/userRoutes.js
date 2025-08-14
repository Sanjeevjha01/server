import express from "express";
import {
  getUserProfile,
  loginController,
  logoutController,
  passwordResetController,
  registerController,
  updatePasswordControll,
  updateProfileController,
  updateProfilePhotoController,
} from "../controller/userController.js";
import { isAuth } from "../middlewares/authMiddleware.js";
import { singleUpload } from "../middlewares/multer.js";
import { rateLimit } from "express-rate-limit";

// RATE LIMITER
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  limit: 100, // Limit each IP to 100 requests per 'window' (here, per 15 mins).
  standardHeaders: "draft-7", // draft-6: 'RateLimit-*' headers; draft-7:combined 'RateLimit' header
  legacyHeaders: false, // Disable the 'X-RateLimit-* headers,
  // store: ..., // use an exteral store for consistency across multiple server instances.
});

//router object
const router = express.Router();

//routes
//for register
router.post("/register", limiter, registerController);

//for login
router.post("/login", limiter, loginController);

//profile
router.get("/profile", isAuth, getUserProfile);

//logout
router.get("/logout", isAuth, logoutController);

//update profile
router.put("/profile-update", isAuth, updateProfileController);

//update password
router.put("/update-password", isAuth, updatePasswordControll);

//update profile pic
router.put(
  "/update-picture",
  isAuth,
  singleUpload,
  updateProfilePhotoController
);

// forgot password
router.post("/reset-password", passwordResetController);

//export
export default router;
