import express from "express";
import { bookSlot, deleteBook } from "../controllers/bookingSlot.controller.js";

const router = express.Router();

// Book a slot
router.post("/book/:id",bookSlot);

// DELETE a booking
router.delete("/delete/:id", deleteBook);

export default router;
