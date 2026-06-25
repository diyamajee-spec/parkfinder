import express from "express";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";
import { deleteAdminUser, getAllAdminUser, updateAdminUser } from "../controllers/userManage.controller.js";
import { adminLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.use(authMiddleware);
router.use(adminMiddleware);
router.use(adminLimiter);

// Get all users (admin only)
router.get("/", getAllAdminUser);

// Update a user (admin only)
router.put("/:id", updateAdminUser);

// Delete a user (admin only)
router.delete("/:id", deleteAdminUser);

export default router;
