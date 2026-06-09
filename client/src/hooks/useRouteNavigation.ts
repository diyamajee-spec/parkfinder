import { useState } from "react";

export const useRouteNavigation = () => {
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateRoute = async (
    userLat: number,
    userLng: number,
    destLat: number,
    destLng: number
  ): Promise<[number, number][] | null> => {
    if (
      typeof userLat !== "number" ||
      typeof userLng !== "number" ||
      typeof destLat !== "number" ||
      typeof destLng !== "number" ||
      isNaN(userLat) ||
      isNaN(userLng) ||
      isNaN(destLat) ||
      isNaN(destLng)
    ) {
      setError("Invalid or missing coordinates for navigation.");
      return null;
    }

    setLoading(true);
    setError(null);

    const url = `https://router.project-osrm.org/route/v1/driving/${userLng},${userLat};${destLng},${destLat}?overview=full&geometries=geojson`;

    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("Routing service failed to respond correctly.");
      }
      const data = await res.json();
      if (data.code !== "Ok" || !data.routes || data.routes.length === 0) {
        throw new Error("No route found to this location.");
      }

      const rawCoords = data.routes[0].geometry.coordinates;
      if (!rawCoords || rawCoords.length === 0) {
        throw new Error("Empty route geometry returned.");
      }

      // OSRM returns coordinates as [lng, lat], map to [lat, lng] for Leaflet
      const formattedCoords = rawCoords.map(
        (coord: [number, number]) => [coord[1], coord[0]] as [number, number]
      );

      setRouteCoords(formattedCoords);
      return formattedCoords;
    } catch (err) {
      console.error("OSRM calculation failed:", err);
      const errMsg =
        err instanceof Error ? err.message : "Failed to calculate route.";
      setError(errMsg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearRoute = () => {
    setRouteCoords([]);
    setError(null);
    setLoading(false);
  };

  return {
    routeCoords,
    loading,
    error,
    calculateRoute,
    clearRoute,
  };
};
