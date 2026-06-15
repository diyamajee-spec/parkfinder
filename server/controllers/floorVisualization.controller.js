import Parking from "../models/Parking.js";

// GET /api/parking/:parkingId/floors
// Returns floor-wise slot breakdown for a parking facility
export const getFloorVisualization = async (req, res) => {
  try {
    const { parkingId } = req.params;

    const parking = await Parking.findById(parkingId).lean();
    if (!parking) {
      return res.status(404).json({
        success: false,
        message: "Parking not found",
      });
    }

    // If no floors defined, build a synthetic single-floor view from top-level data
    if (!parking.floors || parking.floors.length === 0) {
      const syntheticFloor = buildSyntheticFloor(parking);
      return res.json({
        success: true,
        data: {
          parkingId: parking._id,
          name: parking.name,
          location: parking.location,
          totalFloors: 1,
          totalCapacity: parking.capacity || 0,
          totalAvailable: parking.availableSlots || 0,
          floors: [syntheticFloor],
        },
      });
    }

    const floorSummary = parking.floors.map((floor) => ({
      floorNumber: floor.floorNumber,
      floorName: floor.floorName || `Floor ${floor.floorNumber}`,
      totalSlots: floor.totalSlots,
      availableSlots: floor.availableSlots,
      occupiedSlots: floor.totalSlots - floor.availableSlots,
      isCovered: floor.isCovered,
      occupancyPercent:
        floor.totalSlots > 0
          ? Math.round(
              ((floor.totalSlots - floor.availableSlots) / floor.totalSlots) *
                100
            )
          : 0,
      slotRows: floor.slotRows || [],
    }));

    res.json({
      success: true,
      data: {
        parkingId: parking._id,
        name: parking.name,
        location: parking.location,
        totalFloors: parking.floors.length,
        totalCapacity: parking.capacity || 0,
        totalAvailable: parking.availableSlots || 0,
        floors: floorSummary,
      },
    });
  } catch (error) {
    console.error("Floor visualization error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch floor data",
    });
  }
};

// GET /api/parking/:parkingId/floors/:floorNumber
// Returns detailed slot grid for a specific floor
export const getFloorDetail = async (req, res) => {
  try {
    const { parkingId, floorNumber } = req.params;

    const parking = await Parking.findById(parkingId).lean();
    if (!parking) {
      return res.status(404).json({ success: false, message: "Parking not found" });
    }

    if (!parking.floors || parking.floors.length === 0) {
      const syntheticFloor = buildSyntheticFloor(parking);
      return res.json({ success: true, data: syntheticFloor });
    }

    const floor = parking.floors.find(
      (f) => f.floorNumber === parseInt(floorNumber)
    );

    if (!floor) {
      return res.status(404).json({ success: false, message: "Floor not found" });
    }

    res.json({
      success: true,
      data: {
        floorNumber: floor.floorNumber,
        floorName: floor.floorName || `Floor ${floor.floorNumber}`,
        totalSlots: floor.totalSlots,
        availableSlots: floor.availableSlots,
        occupiedSlots: floor.totalSlots - floor.availableSlots,
        isCovered: floor.isCovered,
        occupancyPercent:
          floor.totalSlots > 0
            ? Math.round(
                ((floor.totalSlots - floor.availableSlots) / floor.totalSlots) *
                  100
              )
            : 0,
        slotRows: floor.slotRows || [],
      },
    });
  } catch (error) {
    console.error("Floor detail error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch floor detail" });
  }
};

// Helper: builds a synthetic floor from flat parking data when no floors are defined
function buildSyntheticFloor(parking) {
  const total = parking.capacity || 0;
  const available = parking.availableSlots || 0;
  const occupied = total - available;

  // Build slot rows: 5 slots per row, alternating A/B/C...
  const rows = [];
  const SLOTS_PER_ROW = 5;
  let slotIndex = 0;

  for (let r = 0; r < Math.ceil(total / SLOTS_PER_ROW); r++) {
    const rowLabel = String.fromCharCode(65 + r); // A, B, C...
    const slots = [];
    for (let s = 0; s < SLOTS_PER_ROW && slotIndex < total; s++, slotIndex++) {
      slots.push({
        slotId: `${rowLabel}${s + 1}`,
        isOccupied: slotIndex < occupied,
        isReserved: false,
        vehicleType: "any",
      });
    }
    rows.push({ row: rowLabel, slots });
  }

  return {
    floorNumber: 0,
    floorName: "Ground Floor",
    totalSlots: total,
    availableSlots: available,
    occupiedSlots: occupied,
    isCovered: parking.isCovered || false,
    occupancyPercent:
      total > 0 ? Math.round((occupied / total) * 100) : 0,
    slotRows: rows,
  };
}