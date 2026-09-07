import React, { useState } from 'react';
import { MapPin, Navigation, Check, Loader2 } from 'lucide-react';
import { getCurrentDeviceLocation } from '../../utils/location';

interface LocationPickerProps {
  location: string;
  latitude: number | null;
  longitude: number | null;
  onChangeLocation: (location: string, lat: number | null, lng: number | null) => void;
  locationStatus?: string | null;
  isLocating?: boolean;
  onDetectLocation?: () => void;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  location,
  latitude,
  longitude,
  onChangeLocation,
  locationStatus: externalStatus,
  isLocating: externalLocating,
  onDetectLocation,
}) => {
  const [internalLocating, setInternalLocating] = useState(false);
  const [internalStatus, setInternalStatus] = useState<string | null>(null);

  const isLocating = externalLocating !== undefined ? externalLocating : internalLocating;
  const locationStatus = externalStatus !== undefined ? externalStatus : internalStatus;

  const handleRequestLocation = async () => {
    if (onDetectLocation) {
      onDetectLocation();
      return;
    }

    setInternalLocating(true);
    setInternalStatus('Detecting your location...');

    const result = await getCurrentDeviceLocation();
    setInternalLocating(false);

    if (result.error) {
      setInternalStatus(result.error);
    } else if (result.locationText) {
      onChangeLocation(result.locationText, result.latitude, result.longitude);
      setInternalStatus('Current location detected');
    }
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
          onClick={handleRequestLocation}
          disabled={isLocating}
          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-900/60 transition-colors disabled:opacity-50"
        >
          {isLocating ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Detecting your location...</span>
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
        {location && location !== 'Location unavailable' && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400">
            <Check className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      {locationStatus && (
        <p className={`text-[11px] font-mono leading-tight ${
          locationStatus.includes('denied') || locationStatus.includes('Could not')
            ? 'text-amber-400/90'
            : locationStatus.includes('detected')
            ? 'text-emerald-400/90'
            : 'text-cyan-400/90'
        }`}>
          {locationStatus}
        </p>
      )}
    </div>
  );
};
