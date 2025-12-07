import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

interface ParkingSlot {
  _id: string;
  name?: string;
  location?: string;
  pricePerHour?: number;
  status?: string;
  availableSlots?: number;
  capacity?: number;
  distance?: string;
  rating?: number;
}

interface Booking {
  _id: string;
  userId?: string;
  parkingId: ParkingSlot;
  bookingDate?: string;
  duration?: number;
  totalPrice?: number;
  bookingStatus?: "active" | "cancelled" | "completed";
}

const BookedSlotsPage: React.FC = () => {
  const [bookedSlots, setBookedSlots] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  
  const { token } = useAuth();

  useEffect(() => {
    const fetchBookedSlots = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/bookings/my-bookings", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        const data = await res.json();

        if (data.success) {
          setBookedSlots(data.data);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchBookedSlots();
  }, [token]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/bookings/cancel/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        // Update local state
        setBookedSlots(prev => 
          prev.map(booking => 
            booking._id === id 
              ? { ...booking, bookingStatus: "cancelled" } 
              : booking
          )
        );
        alert("Booking cancelled successfully!");
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to cancel booking. Please try again.");
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-500/20 text-green-300 border-l-4 border-green-500";
      case "cancelled":
        return "bg-red-500/20 text-red-300 border-l-4 border-red-500";
      case "completed":
        return "bg-blue-500/20 text-blue-300 border-l-4 border-blue-500";
      default:
        return "bg-gray-500/20 text-gray-300 border-l-4 border-gray-500";
    }
  };

  const getStatusText = (status: string): string => {
    switch (status?.toLowerCase()) {
      case "active":
        return "Active";
      case "cancelled":
        return "Cancelled";
      case "completed":
        return "Completed";
      default:
        return "Unknown";
    }
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateEndTime = (dateString?: string, duration?: number): string => {
    if (!dateString || !duration) return "N/A";
    const startDate = new Date(dateString);
    const endDate = new Date(startDate.getTime() + duration * 60 * 60 * 1000);
    return endDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredBookings = bookedSlots.filter((booking) => {
    // Apply status filter
    if (filter !== "all" && booking.bookingStatus !== filter) {
      return false;
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        booking.parkingId?.name?.toLowerCase().includes(term) ||
        booking.parkingId?.location?.toLowerCase().includes(term) ||
        booking._id.toLowerCase().includes(term)
      );
    }

    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#191919] via-[#0f0f0f] to-[#191919] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-linear-to-r from-[#1B42CB] to-[#FF2F6C] animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-[#191919]"></div>
            </div>
          </div>
          <p className="mt-6 text-[#EEECF6] text-lg font-semibold">
            Loading your bookings...
          </p>
          <p className="text-[#EEECF6]/60 mt-2">Fetching booking details</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#191919] via-[#0f0f0f] to-[#191919] flex items-center justify-center p-4">
        <div className="backdrop-blur-xl bg-[#1B42CB]/10 border border-[#1B42CB]/30 rounded-3xl p-8 max-w-md w-full shadow-2xl shadow-[#1B42CB]/10">
          <div className="text-center">
            <div className="w-20 h-20 bg-linear-to-br from-[#FF2F6C]/20 to-[#1B42CB]/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#FF2F6C]/30">
              <span className="text-3xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-bold text-[#EEECF6] mb-3">
              Loading Error
            </h2>
            <p className="text-[#EEECF6]/70 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-linear-to-r from-[#1B42CB] to-[#1B42CB]/80 text-white font-semibold rounded-xl hover:from-[#1B42CB]/90 hover:to-[#1B42CB]/70 transition-all duration-300 hover:shadow-lg hover:shadow-[#1B42CB]/20"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#191919] via-[#0f0f0f] to-[#191919] p-4 md:p-6">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#1B42CB]/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#FF2F6C]/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8 md:mb-12">
          <div className="backdrop-blur-xl bg-[#1B42CB]/10 border border-[#1B42CB]/20 rounded-2xl p-6 md:p-8 shadow-2xl shadow-[#1B42CB]/10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-linear-to-br from-[#1B42CB] to-[#FF2F6C] flex items-center justify-center">
                    <span className="text-xl">📅</span>
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-[#EEECF6] to-[#1B42CB] bg-clip-text text-transparent">
                      My Bookings
                    </h1>
                    <p className="text-[#EEECF6]/60">
                      Manage your parking reservations
                    </p>
                  </div>
                </div>
              </div>

              <div className="backdrop-blur-xl bg-[#191919]/80 border border-[#EEECF6]/10 rounded-xl p-4">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white mb-1">
                      {bookedSlots.length}
                    </div>
                    <div className="text-sm text-[#EEECF6]/60">
                      Total Bookings
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white mb-1">
                      {
                        bookedSlots.filter((b) => b.bookingStatus === "active")
                          .length
                      }
                    </div>
                    <div className="text-sm text-[#EEECF6]/60">Active</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Controls */}
        <div className="mb-8 backdrop-blur-xl bg-[#191919]/60 border border-[#1B42CB]/20 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <svg
                  className="w-5 h-5 text-[#1B42CB]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search bookings by name, location, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[#191919]/50 border border-[#1B42CB]/30 rounded-xl text-[#EEECF6] placeholder-[#EEECF6]/40 focus:outline-none focus:border-[#1B42CB] focus:ring-2 focus:ring-[#1B42CB]/20 transition-all duration-300"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-3 bg-[#191919]/50 border border-[#1B42CB]/30 rounded-xl text-[#EEECF6] focus:outline-none focus:border-[#1B42CB] focus:ring-2 focus:ring-[#1B42CB]/20 transition-all duration-300"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilter("all");
                }}
                className="px-6 py-3 bg-[#191919] border border-[#1B42CB]/30 text-[#EEECF6] font-semibold rounded-xl hover:bg-[#1B42CB]/10 transition-all duration-300"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="backdrop-blur-xl bg-[#191919]/60 border border-[#1B42CB]/20 rounded-2xl p-12 text-center">
            <div className="w-24 h-24 bg-linear-to-br from-[#1B42CB]/20 to-[#FF2F6C]/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#1B42CB]/30">
              <span className="text-3xl">📭</span>
            </div>
            <h3 className="text-2xl font-bold text-[#EEECF6] mb-3">
              {bookedSlots.length === 0
                ? "No Bookings Yet"
                : "No Matching Bookings"}
            </h3>
            <p className="text-[#EEECF6]/60 mb-6">
              {bookedSlots.length === 0
                ? "You haven't made any parking bookings yet. Start by booking a slot!"
                : "Try adjusting your search or filter criteria."}
            </p>
            {bookedSlots.length === 0 && (
              <a
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-[#1B42CB] to-[#FF2F6C] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#FF2F6C]/20 transition-all duration-300"
              >
                Book Your First Slot
                <span>→</span>
              </a>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBookings.map((booking) => (
              <div
                key={booking._id}
                className="group backdrop-blur-xl bg-[#191919]/60 border border-[#1B42CB]/20 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-[#1B42CB]/10 hover:border-[#1B42CB]/40 transition-all duration-500"
              >
                {/* Status Header */}
                <div
                  className={`px-6 py-4 ${getStatusColor(
                    booking.bookingStatus || ""
                  )}`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-current"></div>
                      <span className="font-bold text-sm">
                        {getStatusText(booking.bookingStatus || "")}
                      </span>
                      <span className="text-xs px-2 py-1 bg-black/20 rounded-full">
                        Booking ID: {booking._id.substring(0, 8)}...
                      </span>
                    </div>
                    <div className="text-sm font-medium">
                      {formatDate(booking.bookingDate)}
                    </div>
                  </div>
                </div>

                {/* Booking Content */}
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Parking Slot Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <h3 className="text-xl font-bold text-[#EEECF6] mb-2">
                            {booking.parkingId?.name || "Unknown Parking"}
                          </h3>
                          <div className="flex items-center gap-4 text-[#EEECF6]/60">
                            <div className="flex items-center gap-2">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                              </svg>
                              <span>
                                {booking.parkingId?.location || "N/A"}
                              </span>
                            </div>
                            {booking.parkingId?.distance && (
                              <div className="flex items-center gap-2">
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                  />
                                </svg>
                                <span>{booking.parkingId.distance}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold bg-linear-to-r from-[#1B42CB] to-[#FF2F6C] bg-clip-text text-transparent">
                            ₹{booking.parkingId?.pricePerHour || 0}
                          </div>
                          <div className="text-sm text-[#EEECF6]/60">
                            per hour
                          </div>
                        </div>
                      </div>

                      {/* Booking Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        <div className="bg-[#191919]/50 border border-[#1B42CB]/10 rounded-xl p-4">
                          <div className="text-sm text-[#EEECF6]/60 mb-2">
                            Duration
                          </div>
                          <div className="text-lg font-bold text-[#EEECF6]">
                            {booking.duration || 1} hour
                            {booking.duration !== 1 ? "s" : ""}
                          </div>
                        </div>
                        <div className="bg-[#191919]/50 border border-[#1B42CB]/10 rounded-xl p-4">
                          <div className="text-sm text-[#EEECF6]/60 mb-2">
                            Total Price
                          </div>
                          <div className="text-lg font-bold text-[#EEECF6]">
                            ₹
                            {booking.totalPrice ||
                              booking.parkingId?.pricePerHour ||
                              0}
                          </div>
                        </div>
                        <div className="bg-[#191919]/50 border border-[#1B42CB]/10 rounded-xl p-4">
                          <div className="text-sm text-[#EEECF6]/60 mb-2">
                            Parking End
                          </div>
                          <div className="text-lg font-bold text-[#EEECF6]">
                            {calculateEndTime(
                              booking.bookingDate,
                              booking.duration
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Slot Availability */}
                      <div className="bg-[#191919]/50 border border-[#1B42CB]/10 rounded-xl p-4">
                        <div className="flex justify-between items-center mb-3">
                          <div className="text-sm font-medium text-[#EEECF6]">
                            Slot Availability
                          </div>
                          <div className="text-sm text-[#EEECF6]/60">
                            {booking.parkingId?.availableSlots || 0}/
                            {booking.parkingId?.capacity || 0} available
                          </div>
                        </div>
                        <div className="h-2 bg-[#191919] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-linear-to-r from-[#1B42CB] to-[#FF2F6C]"
                            style={{
                              width: `${Math.round(
                                ((booking.parkingId?.availableSlots || 0) /
                                  (booking.parkingId?.capacity || 1)) *
                                  100
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Action Panel */}
                    <div className="lg:w-64 border-l lg:border-l-0 lg:border-t border-[#1B42CB]/20 lg:pl-6 lg:pt-0 pt-6">
                      <div className="space-y-4">
                        <div className="bg-linear-to-br from-[#1B42CB]/10 to-[#FF2F6C]/10 rounded-xl p-4">
                          <div className="text-sm font-medium text-[#EEECF6] mb-2">
                            Quick Actions
                          </div>
                          <div className="space-y-2">
                            <button
                              className="w-full px-4 py-2 bg-[#191919] border border-[#1B42CB]/30 text-[#EEECF6] rounded-lg hover:bg-[#1B42CB]/10 transition-colors text-sm"
                              onClick={() =>
                                alert("Extend booking feature coming soon!")
                              }
                            >
                              Extend Booking
                            </button>
                            <button
                              className="w-full px-4 py-2 bg-[#191919] border border-[#1B42CB]/30 text-[#EEECF6] rounded-lg hover:bg-[#1B42CB]/10 transition-colors text-sm"
                              onClick={() =>
                                alert("Directions feature coming soon!")
                              }
                            >
                              Get Directions
                            </button>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDelete(booking._id)}
                          disabled={
                            booking.bookingStatus === "cancelled" ||
                            booking.bookingStatus === "completed"
                          }
                          className={`
                            w-full py-3 rounded-xl font-semibold text-lg
                            transition-all duration-300 flex items-center justify-center gap-2
                            ${
                              booking.bookingStatus === "active"
                                ? "bg-linear-to-r from-[#FF2F6C] to-[#FF2F6C]/80 text-white hover:shadow-lg hover:shadow-[#FF2F6C]/20"
                                : "bg-[#191919] text-[#EEECF6]/40 border border-[#1B42CB]/20 cursor-not-allowed"
                            }
                          `}
                        >
                          {booking.bookingStatus === "active" ? (
                            <>
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                              Cancel Booking
                            </>
                          ) : (
                            "Booking " +
                            getStatusText(booking.bookingStatus || "")
                          )}
                        </button>

                        <div className="text-xs text-[#EEECF6]/40 text-center pt-2">
                          {booking.bookingStatus === "active" && (
                            <p>You can cancel up to 1 hour before start time</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Footer */}
        {bookedSlots.length > 0 && (
          <div className="mt-8 backdrop-blur-xl bg-linear-to-r from-[#1B42CB]/10 to-[#FF2F6C]/10 border border-[#1B42CB]/20 rounded-2xl p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-2">
                  {
                    bookedSlots.filter((b) => b.bookingStatus === "active")
                      .length
                  }
                </div>
                <div className="text-[#EEECF6]/60">Active Bookings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-2">
                  {
                    bookedSlots.filter((b) => b.bookingStatus === "completed")
                      .length
                  }
                </div>
                <div className="text-[#EEECF6]/60">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-2">
                  {
                    bookedSlots.filter((b) => b.bookingStatus === "cancelled")
                      .length
                  }
                </div>
                <div className="text-[#EEECF6]/60">Cancelled</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-2">
                  ₹
                  {bookedSlots
                    .filter((b) => b.bookingStatus === "active")
                    .reduce(
                      (sum, b) =>
                        sum + (b.totalPrice || b.parkingId?.pricePerHour || 0),
                      0
                    )}
                </div>
                <div className="text-[#EEECF6]/60">Active Total</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookedSlotsPage;