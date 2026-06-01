import ParkingLog from "../models/ParkingLog.js";
import Booking from "../models/Booking.js";

export const enterVehicle =  async (req, res) => {
  const { bookingId } = req.params;

  const booking = await Booking.findById(bookingId);
  if (!booking || booking.bookingStatus !== "active")
    return res.status(400).json({ success: false, message: "Invalid booking" });

  // Check if already entered
  const existingLog = await ParkingLog.findOne({ bookingId, status: "active" });
  if (existingLog) return res.status(400).json({ success: false, message: "Already entered" });

  const log = await ParkingLog.create({ bookingId, entryTime: new Date() });

  res.json({ success: true, message: "Vehicle entered", log });
}

export const exitVehicle = async (req, res) => {
  const { bookingId } = req.params;

  const log = await ParkingLog.findOne({ bookingId, status: "active" });
  if (!log) return res.status(400).json({ success: false, message: "No active entry found" });

  log.exitTime = new Date();
  log.status = "completed";
  await log.save();

  // Update booking status
  const booking = await Booking.findById(bookingId);
  booking.bookingStatus = "completed";
  await booking.save();

  const duration = (log.exitTime - log.entryTime) / 1000 / 60; // duration in minutes

  res.json({ success: true, message: "Vehicle exited", log, duration });
}