// Default coordinates for Solapur, India
export const SOLAPUR_COORDS = {
  lat: 17.6599,
  lng: 75.9064,
};

export interface Coordinates {
  lat: number;
  lng: number;
}

// Get current location with fallback to Solapur
export const getCurrentLocation = (): Promise<Coordinates> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(SOLAPUR_COORDS);
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
        resolve(SOLAPUR_COORDS);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  });
};

// Check if a new report is near existing reports (within ~100 meters)
export const isNearExistingReport = (
  newLat: number,
  newLng: number,
  existingReports: { latitude: number; longitude: number }[]
): boolean => {
  const THRESHOLD_METERS = 100;

  for (const report of existingReports) {
    const distance = getDistanceInMeters(newLat, newLng, report.latitude, report.longitude);
    if (distance < THRESHOLD_METERS) {
      return true;
    }
  }
  return false;
};

// Haversine formula to calculate distance between two coordinates
const getDistanceInMeters = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371000; // Earth's radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (deg: number): number => deg * (Math.PI / 180);

// Format coordinates for display
export const formatCoords = (lat: number, lng: number): string => {
  return `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`;
};

// Reverse geocoding using OpenStreetMap Nominatim API
export const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'SolapurRoadRescuer/1.0', // Required by Nominatim
        },
      }
    );

    if (!response.ok) {
      throw new Error('Geocoding failed');
    }

    const data = await response.json();

    // Build a readable address from the components
    const address = data.address;
    const parts: string[] = [];

    // Add road/street
    if (address.road) parts.push(address.road);
    
    // Add neighborhood/suburb
    if (address.neighbourhood) parts.push(address.neighbourhood);
    else if (address.suburb) parts.push(address.suburb);
    
    // Add city/town
    if (address.city) parts.push(address.city);
    else if (address.town) parts.push(address.town);
    else if (address.village) parts.push(address.village);
    
    // Add state
    if (address.state) parts.push(address.state);
    
    // Add postcode if available
    if (address.postcode) parts.push(address.postcode);

    return parts.length > 0 ? parts.join(', ') : data.display_name || formatCoords(lat, lng);
  } catch (error) {
    // Fallback to coordinates if geocoding fails
    return formatCoords(lat, lng);
  }
};
