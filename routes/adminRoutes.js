import express from "express";
import {
  adminLogin,
  adminLogout,
  adminProfile,
  adminRegister,
  adminUpdatePassword,
  updateProfilePic,
} from "../controller/adminController.js";
import { isAdmin, isAuth } from "../middlewares/authMiddleware.js";
import { singleUpload } from "../middlewares/multer.js";

// router object
const router = express.Router();

// routes
router.post("/admin-reg", adminRegister);
router.post("/admin-login", adminLogin);
router.get("/admin-logout", isAuth, isAdmin, adminLogout);
router.get("/admin-profile", isAuth, isAdmin, adminProfile);
router.put("/admin-updatepass", isAuth, isAdmin, adminUpdatePassword);
router.put("/admin-updatepic", isAuth, isAdmin, singleUpload, updateProfilePic);

// export router
export default router;
