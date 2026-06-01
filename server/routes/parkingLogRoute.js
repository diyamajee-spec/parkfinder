import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import { enterVehicle, exitVehicle } from "../controllers/parkingLog.controller.js";

const router = express.Router();

// Enter Vehicle
router.post("/enter/:bookingId", authMiddleware, enterVehicle);

// Exit Vehicle
router.post("/exit/:bookingId", authMiddleware,exitVehicle);

export default router;
