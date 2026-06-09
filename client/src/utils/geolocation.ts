export const getUserLocation = (): Promise<{ lat: number; lng: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.warn("Geolocation permission error:", error);
        let errMsg = "Geolocation denied or unavailable.";
        if (error.code === error.PERMISSION_DENIED) {
          errMsg = "Geolocation permission denied. Please allow location access to view the route.";
        }
        reject(new Error(errMsg));
      }
    );
  });
};
