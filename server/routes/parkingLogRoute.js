import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import { enterVehicle, exitVehicle } from "../controllers/parkingLog.controller.js";
import { bookingLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// Enter Vehicle
router.post("/enter/:bookingId", authMiddleware, bookingLimiter, enterVehicle);

// Exit Vehicle
router.post("/exit/:bookingId", authMiddleware, bookingLimiter, exitVehicle);

export default router;
