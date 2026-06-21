import express from "express";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";
import { allSlots, deleteSlot, getParkingSlots, newSlot, updateSlot } from "../controllers/slotManage.controller.js";
import { cacheMiddleware } from "../utils/cache.js";

const router = express.Router();

// GET /api/slots -> Used by the frontend for users to search/filter slots
router.get("/", cacheMiddleware({ ttl: 60 }), getParkingSlots);

// GET all slots
router.get("/admin/all", authMiddleware, adminMiddleware, cacheMiddleware({ ttl: 60 }), allSlots);

// POST new slot
router.post("/", authMiddleware, adminMiddleware,newSlot);

// PUT update slot
router.put("/:id", authMiddleware, adminMiddleware,updateSlot);

// DELETE slot
router.delete("/:id", authMiddleware, adminMiddleware,deleteSlot);

export default router;
