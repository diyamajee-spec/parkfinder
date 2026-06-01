import Parking from "../models/Parking.js";
import Booking from "../models/Booking.js";


export const bookSlot =  async (req, res) => {
  console.log("📌 BOOKING API HIT, ID =", req.params.id);

  try {
    const parking = await Parking.findById(req.params.id);

    if (!parking) {
      console.log("❌ NOT FOUND");
      return res
        .status(404)
        .json({ success: false, message: "Parking not found" });
    }

    console.log("📌 Parking found:", parking.name);

    const booking = new Booking({
      parkingId: parking._id,
      price: parking.pricePerHour,
    });

    await booking.save();
    console.log("✅ Booking created:", booking._id);

    res.json({ success: true, message: "Booking successful", booking });
  } catch (err) {
    console.error("🔥 BOOKING ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
}
export const deleteBook = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Parking slot ko restore karo (availableSlots + 1)
    const parking = await Parking.findById(booking.parkingId);
    if (parking) {
      parking.availableSlots += 1;
      await parking.save();
    }

    await booking.deleteOne();

    res.json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}