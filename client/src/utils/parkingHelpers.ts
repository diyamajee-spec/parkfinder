export const getStatusBadge = (status: string): string => {
  switch (status?.toLowerCase()) {
    case "available":
      return "Available";
    case "occupied":
      return "Occupied";
    case "maintenance":
      return "Maintenance";
    default:
      return status || "";
  }
};

export const getAvailabilityPercentage = (
  availableSlots: number,
  capacity: number
): number => {
  if (!capacity) return 0;
  return Math.round((availableSlots / capacity) * 100);
};

export const getAvailabilityText = (percentage: number): string => {
  if (percentage >= 70) return "High";
  if (percentage >= 40) return "Moderate";
  if (percentage > 0) return "Limited";
  return "Full";
};

export const getAvailabilityColor = (percentage: number): string => {
  if (percentage >= 70) return "text-green-400";
  if (percentage >= 40) return "text-yellow-400";
  if (percentage > 0) return "text-orange-400";
  return "text-red-400";
};

export const getRatingColor = (rating: number): string => {
  if (rating >= 4.5) return "text-green-400";
  if (rating >= 4.0) return "text-yellow-400";
  if (rating >= 3.0) return "text-orange-400";
  return "text-red-400";
};
