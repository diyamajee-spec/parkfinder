import Booking from "../models/Booking.js";
import Parking from "../models/Parking.js";

// Get current user's bookings

export const getMyBookings =  async (req, res) => {
  try {
    const userId = req.user._id;

    const bookings = await Booking.find({ userId })
      .populate("parkingId")
      .sort({ bookingDate: -1 });

    res.json({
      success: true,
      data: bookings
    });
  } catch (err) {
    console.error("Error fetching user bookings:", err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
}
// Create new booking
export const createBooking = async (req, res) => {
  try {
    const { parkingId, duration } = req.body;
    const userId = req.user._id;

    console.log("📌 Booking request:", { parkingId, duration, userId });

    // Check if parking slot exists
    const parking = await Parking.findById(parkingId);
    if (!parking) {
      return res.status(404).json({
        success: false,
        message: "Parking slot not found"
      });
    }

    // Check availability
    if (parking.availableSlots <= 0) {
      return res.status(400).json({
        success: false,
        message: "No available slots in this parking"
      });
    }

    // Calculate total price
    const totalPrice = parking.pricePerHour * (duration || 1);

    // Create booking
    const booking = new Booking({
      userId,
      parkingId,
      duration: duration || 1,
      totalPrice,
      bookingDate: new Date(),
      bookingStatus: "active"
    });

    // Save booking
    await booking.save();

    // Update parking slot availability
    parking.availableSlots -= 1;
    await parking.save();

    // Populate and return booking
    const populatedBooking = await Booking.findById(booking._id)
      .populate("parkingId");

    console.log("✅ Booking created successfully:", booking._id);

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: populatedBooking
    });
  } catch (err) {
    console.error("❌ Booking creation error:", err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
}

// Cancel booking
export const cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user._id;

    console.log("📌 Cancel booking:", { bookingId, userId });

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    // Check if user owns this booking
    if (booking.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this booking"
      });
    }

    // Update parking slot availability only if booking is active
    if (booking.bookingStatus === "active") {
      const parking = await Parking.findById(booking.parkingId);
      if (parking) {
        parking.availableSlots += 1;
        await parking.save();
        console.log("✅ Parking slot restored:", parking._id);
      }
    }

    // Update booking status
    booking.bookingStatus = "cancelled";
    await booking.save();

    console.log("✅ Booking cancelled:", bookingId);

    res.json({
      success: true,
      message: "Booking cancelled successfully"
    });
  } catch (err) {
    console.error("❌ Cancel booking error:", err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
}

// ================== ADMIN BOOKINGS ==================

// Get all bookings
export const getAllBookings =  async (req, res) => {
  try {
    console.log("📌 Fetching all bookings for admin...");

    // Check if user is admin
    if (req.user.role !== "admin") {
      console.log("❌ Non-admin user trying to access all bookings");
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only."
      });
    }

    const bookings = await Booking.find()
      .populate("parkingId")
      .populate("userId", "name email")
      .sort({ bookingDate: -1 });

    console.log(`✅ Found ${bookings.length} bookings`);

    res.json({
      success: true,
      data: bookings
    });
  } catch (err) {
    console.error("❌ Error fetching all bookings:", err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
}

// Update booking status
export const updateBookingStatus =  async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only."
      });
    }

    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    // If changing from active to cancelled, restore parking slot
    if (booking.bookingStatus === "active" && status === "cancelled") {
      const parking = await Parking.findById(booking.parkingId);
      if (parking) {
        parking.availableSlots += 1;
        await parking.save();
      }
    }

    booking.bookingStatus = status;
    await booking.save();

    res.json({
      success: true,
      message: "Booking status updated"
    });
  } catch (err) {
    console.error("Error updating booking status:", err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
}

// Delete booking
export const deleteBooking = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only."
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    // Restore parking slot if booking was active
    if (booking.bookingStatus === "active") {
      const parking = await Parking.findById(booking.parkingId);
      if (parking) {
        parking.availableSlots += 1;
        await parking.save();
      }
    }

    await booking.deleteOne();

    res.json({
      success: true,
      message: "Booking deleted successfully"
    });
  } catch (err) {
    console.error("Error deleting booking:", err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
}