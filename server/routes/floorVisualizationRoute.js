import express from "express";
import {
  getFloorVisualization,
  getFloorDetail,
} from "../controllers/floorVisualization.controller.js";

const router = express.Router({ mergeParams: true });

// GET /api/parking/:parkingId/floors
router.get("/", getFloorVisualization);

// GET /api/parking/:parkingId/floors/:floorNumber
router.get("/:floorNumber", getFloorDetail);

export default router;