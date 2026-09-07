export interface GeolocationResult {
  locationText: string;
  latitude: number | null;
  longitude: number | null;
  error?: string;
}

/**
 * Converts GPS coordinates (latitude, longitude) into a human-readable location address.
 * Never displays raw coordinates to the user. Never returns "PhysicalWorld".
 * Falls back to "Location unavailable" if detection fails.
 */
export async function reverseGeocode(latitude: number, longitude: number): Promise<string> {
  // 1. Primary: OpenStreetMap Nominatim reverse geocode
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=16&addressdetails=1`,
      {
        signal: controller.signal,
        headers: {
          'Accept-Language': 'en',
        },
      }
    );

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const addr = data?.address;
      if (addr) {
        const place =
          addr.shop ||
          addr.amenity ||
          addr.leisure ||
          addr.tourism ||
          addr.building ||
          addr.road ||
          addr.neighbourhood ||
          addr.suburb ||
          null;

        const city =
          addr.city ||
          addr.town ||
          addr.village ||
          addr.municipality ||
          addr.state_district ||
          null;

        const state = addr.state || null;

        const parts = [place, city, state].filter(Boolean);
        if (parts.length > 0) {
          return parts.join(', ');
        }
        if (data.display_name) {
          // Take first 2-3 segments of display name
          return data.display_name.split(',').slice(0, 3).map((s: string) => s.trim()).join(', ');
        }
      }
    }
  } catch (nominatimErr) {
    console.warn('Nominatim reverse geocode failed, trying secondary fallback:', nominatimErr);
  }

  // 2. Secondary fallback: BigDataCloud free client reverse geocoding API
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const bdcResp = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
      { signal: controller.signal }
    );

    clearTimeout(timeoutId);

    if (bdcResp.ok) {
      const bdcData = await bdcResp.json();
      const locality = bdcData.locality || bdcData.city || null;
      const admin = bdcData.principalSubdivision || null;

      const parts = [locality, admin].filter(Boolean);
      if (parts.length > 0) {
        return parts.join(', ');
      }
    }
  } catch (bdcErr) {
    console.warn('Secondary reverse geocode failed:', bdcErr);
  }

  // Fallback if all reverse geocoding attempts fail
  return 'Location unavailable';
}

/**
 * Fetches the user's current GPS location via browser Geolocation API.
 * Returns human-readable error messages if denied or unavailable.
 */
export function getCurrentDeviceLocation(): Promise<GeolocationResult> {
  return new Promise(resolve => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      resolve({
        locationText: '',
        latitude: null,
        longitude: null,
        error: 'Could not detect location. Enter manually.',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async position => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        try {
          const address = await reverseGeocode(lat, lng);
          resolve({
            locationText: address !== 'Location unavailable' ? address : '',
            latitude: lat,
            longitude: lng,
          });
        } catch {
          resolve({
            locationText: '',
            latitude: lat,
            longitude: lng,
            error: 'Could not detect location. Enter manually.',
          });
        }
      },
      error => {
        console.warn('Geolocation error:', error);
        if (error.code === error.PERMISSION_DENIED) {
          resolve({
            locationText: '',
            latitude: null,
            longitude: null,
            error: 'Location permission denied. Please enter your location manually.',
          });
        } else {
          resolve({
            locationText: '',
            latitude: null,
            longitude: null,
            error: 'Could not detect location. Enter manually.',
          });
        }
      },
      {
        timeout: 10000,
        enableHighAccuracy: true,
        maximumAge: 60000,
      }
    );
  });
}
