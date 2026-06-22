import express from "express";

import { authMiddleware } from "../middleware/auth.js";
import { cancelBooking, createBooking, deleteBooking, getAllBookings, getMyBookings, updateBookingStatus } from "../controllers/booking.controller.js";

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
router.get("/my-bookings", authMiddleware, getMyBookings);

/**
 * @swagger
 * /api/bookings/book:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               parkingId: { type: string }
 *               startTime: { type: string, format: date-time }
 *               endTime: { type: string, format: date-time }
 *     responses:
 *       201:
 *         description: Booking created successfully
 */
router.post("/book", authMiddleware,createBooking);

/**
 * @swagger
 * /api/bookings/cancel/{id}:
 *   delete:
 *     summary: Cancel a booking (user)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking cancelled successfully
 */
router.delete("/cancel/:id", authMiddleware,cancelBooking);

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
router.get("/all", authMiddleware,getAllBookings);

/**
 * @swagger
 * /api/bookings/{id}/status:
 *   put:
 *     summary: Update booking status (admin only)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status: { type: string }
 *     responses:
 *       200:
 *         description: Booking status updated
 */
router.put("/:id/status", authMiddleware,updateBookingStatus);

/**
 * @swagger
 * /api/bookings/admin-delete/{id}:
 *   delete:
 *     summary: Delete a booking completely (admin only)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking deleted successfully
 */
router.delete("/admin-delete/:id", authMiddleware, deleteBooking);

export default router;