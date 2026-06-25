import express from "express";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";
import { allSlots, deleteSlot, getParkingSlots, newSlot, updateSlot } from "../controllers/slotManage.controller.js";
import { adminLimiter } from "../middleware/rateLimiter.js";
import { cacheMiddleware } from "../utils/cache.js";
import { validateRequest } from "../middleware/validate.js";
import { createSlotSchema, updateSlotSchema } from "../validators/slot.validator.js";

const router = express.Router();

/**
 * @swagger
 * /api/admin/slots:
 *   get:
 *     summary: Get all parking slots (Public)
 *     tags: [Parking Lots]
 *     responses:
 *       200:
 *         description: List of parking slots
 */
router.get("/", cacheMiddleware({ ttl: 60 }), getParkingSlots);

// GET all slots
router.get("/admin/all", authMiddleware, adminMiddleware, adminLimiter, cacheMiddleware({ ttl: 60 }), allSlots);

/**
 * @swagger
 * /api/admin/slots:
 *   post:
 *     summary: Create a new parking slot
 *     tags: [Parking Lots]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Parking'
 *     responses:
 *       201:
 *         description: Slot created successfully
 */
router.post("/", authMiddleware, adminMiddleware, adminLimiter, validateRequest(createSlotSchema), newSlot);

// PUT update slot
router.put("/:id", authMiddleware, adminMiddleware, adminLimiter, validateRequest(updateSlotSchema), updateSlot);

/**
 * @swagger
 * /api/admin/slots/{id}:
 *   delete:
 *     summary: Delete a parking slot
 *     tags: [Parking Lots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Slot deleted successfully
 */
router.delete("/:id", authMiddleware, adminMiddleware, adminLimiter, deleteSlot);

export default router;
