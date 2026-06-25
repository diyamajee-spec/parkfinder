import Booking from "../models/Booking.js";

/**
 * GET /api/parking/:parkingId/peak-hours
 *
 * Analyzes historical booking data and returns 24-hour occupancy distribution
 * categorized as Peak / Moderate / Low traffic periods, plus the best time to visit.
 *
 * Security: Public endpoint (no auth required), consistent with GET /api/parking.
 * Only aggregated, anonymized booking statistics are returned — no user data.
 */
export const getPeakHours = async (req, res) => {
  try {
    const { parkingId } = req.params;

    // Fetch non-cancelled bookings for this location
    const bookings = await Booking.find({
      parkingId,
      bookingStatus: { $in: ["active", "completed"] },
    }).lean();

    if (bookings.length === 0) {
      return res.json({
        success: true,
        data: buildNeutralHours(),
        meta: {
          totalDataPoints: 0,
          message:
            "No historical data available. Showing estimated distribution.",
        },
      });
    }

    // Build hourly booking counts (0–23)
    const hourlyCounts = Array(24).fill(0);
    const hourlyDayCounts = Array(24).fill(0); // unique days per hour for averaging

    for (const booking of bookings) {
      const startHour = new Date(booking.bookingDate).getHours();
      const durationHours = Math.max(1, Math.ceil(booking.duration || 1));
      for (let h = 0; h < durationHours; h++) {
        const hour = (startHour + h) % 24;
        hourlyCounts[hour]++;
      }
      hourlyCounts[startHour]++;
      hourlyDayCounts[startHour]++;
    }

    const maxCount = Math.max(...hourlyCounts, 1);

    // Classify each hour
    const hours = hourlyCounts.map((count, hour) => {
      const normalizedPct = Math.round((count / maxCount) * 100);
      let label;
      let severity;
      if (normalizedPct >= 70) {
        label = "Peak";
        severity = "high";
      } else if (normalizedPct >= 35) {
        label = "Moderate";
        severity = "medium";
      } else {
        label = "Low";
        severity = "low";
      }

      const displayHour =
        hour === 0
          ? "12 AM"
          : hour < 12
          ? `${hour} AM`
          : hour === 12
          ? "12 PM"
          : `${hour - 12} PM`;

      return {
        hour,
        displayHour,
        count,
        normalizedPct,
        label,
        severity,
      };
    });

    // Find peak windows (consecutive high-traffic hours)
    const peakWindows = findConsecutiveWindows(hours, "high");
    const lowWindows = findConsecutiveWindows(hours, "low");

    // Best time to visit: earliest low window during typical daytime (6am–10pm)
    const bestTimes = lowWindows
  .filter((w) => w.startHour <= 22 && w.endHour >= 6) // Must overlap with 6 AM - 10 PM
  .map((w) => {
    // Clamp the start and end times to our 6 AM - 10 PM bounds
    const clampedStart = Math.max(6, w.startHour);
    const clampedEnd = Math.min(22, w.endHour);

    // Format the hours for clean display (e.g., "12 PM", "6 PM")
    const startDisplay = clampedStart === 12 ? "12 PM" : clampedStart > 12 ? `${clampedStart - 12} PM` : `${clampedStart} AM`;
    const endDisplay = clampedEnd === 12 ? "12 PM" : clampedEnd > 12 ? `${clampedEnd - 12} PM` : `${clampedEnd} AM`;

    return {
      ...w,
      startHour: clampedStart,
      endHour: clampedEnd,
      startDisplay,
      endDisplay,
      durationHours: clampedEnd - clampedStart + 1
    };
  })
  .slice(0, 3);

    res.json({
      success: true,
      data: {
        hours,
        peakWindows,
        lowWindows,
        bestTimes,
        summary: buildSummary(hours),
      },
      meta: {
        totalDataPoints: bookings.length,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Peak hours error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to compute peak hours",
    });
  }
};

// Groups consecutive hours of same severity into windows
function findConsecutiveWindows(hours, severity) {
  const windows = [];
  let inWindow = false;
  let windowStart = null;

  for (let i = 0; i < 24; i++) {
    if (hours[i].severity === severity && !inWindow) {
      inWindow = true;
      windowStart = i;
    } else if (hours[i].severity !== severity && inWindow) {
      windows.push({
        startHour: windowStart,
        endHour: i - 1,
        startDisplay: hours[windowStart].displayHour,
        endDisplay: hours[i - 1].displayHour,
        durationHours: i - windowStart,
      });
      inWindow = false;
      windowStart = null;
    }
  }
  if (inWindow && windowStart !== null) {
    windows.push({
      startHour: windowStart,
      endHour: 23,
      startDisplay: hours[windowStart].displayHour,
      endDisplay: "11 PM",
      durationHours: 24 - windowStart,
    });
  }
  return windows;
}

function buildSummary(hours) {
  const peakCount = hours.filter((h) => h.severity === "high").length;
  const moderateCount = hours.filter((h) => h.severity === "medium").length;
  const lowCount = hours.filter((h) => h.severity === "low").length;
  return {
    peakHoursCount: peakCount,
    moderateHoursCount: moderateCount,
    lowHoursCount: lowCount,
    busiestHour: hours.reduce((a, b) => (a.count > b.count ? a : b)),
    quietestHour: hours.reduce((a, b) => (a.count < b.count ? a : b)),
  };
}

function buildNeutralHours() {
  // Realistic default distribution when no data exists
  const defaults = [
    5, 3, 2, 2, 3, 8, 25, 60, 85, 80, 70, 75,
    90, 85, 75, 70, 80, 95, 85, 70, 55, 40, 25, 10,
  ];
  const max = Math.max(...defaults);

  return {
    hours: defaults.map((count, hour) => {
      const normalizedPct = Math.round((count / max) * 100);
      const label =
        normalizedPct >= 70 ? "Peak" : normalizedPct >= 35 ? "Moderate" : "Low";
      const severity =
        normalizedPct >= 70 ? "high" : normalizedPct >= 35 ? "medium" : "low";
      const displayHour =
        hour === 0
          ? "12 AM"
          : hour < 12
          ? `${hour} AM`
          : hour === 12
          ? "12 PM"
          : `${hour - 12} PM`;
      return { hour, displayHour, count, normalizedPct, label, severity };
    }),
    peakWindows: [],
    lowWindows: [],
    bestTimes: [
      { startHour: 10, endHour: 11, startDisplay: "10 AM", endDisplay: "11 AM", durationHours: 1 },
    ],
    summary: {
      peakHoursCount: 6,
      moderateHoursCount: 10,
      lowHoursCount: 8,
      busiestHour: { hour: 17, displayHour: "5 PM", normalizedPct: 100, label: "Peak", severity: "high", count: 95 },
      quietestHour: { hour: 3, displayHour: "3 AM", normalizedPct: 2, label: "Low", severity: "low", count: 2 },
    },
  };
}