import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import { generate2FASecret, verify2FASetup, disable2FA } from "../controllers/auth2fa.controller.js";

const router = express.Router();

/**
 * @swagger
 * /api/auth/2fa/setup:
 *   post:
 *     summary: Generate a new 2FA secret and QR code
 *     tags: [2FA]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully generated secret and QR code
 */
router.post("/setup", authMiddleware, generate2FASecret);

/**
 * @swagger
 * /api/auth/2fa/verify-setup:
 *   post:
 *     summary: Verify token to enable 2FA
 *     tags: [2FA]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token: { type: string }
 *     responses:
 *       200:
 *         description: 2FA successfully enabled
 */
router.post("/verify-setup", authMiddleware, verify2FASetup);

/**
 * @swagger
 * /api/auth/2fa/disable:
 *   post:
 *     summary: Disable 2FA
 *     tags: [2FA]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token: { type: string }
 *     responses:
 *       200:
 *         description: 2FA successfully disabled
 */
router.post("/disable", authMiddleware, disable2FA);

export default router;
