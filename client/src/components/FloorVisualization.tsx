import React, { useEffect, useState } from "react";
import * as Icons from "lucide-react";
import { useTheme } from "../context/ThemeContext";

interface SlotData {
  slotId: string;
  isOccupied: boolean;
  isReserved: boolean;
  vehicleType: string;
}

interface SlotRow {
  row: string;
  slots: SlotData[];
}

interface FloorData {
  floorNumber: number;
  floorName: string;
  totalSlots: number;
  availableSlots: number;
  occupiedSlots: number;
  isCovered: boolean;
  occupancyPercent: number;
  slotRows: SlotRow[];
}

interface FloorOverview {
  parkingId: string;
  name: string;
  location: string;
  totalFloors: number;
  totalCapacity: number;
  totalAvailable: number;
  floors: FloorData[];
}

interface FloorVisualizationProps {
  parkingId: string;
  parkingName: string;
  onClose: () => void;
}

const FloorVisualization: React.FC<FloorVisualizationProps> = ({
  parkingId,
  parkingName,
  onClose,
}) => {
  const [overview, setOverview] = useState<FloorOverview | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<"all" | "available" | "occupied">("all");

  const { theme } = useTheme();

  const tc = {
    bg: theme === "light" ? "bg-gray-50" : "bg-[#191919]",
    cardBg: theme === "light" ? "bg-white" : "bg-[#1a1a1a]",
    cardBorder: theme === "light" ? "border-gray-200" : "border-[#1B42CB]/20",
    text: theme === "light" ? "text-gray-900" : "text-[#EEECF6]",
    textSecondary: theme === "light" ? "text-gray-600" : "text-[#EEECF6]/70",
    textMuted: theme === "light" ? "text-gray-400" : "text-[#EEECF6]/40",
    tabActive:
      theme === "light"
        ? "bg-blue-600 text-white"
        : "bg-gradient-to-r from-[#1B42CB] to-[#FF2F6C] text-white",
    tabInactive:
      theme === "light"
        ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
        : "bg-white/5 text-[#EEECF6]/60 hover:bg-white/10",
  };

  useEffect(() => {
    const fetchFloors = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/parking/${parkingId}/floors`);
        const data = await res.json();
        if (data.success) {
          setOverview(data.data);
          if (data.data?.floors && data.data.floors.length > 0) {
            setSelectedFloor(data.data.floors[0].floorNumber ?? 0);
          }
        } else {
          setError(data.message || "Failed to load floor data");
        }
      } catch {
        setError("Could not reach the server.");
      } finally {
        setLoading(false);
      }
    };
    fetchFloors();
  }, [parkingId]);

  const getOccupancyColor = (pct: number) => {
    if (pct >= 90) return "text-red-500";
    if (pct >= 60) return "text-yellow-500";
    return "text-green-500";
  };

  const getOccupancyBarColor = (pct: number) => {
    if (pct >= 90) return "bg-red-500";
    if (pct >= 60) return "bg-yellow-400";
    return "bg-green-500";
  };

  const getSlotColor = (slot: SlotData) => {
    if (slot.isOccupied) return "bg-red-500/80 border-red-600";
    if (slot.isReserved) return "bg-yellow-400/80 border-yellow-500";
    return theme === "light"
      ? "bg-green-100 border-green-400 hover:bg-green-200"
      : "bg-green-500/20 border-green-500/60 hover:bg-green-500/30";
  };

  const getVehicleIcon = (vehicleType: string) => {
    switch (vehicleType) {
      case "bike":
        return "🏍";
      case "ev":
        return "⚡";
      case "disabled":
        return "♿";
      default:
        return "🚗";
    }
  };

  const currentFloor = overview?.floors?.find(
    (f) => f.floorNumber === selectedFloor
  );

  const filteredRows: SlotRow[] =
    currentFloor?.slotRows?.map((row) => ({
      ...row,
      slots: (row.slots || []).filter((slot) => {
        if (filterType === "available") return !slot.isOccupied && !slot.isReserved;
        if (filterType === "occupied") return slot.isOccupied || slot.isReserved;
        return true;
      }),
    })) ?? [];

  // Determine if there are rows to display based on original slots config
  const hasRows = currentFloor?.slotRows && currentFloor.slotRows.length > 0;
  
  // Determine if our filtered selection has any blocks left to avoid empty lists
  const totalFilteredSlotsCount = filteredRows.reduce((acc, current) => acc + current.slots.length, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div
        className={`w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden ${tc.cardBg} ${tc.cardBorder}`}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#1B42CB]/20 bg-gradient-to-r from-[#1B42CB]/10 to-[#FF2F6C]/10 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1B42CB] to-[#FF2F6C] flex items-center justify-center">
                <Icons.Layers className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className={`text-lg font-bold ${tc.text}`}>
                  Floor Visualization
                </h2>
                <p className={`text-sm ${tc.textSecondary}`}>{parkingName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${tc.text}`}
            >
              <Icons.X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-10 h-10 border-2 border-[#1B42CB]/30 border-t-[#1B42CB] rounded-full animate-spin" />
              <p className={`text-sm ${tc.textSecondary}`}>
                Loading floor data…
              </p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Icons.AlertTriangle className="w-10 h-10 text-[#FF2F6C]" />
              <p className={`text-sm ${tc.textSecondary}`}>{error}</p>
            </div>
          )}

          {!loading && !error && overview && (
            <>
              {/* Summary stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div
                  className={`rounded-xl border p-4 ${tc.cardBorder} ${theme === "light" ? "bg-gray-50" : "bg-white/5"}`}
                >
                  <p className={`text-xs ${tc.textMuted} mb-1`}>Total Capacity</p>
                  <p className={`text-2xl font-bold ${tc.text}`}>
                    {overview.totalCapacity}
                  </p>
                </div>
                <div
                  className={`rounded-xl border p-4 ${tc.cardBorder} ${theme === "light" ? "bg-green-50" : "bg-green-500/10"}`}
                >
                  <p className={`text-xs ${tc.textMuted} mb-1`}>Available</p>
                  <p className="text-2xl font-bold text-green-500">
                    {overview.totalAvailable}
                  </p>
                </div>
                <div
                  className={`rounded-xl border p-4 ${tc.cardBorder} ${theme === "light" ? "bg-red-50" : "bg-red-500/10"}`}
                >
                  <p className={`text-xs ${tc.textMuted} mb-1`}>Occupied</p>
                  <p className="text-2xl font-bold text-red-500">
                    {overview.totalCapacity - overview.totalAvailable}
                  </p>
                </div>
              </div>

              {/* Floor tabs */}
              {overview.floors && overview.floors.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {overview.floors.map((floor) => (
                    <button
                      key={floor.floorNumber}
                      onClick={() => setSelectedFloor(floor.floorNumber)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                        selectedFloor === floor.floorNumber
                          ? tc.tabActive
                          : tc.tabInactive
                      }`}
                    >
                      <Icons.Layers className="w-4 h-4" />
                      {floor.floorName}
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded-full ${
                          selectedFloor === floor.floorNumber
                            ? "bg-white/20"
                            : theme === "light"
                            ? "bg-gray-200"
                            : "bg-white/10"
                        }`}
                      >
                        {floor.availableSlots} free
                  </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Selected floor detail */}
              {currentFloor && (
                <>
                  {/* Floor occupancy bar */}
                  <div
                    className={`rounded-xl border p-4 mb-5 ${tc.cardBorder} ${theme === "light" ? "bg-gray-50" : "bg-white/5"}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${tc.text}`}>
                          {currentFloor.floorName}
                        </span>
                        {currentFloor.isCovered && (
                          <span
                            className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${theme === "light" ? "bg-blue-100 text-blue-700" : "bg-blue-500/20 text-blue-300"}`}
                          >
                            <Icons.Umbrella className="w-3 h-3" />
                            Covered
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-sm font-bold ${getOccupancyColor(currentFloor.occupancyPercent)}`}
                      >
                        {currentFloor.occupancyPercent}% occupied
                      </span>
                    </div>
                    <div
                      className={`h-3 rounded-full overflow-hidden ${theme === "light" ? "bg-gray-200" : "bg-white/10"}`}
                    >
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${getOccupancyBarColor(currentFloor.occupancyPercent)}`}
                        style={{ width: `${currentFloor.occupancyPercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-2 text-xs">
                      <span className="text-green-500">
                        {currentFloor.availableSlots} available
                      </span>
                      <span className="text-red-500">
                        {currentFloor.occupiedSlots} occupied
                      </span>
                    </div>
                  </div>

                  {/* Filter buttons */}
                  <div className="flex gap-2 mb-4">
                    {(["all", "available", "occupied"] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setFilterType(f)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          filterType === f
                            ? "bg-[#1B42CB] text-white"
                            : tc.tabInactive
                        }`}
                      >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                      </button>
                    ))}
                  </div>

                  {/* Slot grid with cross-checks */}
                  {hasRows ? (
                    totalFilteredSlotsCount > 0 ? (
                      <div className="space-y-3">
                        {filteredRows.map((row) =>
                          row.slots.length === 0 ? null : (
                            <div key={row.row} className="flex items-center gap-3">
                              <span
                                className={`text-xs font-bold w-5 shrink-0 ${tc.textMuted}`}
                              >
                                {row.row}
                              </span>
                              <div className="flex flex-wrap gap-2">
                                {row.slots.map((slot) => (
                                  <div
                                    key={slot.slotId}
                                    title={`Slot ${slot.slotId} — ${
                                      slot.isOccupied
                                        ? "Occupied"
                                        : slot.isReserved
                                        ? "Reserved"
                                        : "Available"
                                    }`}
                                    className={`w-12 h-12 rounded-lg border-2 flex flex-col items-center justify-center text-xs font-semibold cursor-default transition-all duration-150 ${getSlotColor(slot)}`}
                                  >
                                    <span className="text-base leading-none">
                                      {getVehicleIcon(slot.vehicleType)}
                                    </span>
                                    <span
                                      className={`mt-0.5 ${tc.text} text-[10px]`}
                                    >
                                      {slot.slotId}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <div className={`text-center py-8 ${tc.textMuted}`}>
                        No slots matching "{filterType}" found on this floor.
                      </div>
                    )
                  ) : (
                    <div className={`text-center py-8 ${tc.textMuted}`}>
                      No slot-level data available for this floor.
                    </div>
                  )}

                  {/* Legend */}
                  <div
                    className={`mt-6 pt-4 border-t ${tc.cardBorder} flex flex-wrap gap-4`}
                  >
                    {[
                      {
                        color:
                          theme === "light"
                            ? "bg-green-100 border-green-400"
                            : "bg-green-500/20 border-green-500/60",
                        label: "Available",
                      },
                      {
                        color: "bg-yellow-400/80 border-yellow-500",
                        label: "Reserved",
                      },
                      {
                        color: "bg-red-500/80 border-red-600",
                        label: "Occupied",
                      },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-2">
                        <div
                          className={`w-5 h-5 rounded border-2 ${item.color}`}
                        />
                        <span className={`text-xs ${tc.textSecondary}`}>
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FloorVisualization;