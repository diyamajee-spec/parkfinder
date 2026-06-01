import express from "express";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";
import { deleteAdminUser, getAllAdminUser, updateAdminUser } from "../controllers/userManage.controller.js";

const router = express.Router();

// Get all users (admin only)
router.get("/", authMiddleware, adminMiddleware,getAllAdminUser);

// Update a user (admin only)
router.put("/:id", authMiddleware, adminMiddleware,updateAdminUser);

// Delete a user (admin only)
router.delete("/:id", authMiddleware, adminMiddleware,deleteAdminUser );

export default router;
