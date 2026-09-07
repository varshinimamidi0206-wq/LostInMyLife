import exifr from 'exifr';

export interface PhotoMetadata {
  originalDate: string | null;
  latitude: number | null;
  longitude: number | null;
}

/**
 * Safely parses raw date from EXIF tags into an ISO 8601 string.
 * Supports JS Date objects and standard EXIF string formats ("YYYY:MM:DD HH:MM:SS").
 */
function parseExifDate(rawDate: unknown): string | null {
  if (!rawDate) return null;

  if (rawDate instanceof Date && !isNaN(rawDate.getTime())) {
    return rawDate.toISOString();
  }

  if (typeof rawDate === 'string') {
    const trimmed = rawDate.trim();
    if (!trimmed) return null;

    // Standard EXIF format: "YYYY:MM:DD HH:MM:SS" -> replace first two colons with dashes
    const exifFormatMatch = trimmed.match(/^(\d{4}):(\d{2}):(\d{2})(\s+|T)(\d{2}:\d{2}(?::\d{2})?)/);
    if (exifFormatMatch) {
      const isoCandidate = `${exifFormatMatch[1]}-${exifFormatMatch[2]}-${exifFormatMatch[3]}T${exifFormatMatch[5]}`;
      const parsed = new Date(isoCandidate);
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString();
      }
    }

    // Try generic JS Date parsing
    const genericParsed = new Date(trimmed);
    if (!isNaN(genericParsed.getTime())) {
      return genericParsed.toISOString();
    }
  }

  return null;
}

/**
 * Extracts original photo date and GPS coordinates from image EXIF metadata.
 * Priority order for dates:
 * 1. DateTimeOriginal
 * 2. CreateDate
 * 3. ModifyDate
 */
export async function extractPhotoMetadata(file: File | Blob): Promise<PhotoMetadata> {
  try {
    // Run tag parsing and dedicated GPS extraction in parallel
    const [metadata, gps] = await Promise.all([
      exifr
        .parse(file, {
          pick: [
            'DateTimeOriginal',
            'CreateDate',
            'ModifyDate',
            'latitude',
            'longitude',
          ],
        })
        .catch(() => null),
      exifr.gps(file).catch(() => null),
    ]);

    // Priority 1: DateTimeOriginal -> Priority 2: CreateDate -> Priority 3: ModifyDate
    const rawDate =
      metadata?.DateTimeOriginal ||
      metadata?.CreateDate ||
      metadata?.ModifyDate ||
      null;

    const originalDate = parseExifDate(rawDate);

    // Coordinate resolution: check dedicated gps extraction, then metadata tags
    let lat: number | null = null;
    let lng: number | null = null;

    const candidateLat =
      typeof gps?.latitude === 'number' && !isNaN(gps.latitude)
        ? gps.latitude
        : typeof metadata?.latitude === 'number' && !isNaN(metadata.latitude)
        ? metadata.latitude
        : null;

    const candidateLng =
      typeof gps?.longitude === 'number' && !isNaN(gps.longitude)
        ? gps.longitude
        : typeof metadata?.longitude === 'number' && !isNaN(metadata.longitude)
        ? metadata.longitude
        : null;

    if (
      candidateLat !== null &&
      candidateLng !== null &&
      candidateLat >= -90 &&
      candidateLat <= 90 &&
      candidateLng >= -180 &&
      candidateLng <= 180
    ) {
      lat = candidateLat;
      lng = candidateLng;
    }

    return {
      originalDate,
      latitude: lat,
      longitude: lng,
    };
  } catch (err) {
    console.warn('EXIF metadata parsing failed or unsupported:', err);
    return {
      originalDate: null,
      latitude: null,
      longitude: null,
    };
  }
}
