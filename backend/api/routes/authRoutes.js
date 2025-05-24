import express from "express";
import {
  login,
  register,
  sendVerificationEmail,
  verifyEmail, 
} from "../controllers/authControllers.js";
import { authMiddleware } from "../middleware/middleware.js";

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/verify-account", verifyEmail);
authRouter.post("/send-verifyotp-prior-login", authMiddleware, sendVerificationEmail);

export default authRouter;
