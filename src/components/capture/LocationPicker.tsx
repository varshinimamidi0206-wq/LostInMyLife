import React, { useState } from 'react';
import { MapPin, Navigation, Check, Loader2 } from 'lucide-react';

interface LocationPickerProps {
  location: string;
  latitude: number | null;
  longitude: number | null;
  onChangeLocation: (location: string, lat: number | null, lng: number | null) => void;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  location,
  latitude,
  longitude,
  onChangeLocation,
}) => {
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);

  const requestGeolocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationStatus(null);

    navigator.geolocation.getCurrentPosition(
      async position => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        try {
          // Simple reverse geocoding via OpenStreetMap Nominatim
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`
          );
          if (response.ok) {
            const data = await response.json();
            const addr = data.address;
            const place =
              addr.shop ||
              addr.amenity ||
              addr.building ||
              addr.road ||
              addr.suburb ||
              addr.neighbourhood ||
              'Physical Location';
            const city = addr.city || addr.town || addr.state_district || 'City';
            const formatted = `${place}, ${city}`;
            onChangeLocation(formatted, lat, lng);
            setLocationStatus(`Located: ${formatted}`);
          } else {
            const coordStr = `Location (${lat.toFixed(3)}, ${lng.toFixed(3)})`;
            onChangeLocation(coordStr, lat, lng);
            setLocationStatus(coordStr);
          }
        } catch {
          const coordStr = `Near current location (${lat.toFixed(3)}, ${lng.toFixed(3)})`;
          onChangeLocation(coordStr, lat, lng);
          setLocationStatus(coordStr);
        } finally {
          setIsLocating(false);
        }
      },
      error => {
        console.warn('Geolocation error:', error);
        setIsLocating(false);
        setLocationStatus('Location access denied. You can type the location manually.');
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-gray-300 flex items-center space-x-1.5">
          <MapPin className="w-3.5 h-3.5 text-cyan-400" />
          <span>Location</span>
        </label>

        <button
          type="button"
          onClick={requestGeolocation}
          disabled={isLocating}
          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-900/60 transition-colors disabled:opacity-50"
        >
          {isLocating ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Detecting...</span>
            </>
          ) : (
            <>
              <Navigation className="w-3 h-3" />
              <span>Use My Location</span>
            </>
          )}
        </button>
      </div>

      <div className="relative">
        <input
          type="text"
          value={location}
          onChange={e => onChangeLocation(e.target.value, latitude, longitude)}
          placeholder="e.g. Lifestyle Store, Express Avenue, Chennai"
          className="w-full bg-gray-900/80 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
        />
        {location && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400">
            <Check className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      {locationStatus && (
        <p className="text-[11px] text-gray-400 font-mono">
          {locationStatus}
        </p>
      )}
    </div>
  );
};
