// server/routes/adminSlots.js
import express from "express";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";
import { allSlots, deleteSlot, getParkingSlots, newSlot, updateSlot } from "../controllers/slotManage.controller.js";
import { adminLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// GET /api/slots -> Used by the frontend for users to search/filter slots
router.get("/", getParkingSlots);

// GET all slots
router.get("/admin/all", authMiddleware, adminMiddleware, adminLimiter, allSlots);

// POST new slot
router.post("/", authMiddleware, adminMiddleware, adminLimiter, newSlot);

// PUT update slot
router.put("/:id", authMiddleware, adminMiddleware, adminLimiter, updateSlot);

// DELETE slot
router.delete("/:id", authMiddleware, adminMiddleware, adminLimiter, deleteSlot);

export default router;
