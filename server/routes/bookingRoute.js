import express from "express";

import { authMiddleware } from "../middleware/auth.js";
import { cancelBooking, createBooking, deleteBooking, getAllBookings, getMyBookings, updateBookingStatus } from "../controllers/booking.controller.js";
import { bookingLimiter, adminLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// ================== USER BOOKINGS ==================
// Get current user's bookings
router.get("/my-bookings", authMiddleware, bookingLimiter, getMyBookings);

// Create new booking (user)
router.post("/book", authMiddleware, bookingLimiter, createBooking);

// Cancel booking (user)
router.delete("/cancel/:id", authMiddleware, bookingLimiter, cancelBooking);

// ================== ADMIN BOOKINGS ==================
// Get all bookings (admin only)
router.get("/all", authMiddleware, adminLimiter, getAllBookings);

// Update booking status (admin only)
router.put("/:id/status", authMiddleware, adminLimiter, updateBookingStatus);

// Delete booking (admin only)
router.delete("/admin-delete/:id", authMiddleware, adminLimiter, deleteBooking);

export default router;