import * as React from "react";
import * as Icons from "lucide-react";
import type { ParkingSlot } from "../hooks/useParkingSlots";
import { useThemeClasses } from "../hooks/useThemeClasses";
import { calculateDistance, getDirectionsUrl } from "../utils/distance";
import { getStatusBadge } from "../utils/parkingHelpers";

interface MapViewProps {
  filteredAndSortedSlots: ParkingSlot[];
  userLocation: { lat: number; lng: number } | null;
  selectedMapSlot: ParkingSlot | null;
  setSelectedMapSlot: (slot: ParkingSlot | null) => void;
  onBookNow: (slot: ParkingSlot) => void;
  setFloorSlot: (slot: ParkingSlot) => void;
  setPredictionSlot: (slot: ParkingSlot) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  filteredAndSortedSlots,
  userLocation,
  selectedMapSlot,
  setSelectedMapSlot,
  onBookNow,
  setFloorSlot,
  setPredictionSlot,
}) => {
  const themeClasses = useThemeClasses();

  if (!userLocation) {
    return (
      <div
        className={`backdrop-blur-xl ${themeClasses.cardBg} ${themeClasses.cardBorder} border rounded-2xl p-12 text-center`}
      >
        <div
          className={`w-24 h-24 bg-gradient-to-br ${themeClasses.gradient.accent}/20 rounded-full flex items-center justify-center mx-auto mb-6 border ${themeClasses.border}`}
        >
          <Icons.MapPin className={`w-12 h-12 ${themeClasses.text}`} />
        </div>
        <h3 className={`text-2xl font-bold ${themeClasses.text} mb-3`}>Loading Map...</h3>
        <p className={`${themeClasses.textSecondary} mb-6`}>
          Fetching your location to show nearby parking slots
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div
        className={`backdrop-blur-xl ${themeClasses.cardBg} ${themeClasses.cardBorder} border rounded-2xl overflow-hidden shadow-xl`}
      >
        <div className="h-[500px] relative">
          <div
            className="absolute inset-0 bg-gradient-to-br from-[#1B42CB]/20 to-[#FF2F6C]/20"
            style={{
              backgroundImage: `
                radial-gradient(circle at 20% 30%, #1B42CB 2px, transparent 2px),
                radial-gradient(circle at 50% 50%, #FF2F6C 3px, transparent 3px),
                radial-gradient(circle at 80% 70%, #1B42CB 2px, transparent 2px)
              `,
              backgroundSize: "100px 100px",
            }}
          >
            {/* User Location Pin */}
            <div
              className="absolute w-8 h-8 transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: "50%", top: "50%" }}
            >
              <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 border-2 border-white shadow-lg animate-pulse"></div>
              <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-30"></div>
            </div>

            {/* Parking Slot Pins */}
            {filteredAndSortedSlots.map((slot, index) => {
              if (!slot.coordinates) return null;
              const latDiff = slot.coordinates.lat - userLocation.lat;
              const lngDiff = slot.coordinates.lng - userLocation.lng;
              const left = 50 + lngDiff * 100;
              const top = 50 - latDiff * 100;

              return (
                <div
                  key={slot._id}
                  className={`absolute w-10 h-10 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 hover:scale-125 ${
                    selectedMapSlot?._id === slot._id ? "z-10 scale-125" : ""
                  }`}
                  style={{
                    left: `${Math.max(10, Math.min(90, left))}%`,
                    top: `${Math.max(10, Math.min(90, top))}%`,
                  }}
                  onClick={() => setSelectedMapSlot(slot)}
                >
                  <div
                    className={`
                      w-full h-full rounded-full flex items-center justify-center
                      ${
                        slot.status === "available"
                          ? "bg-gradient-to-br from-green-500 to-emerald-400"
                          : slot.status === "occupied"
                          ? "bg-gradient-to-br from-red-500 to-pink-400"
                          : "bg-gradient-to-br from-yellow-500 to-orange-400"
                      }
                      border-2 border-white shadow-lg
                    `}
                  >
                    <span className="text-white text-xs font-bold">P{index + 1}</span>
                  </div>
                  {selectedMapSlot?._id === slot._id && (
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                      <div
                        className={`${themeClasses.cardBgSecondary} ${themeClasses.cardBorder} border rounded-xl p-3 shadow-xl min-w-[200px]`}
                      >
                        <div className={`font-bold ${themeClasses.text} text-sm mb-1`}>
                          {slot.name}
                        </div>
                        <div className={`text-xs ${themeClasses.textSecondary} mb-2`}>
                          {slot.location}
                        </div>
                        <div className="flex justify-between items-center">
                          <span className={`${themeClasses.text} font-bold`}>
                            ₹{slot.pricePerHour}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              slot.status === "available"
                                ? "bg-green-500/20 text-green-300"
                                : slot.status === "occupied"
                                ? "bg-red-500/20 text-red-300"
                                : "bg-yellow-500/20 text-yellow-300"
                            }`}
                          >
                            {getStatusBadge(slot.status)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Map Legend */}
            <div
              className={`absolute bottom-4 right-4 backdrop-blur-xl ${themeClasses.cardBgSecondary} ${themeClasses.cardBorder} border rounded-xl p-4`}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-400 font-medium"></div>
                  <span className={`text-xs ${themeClasses.text}`}>Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-br from-red-500 to-pink-400"></div>
                  <span className={`text-xs ${themeClasses.text}`}>Occupied</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-br from-yellow-500 to-orange-400"></div>
                  <span className={`text-xs ${themeClasses.text}`}>Maintenance</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400"></div>
                  <span className={`text-xs ${themeClasses.text}`}>Your Location</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Slot Information Sheet */}
      {selectedMapSlot && (
        <div
          className={`backdrop-blur-xl ${themeClasses.cardBg} ${themeClasses.cardBorder} border rounded-2xl p-6 shadow-xl`}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className={`text-xl font-bold ${themeClasses.text}`}>{selectedMapSlot.name}</h3>
              <p className={themeClasses.textSecondary}>{selectedMapSlot.location}</p>
            </div>
            <button
              onClick={() => setSelectedMapSlot(null)}
              className={`w-8 h-8 rounded-lg ${themeClasses.cardBgSecondary} border ${themeClasses.border} flex items-center justify-center ${themeClasses.text} ${themeClasses.hover} transition-colors`}
            >
              <Icons.X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className={`p-4 ${themeClasses.cardBgSecondary} rounded-xl`}>
              <div className={`text-sm ${themeClasses.textSecondary} mb-1`}>Price</div>
              <div className={`text-2xl font-bold ${themeClasses.text}`}>
                ₹{selectedMapSlot.pricePerHour}
                <span className={`text-sm ${themeClasses.textSecondary}`}>/hour</span>
              </div>
            </div>
            <div className={`p-4 ${themeClasses.cardBgSecondary} rounded-xl`}>
              <div className={`text-sm ${themeClasses.textSecondary} mb-1`}>Availability</div>
              <div className={`text-2xl font-bold ${themeClasses.text}`}>
                {selectedMapSlot.availableSlots}
                <span className={`text-sm ${themeClasses.textSecondary}`}>
                  /{selectedMapSlot.capacity} slots
                </span>
              </div>
            </div>
            <div className={`p-4 ${themeClasses.cardBgSecondary} rounded-xl`}>
              <div className={`text-sm ${themeClasses.textSecondary} mb-1`}>Distance</div>
              <div className={`text-2xl font-bold ${themeClasses.text}`}>
                {userLocation && selectedMapSlot.coordinates
                  ? calculateDistance(
                      userLocation.lat,
                      userLocation.lng,
                      selectedMapSlot.coordinates.lat,
                      selectedMapSlot.coordinates.lng
                    )
                  : selectedMapSlot.distance}
              </div>
            </div>
          </div>

          {selectedMapSlot.emergencyContact?.phone && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <Icons.AlertTriangle className="w-5 h-5 text-red-500" />
                <span className={`font-semibold ${themeClasses.text}`}>Emergency Assistance</span>
              </div>
              <div className="flex gap-3">
                <a
                  href={`tel:${selectedMapSlot.emergencyContact.phone}`}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors font-medium"
                >
                  <Icons.PhoneCall className="w-4 h-4" />
                  Call Support
                </a>
                {selectedMapSlot.emergencyContact.supportEmail && (
                  <a
                    href={`mailto:${selectedMapSlot.emergencyContact.supportEmail}`}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 ${themeClasses.cardBgSecondary} border ${themeClasses.border} ${themeClasses.text} rounded-xl ${themeClasses.hover} transition-colors font-medium`}
                  >
                    <Icons.Mail className="w-4 h-4" />
                    Email Support
                  </a>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-3 flex-wrap">
            <a
              href={getDirectionsUrl(selectedMapSlot)}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex-1 px-4 py-3 ${themeClasses.cardBgSecondary} border ${themeClasses.border} ${themeClasses.textSecondary} font-semibold rounded-xl ${themeClasses.hover} transition-all duration-300 flex items-center justify-center gap-2`}
            >
              <Icons.Navigation className="w-4 h-4" />
              Directions
            </a>

            <button
              onClick={() => setFloorSlot(selectedMapSlot)}
              title="View floor-wise slot layout"
              className={`px-4 py-3 ${themeClasses.cardBgSecondary} border ${themeClasses.border} ${themeClasses.textSecondary} font-semibold rounded-xl ${themeClasses.hover} transition-all duration-300 flex items-center justify-center gap-2`}
            >
              <Icons.Layers className="w-4 h-4" />
              Floors
            </button>

            <button
              onClick={() => setPredictionSlot(selectedMapSlot)}
              className={`px-4 py-3 ${themeClasses.cardBgSecondary} border ${themeClasses.border} ${themeClasses.textSecondary} font-semibold rounded-xl ${themeClasses.hover} transition-all duration-300 flex items-center justify-center gap-2`}
            >
              <Icons.TrendingUp className="w-4 h-4" />
              Forecast
            </button>

            <button
              onClick={() => onBookNow(selectedMapSlot)}
              disabled={
                selectedMapSlot.status?.toLowerCase() !== "available" ||
                selectedMapSlot.availableSlots === 0
              }
              className="flex-1 px-6 py-3 bg-gradient-to-r from-[#1B42CB] to-[#FF2F6C] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#FF2F6C]/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Icons.MapPin className="w-4 h-4" />
              Book Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;
