// server/routes/adminSlots.js
import express from "express";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";
import { allSlots, deleteSlot, newSlot, updateSlot } from "../controllers/slotManage.controller.js";

const router = express.Router();

// GET all slots
router.get("/", authMiddleware, adminMiddleware,allSlots);

// POST new slot
router.post("/", authMiddleware, adminMiddleware,newSlot);

// PUT update slot
router.put("/:id", authMiddleware, adminMiddleware,updateSlot);

// DELETE slot
router.delete("/:id", authMiddleware, adminMiddleware,deleteSlot);

export default router;
