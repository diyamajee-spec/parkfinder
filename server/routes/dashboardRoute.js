// dashboardRoutes.js
import express from "express";

import { authMiddleware } from "../middleware/auth.js";
import { userStats } from "../controllers/dashboard.controller.js";

const router = express.Router();

// User Dashboard Stats
router.get("/user-stats", authMiddleware,userStats);

export default router;