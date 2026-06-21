// server/routes/adminSlots.js
import express from "express";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";
import { allSlots, deleteSlot, getParkingSlots, newSlot, updateSlot } from "../controllers/slotManage.controller.js";

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
router.get("/", getParkingSlots);

/**
 * @swagger
 * /api/admin/slots/admin/all:
 *   get:
 *     summary: Get all parking slots for admin
 *     tags: [Parking Lots]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all slots with details
 */
router.get("/admin/all", authMiddleware, adminMiddleware, allSlots);

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
