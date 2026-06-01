import express from "express";

import { authMiddleware } from "../middleware/auth.js";
import { cancelBooking, createBooking, deleteBooking, getAllBookings, getMyBookings, updateBookingStatus } from "../controllers/booking.controller.js";

const router = express.Router();

// ================== USER BOOKINGS ==================
// Get current user's bookings
router.get("/my-bookings", authMiddleware, getMyBookings);

// Create new booking (user)
router.post("/book", authMiddleware,createBooking);

// Cancel booking (user)
router.delete("/cancel/:id", authMiddleware,cancelBooking);

// ================== ADMIN BOOKINGS ==================
// Get all bookings (admin only)
router.get("/all", authMiddleware,getAllBookings);

// Update booking status (admin only)
router.put("/:id/status", authMiddleware,updateBookingStatus);

// Delete booking (admin only)
router.delete("/admin-delete/:id", authMiddleware, deleteBooking);

export default router;