import express from "express";
import { getPeakHours } from "../controllers/peakHours.controller.js";

const router = express.Router({ mergeParams: true });

// GET /api/parking/:parkingId/peak-hours
router.get("/", getPeakHours);

export default router;