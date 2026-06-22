import express from "express";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";
import { allSlots, deleteSlot, getParkingSlots, newSlot, updateSlot } from "../controllers/slotManage.controller.js";
import { cacheMiddleware } from "../utils/cache.js";
import { validateRequest } from "../middleware/validate.js";
import { createSlotSchema, updateSlotSchema } from "../validators/slot.validator.js";

const router = express.Router();

// GET /api/slots -> Used by the frontend for users to search/filter slots
router.get("/", cacheMiddleware({ ttl: 60 }), getParkingSlots);

// GET all slots
router.get("/admin/all", authMiddleware, adminMiddleware, cacheMiddleware({ ttl: 60 }), allSlots);

// POST new slot
router.post("/", authMiddleware, adminMiddleware, validateRequest(createSlotSchema), newSlot);

// PUT update slot
router.put("/:id", authMiddleware, adminMiddleware, validateRequest(updateSlotSchema), updateSlot);

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
