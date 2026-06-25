import express from "express";
import crypto from "node:crypto";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authMiddleware } from "../middleware/auth.js";
import { sendPasswordResetEmail } from "../utils/email.js";
import { signup, login, verify, forgotPassword, resetPassword, verifyEmail2FA, verify2FALogin } from "../controllers/auth.controller.js";
import { authLimiter, resetLimiter } from "../middleware/rateLimiter.js";
import { validateRequest } from "../middleware/validate.js";
import { signupSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from "../validators/auth.validator.js";


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
router.post("/signup", authLimiter, validateRequest(signupSchema), signup);

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
router.post("/login", authLimiter, validateRequest(loginSchema), login);

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

// Verify Email 2FA
router.post("/login/verify-email-2fa", authLimiter, verifyEmail2FA);

// Forgot password
router.post("/forgot-password", resetLimiter, validateRequest(forgotPasswordSchema), forgotPassword);

// Reset password
router.post("/reset-password", resetLimiter, validateRequest(resetPasswordSchema), resetPassword);

// verify
router.get("/verify", authMiddleware,verify);

export default router;
