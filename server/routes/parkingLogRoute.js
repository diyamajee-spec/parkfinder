import express from "express";
import { enterVehicle, exitVehicle } from "../controllers/parkingLog.controller.js";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";
import { bookingLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/entry/:bookingId", authMiddleware, adminMiddleware, bookingLimiter, enterVehicle);
router.post("/exit/:bookingId", authMiddleware, adminMiddleware, bookingLimiter, exitVehicle);

export default router;
