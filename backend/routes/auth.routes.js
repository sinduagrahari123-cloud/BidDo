import express from "express";
import { registerUser, loginUser,getMe,uploadAvatar, forgotPassword,resetPassword } from "../controllers/auth.controller.js";
import upload from "../middleware/upload.middleware.js";
import { protect } from "../middleware/auth.middleware.js";


const router = express.Router()


router.post("/register",registerUser)
router.post("/login",loginUser)
router.get("/me",protect,getMe)

router.post("/upload-avatar", protect, upload.single("avatar"), uploadAvatar);
router.post("/forgot-password",forgotPassword)
router.post("/reset-password/:token", resetPassword);

export default router;