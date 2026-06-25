import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { faker } from "@faker-js/faker";

import User from "./models/User.js";
import Parking from "./models/Parking.js";
import Booking from "./models/Booking.js";
import ParkingLog from "./models/ParkingLog.js";

dotenv.config();

const rawData = [
  {
    name: "City Center Parking",
    location: "Sector 18, No_ida",
    pricePerHour: 40,
    status: "available",
    distance: "1km",
    capacity: 120,
    availableSlots: 45,
    isCovered: true,
    securityLevel: "high",
    rating: 4.5,
    openingTime: "08:00 AM",
    closingTime: "11:00 PM",
    images: [
      "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800",
      "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=800",
      "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800",
    ],
    floors: [
      {
        floorNumber: 0,
        floorName: "Ground Floor",
        totalSlots: 40,
        availableSlots: 15,
        isCovered: true,
        slotRows: generateSlotRows(40, 25, ["car", "car", "ev", "car", "bike"]),
      },
      {
        floorNumber: 1,
        floorName: "First Floor",
        totalSlots: 40,
        availableSlots: 18,
        isCovered: true,
        slotRows: generateSlotRows(40, 22, ["car", "car", "car", "disabled", "car"]),
      },
      {
        floorNumber: 2,
        floorName: "Second Floor",
        totalSlots: 40,
        availableSlots: 12,
        isCovered: false,
        slotRows: generateSlotRows(40, 28, ["car", "bike", "car", "car", "ev"]),
      },
    ],
  },
  {
    name: "Metro Parking Space",
    location: "Rajiv Chowk, Delhi",
    pricePerHour: 30,
    status: "closed",
    distance: "3km",
    capacity: 200,
    availableSlots: 0,
    isCovered: false,
    securityLevel: "medium",
    rating: 4.0,
    openingTime: "06:00 AM",
    closingTime: "10:00 PM",
    images: [
      "https://images.unsplash.com/photo-1611288875785-5c4fe859e1a3?w=800",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
    ],
    floors: [
      {
        floorNumber: 0,
        floorName: "Ground Floor",
        totalSlots: 100,
        availableSlots: 0,
        isCovered: false,
        slotRows: generateSlotRows(100, 100, ["car"]),
      },
      {
        floorNumber: 1,
        floorName: "First Floor",
        totalSlots: 100,
        availableSlots: 0,
        isCovered: false,
        slotRows: generateSlotRows(100, 100, ["car"]),
      },
    ],
  },
  {
    name: "Mall Basement Parking",
    location: "Phoenix Mall, Mumbai",
    pricePerHour: 50,
    status: "available",
    distance: "5km",
    capacity: 350,
    availableSlots: 120,
    isCovered: true,
    securityLevel: "high",
    rating: 4.8,
    openingTime: "24 Hours",
    closingTime: "24 Hours",
    images: [
      "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800",
      "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800",
      "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=800",
    ],
    floors: [
      {
        floorNumber: -2,
        floorName: "Basement B2",
        totalSlots: 120,
        availableSlots: 30,
        isCovered: true,
        slotRows: generateSlotRows(120, 90, ["car", "car", "ev", "car"]),
      },
      {
        floorNumber: -1,
        floorName: "Basement B1",
        totalSlots: 120,
        availableSlots: 50,
        isCovered: true,
        slotRows: generateSlotRows(120, 70, ["car", "disabled", "car", "car"]),
      },
      {
        floorNumber: 0,
        floorName: "Ground Level",
        totalSlots: 110,
        availableSlots: 40,
        isCovered: true,
        slotRows: generateSlotRows(110, 70, ["car", "bike", "car", "ev", "car"]),
      },
    ],
  },
  {
    name: "Central Park Parking",
    location: "Park Street, Kolkata",
    pricePerHour: 20,
    status: "available",
    distance: "10km",
    capacity: 90,
    availableSlots: 21,
    isCovered: false,
    securityLevel: "low",
    rating: 3.9,
    openingTime: "07:00 AM",
    closingTime: "09:00 PM",
    images: [
      "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800",
    ],
    floors: [],
  },
  {
    name: "Airport Multi-Level Parking",
    location: "IGI Airport, Delhi",
    pricePerHour: 80,
    status: "available",
    distance: "5km",
    capacity: 500,
    availableSlots: 210,
    isCovered: true,
    securityLevel: "high",
    rating: 4.7,
    openingTime: "24 Hours",
    closingTime: "24 Hours",
    images: [
      "https://images.unsplash.com/photo-1559329255-4b5b3e5f1e63?w=800",
      "https://images.unsplash.com/photo-1611288875785-5c4fe859e1a3?w=800",
      "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800",
    ],
    floors: [
      {
        floorNumber: 0,
        floorName: "Ground Floor",
        totalSlots: 100,
        availableSlots: 40,
        isCovered: true,
        slotRows: generateSlotRows(100, 60, ["car", "car", "ev", "car", "car"]),
      },
      {
        floorNumber: 1,
        floorName: "Level 1",
        totalSlots: 100,
        availableSlots: 50,
        isCovered: true,
        slotRows: generateSlotRows(100, 50, ["car", "car", "car", "bike", "car"]),
      },
      {
        floorNumber: 2,
        floorName: "Level 2",
        totalSlots: 100,
        availableSlots: 45,
        isCovered: true,
        slotRows: generateSlotRows(100, 55, ["car", "disabled", "car", "car", "ev"]),
      },
      {
        floorNumber: 3,
        floorName: "Level 3",
        totalSlots: 100,
        availableSlots: 40,
        isCovered: false,
        slotRows: generateSlotRows(100, 60, ["car", "car", "car", "car", "bike"]),
      },
      {
        floorNumber: 4,
        floorName: "Rooftop",
        totalSlots: 100,
        availableSlots: 35,
        isCovered: false,
        slotRows: generateSlotRows(100, 65, ["car", "car", "ev", "car", "car"]),
      },
    ],
  },
];

const MONGO_URI = process.env.MONGO_URI;
const parkingData = rawData.map((slot) => ({
  ...slot,
  _id: new mongoose.Types.ObjectId(),
}));

// Helper to generate a slot row grid for a floor
function generateSlotRows(totalSlots, occupiedSlots, vehicleTypes = []) {
  const SLOTS_PER_ROW = 5;
  const rows = [];
  let slotIndex = 0;

  for (let r = 0; r < Math.ceil(totalSlots / SLOTS_PER_ROW); r++) {
    const rowLabel = String.fromCharCode(65 + r); // A, B, C...
    const slots = [];
    for (let s = 0; s < SLOTS_PER_ROW && slotIndex < totalSlots; s++, slotIndex++) {
      slots.push({
        slotId: `${rowLabel}${s + 1}`,
        isOccupied: slotIndex < occupiedSlots,
        isReserved: false,
        vehicleType: vehicleTypes[slotIndex % vehicleTypes.length] || "car",
      });
    }
    rows.push({ row: rowLabel, slots });
  }
  return rows;
}

async function seedDB() {
  try {
    if (!MONGO_URI) {
      throw new Error("MONGO_URI environment variable is not defined.");
    }

    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected");
    await Parking.deleteMany();
    await Parking.insertMany(parkingData);
    console.log("Parking data inserted successfully!");
    process.exit();
  } catch (err) {
    console.error("Database seeding failed:", err);
    process.exit(1);
  }
}

seedDB();
