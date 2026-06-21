import express from "express";
import crypto from "node:crypto";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authMiddleware } from "../middleware/auth.js";
import { sendPasswordResetEmail } from "../utils/email.js";
import { signup, login, verify, verify2FALogin } from "../controllers/auth.controller.js";
import { authLimiter, resetLimiter } from "../middleware/rateLimiter.js";


const router = express.Router();

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, manager, admin]
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: User already exists or validation error
 */
router.post("/signup", authLimiter, signup);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Authenticate user and get token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 token: { type: string }
 *                 requires2FA: { type: boolean }
 *                 tempToken: { type: string }
 *       400:
 *         description: Invalid credentials
 */
router.post("/login",authLimiter , login);

/**
 * @swagger
 * /api/auth/login/verify-2fa:
 *   post:
 *     summary: Verify 2FA token during login for admins/managers
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tempToken, token]
 *             properties:
 *               tempToken:
 *                 type: string
 *               token:
 *                 type: string
 *                 description: 6-digit TOTP code
 *     responses:
 *       200:
 *         description: 2FA verified successfully, returns full access token
 *       401:
 *         description: Invalid or expired token
 */
router.post("/login/verify-2fa", authLimiter, verify2FALogin);

// Forgot password
router.post("/forgot-password", resetLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "No account found with that email" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 30 * 60 * 1000;
    await user.save();

    const resetLink = await sendPasswordResetEmail({
      to: user.email,
      resetToken,
    });

    res.json({
      success: true,
      message: "Password reset link sent to your email.",
      resetLink,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || "Failed to send password reset email",
    });
  }
});

// Reset password
router.post("/reset-password",resetLimiter,  async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Token and password are required" });
    }

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired reset token" });
    }

    user.password = password;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ success: true, message: "Password reset successful" });
  } catch (err) {
    res
      .status(500)
      .json({
        success: false,
        message: err.message || "Failed to reset password",
      });
  }
});

// verify
router.get("/verify", authMiddleware,verify);

export default router;
