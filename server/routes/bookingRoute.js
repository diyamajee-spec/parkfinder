import express from "express";

import { authMiddleware } from "../middleware/auth.js";
import { cancelBooking, createBooking, deleteBooking, getAllBookings, getMyBookings, updateBookingStatus } from "../controllers/booking.controller.js";
import { bookingLimiter, adminLimiter } from "../middleware/rateLimiter.js";
import { validateRequest } from "../middleware/validate.js";
import { createBookingSchema, updateBookingStatusSchema, cancelBookingSchema } from "../validators/booking.validator.js";

const router = express.Router();

// ================== USER BOOKINGS ==================
/**
 * @swagger
 * /api/bookings/my-bookings:
 *   get:
 *     summary: Get current user's bookings
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of bookings
 */
router.get("/my-bookings", authMiddleware, bookingLimiter, getMyBookings);

// Create new booking (user)
router.post("/book", authMiddleware, bookingLimiter, validateRequest(createBookingSchema), createBooking);

// Cancel booking (user)
router.delete("/cancel/:id", authMiddleware, bookingLimiter, validateRequest(cancelBookingSchema), cancelBooking);

// ================== ADMIN BOOKINGS ==================
/**
 * @swagger
 * /api/bookings/all:
 *   get:
 *     summary: Get all bookings (admin only)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all bookings
 */
router.get("/all", authMiddleware, adminLimiter, getAllBookings);

// Update booking status (admin only)
router.put("/:id/status", authMiddleware, adminLimiter, validateRequest(updateBookingStatusSchema), updateBookingStatus);

// Delete booking (admin only)
router.delete("/admin-delete/:id", authMiddleware, adminLimiter, validateRequest(cancelBookingSchema), deleteBooking);

export default router;