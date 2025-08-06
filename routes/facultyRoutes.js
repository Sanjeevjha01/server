import express from "express";
import {
  facultyLogin,
  facultyLogout,
  facultyProfile,
  facultyRegister,
  facultyUpdatePassword,
  updateProfilePic,
  dropFaculty,
} from "../controller/facultyController.js";
import { isAdmin, isAuth, isFacAuth } from "../middlewares/authMiddleware.js";
import { singleUpload } from "../middlewares/multer.js";

// router object
const router = express.Router();

// routes
router.post("/fac-reg", facultyRegister);
router.post("/fac-login", facultyLogin);
router.get("/fac-logout", isFacAuth, facultyLogout);
router.get("/fac-profile", facultyProfile);
router.put("/fac-updatepass", isAuth, isFacAuth, facultyUpdatePassword);
router.put("/fac-updatepic", isAuth, isFacAuth, singleUpload, updateProfilePic);
router.delete("/fac-drop/:id", isAuth, isAdmin, dropFaculty);

// export router
export default router;

