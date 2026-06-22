import express from "express";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";
import { allSlots, deleteSlot, getParkingSlots, newSlot, updateSlot } from "../controllers/slotManage.controller.js";
import { cacheMiddleware } from "../utils/cache.js";

const router = express.Router();

// GET /api/slots -> Used by the frontend for users to search/filter slots
router.get("/", cacheMiddleware({ ttl: 60 }), getParkingSlots);

// GET all slots
router.get("/admin/all", authMiddleware, adminMiddleware, cacheMiddleware({ ttl: 60 }), allSlots);

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
router.post("/", authMiddleware, adminMiddleware,newSlot);

/**
 * @swagger
 * /api/admin/slots/{id}:
 *   put:
 *     summary: Update an existing parking slot
 *     tags: [Parking Lots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Parking'
 *     responses:
 *       200:
 *         description: Slot updated successfully
 */
router.put("/:id", authMiddleware, adminMiddleware,updateSlot);

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
router.delete("/:id", authMiddleware, adminMiddleware,deleteSlot);

export default router;
