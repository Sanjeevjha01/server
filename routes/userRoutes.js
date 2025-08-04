import express from "express";
import {
  dropUser,
  getUserProfileController,
  loginController,
  logoutController,
  registerController,
  updatePassController,
  updatePicController,
} from "../controller/userController.js";
import { isAdmin, isAuth } from "../middlewares/authMiddleware.js";
import { singleUpload } from "../middlewares/multer.js";

// router object
const router = express.Router();

// routes
router.post("/register", registerController);
router.post("/login", loginController);
router.get("/logout", logoutController);
router.get("/profile", isAuth, getUserProfileController);
router.put("/update-password", isAuth, updatePassController);
router.delete("/drop-user/:id", isAuth, isAdmin, dropUser);

router.put("/update-pic", isAuth, singleUpload, updatePicController);

// export router
export default router;
