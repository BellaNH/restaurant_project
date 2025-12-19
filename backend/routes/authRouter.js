import express from "express";
import rateLimit from "express-rate-limit";
import {
  login,
  logout,
  logoutAll,
  refreshToken,
  register,
  resetPassword,
  sendResetOtp,
  sendVerifyOtp,
  verifyEmail,
} from "../controllers/authcontroller.js";
import authUser from "../middleware/authuser.js";
import { validate } from "../middleware/validation.js";
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  sendVerifyOtpSchema,
  sendResetOtpSchema,
  resetPasswordSchema
} from "../middleware/validationSchemas.js";

const authRouter = express.Router();

// Route-level rate limiting for sensitive auth endpoints
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // max 20 login attempts per IP per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      message: "Too many login attempts from this IP. Please try again after 15 minutes.",
    });
  },
});

const otpSendLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // max 5 OTP send attempts per IP per hour
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      message: "Too many OTP requests from this IP. Please try again after 1 hour.",
    });
  },
});

authRouter.post("/register", validate(registerSchema), register);
authRouter.post("/login", loginLimiter, validate(loginSchema), login);
authRouter.post("/logout", logout);
authRouter.post("/logout-all", authUser, logoutAll);
authRouter.post("/refresh", refreshToken);
authRouter.post("/test-email", testEmail); // Test endpoint for email configuration
authRouter.post("/send-verify-otp", otpSendLimiter, validate(sendVerifyOtpSchema), sendVerifyOtp);
authRouter.post("/verify-account", validate(verifyEmailSchema), verifyEmail);
authRouter.post("/send-reset-otp", otpSendLimiter, validate(sendResetOtpSchema), sendResetOtp);
authRouter.post("/reset-password", validate(resetPasswordSchema), resetPassword);

export default authRouter;