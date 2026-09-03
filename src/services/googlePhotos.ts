export const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export const isGooglePhotosConfigured = Boolean(
  googleClientId && googleClientId !== 'your_google_client_id_here'
);

export interface DemoSelectablePhoto {
  id: string;
  title: string;
  image_url: string;
  date: string;
  location: string;
  note: string;
}

export const DEMO_GOOGLE_PHOTOS_CATALOG: DemoSelectablePhoto[] = [
  {
    id: 'gp-1',
    title: 'Kapaleeshwarar Temple Gopuram',
    image_url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
    date: 'August 18, 2026',
    location: 'Mylapore, Chennai',
    note: 'Historic temple tower sculpted deities and traditional architecture.',
  },
  {
    id: 'gp-2',
    title: 'Vintage Wall Clock in Antique Shop',
    image_url: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=800&q=80',
    date: 'August 12, 2026',
    location: 'George Town, Chennai',
    note: 'Carved mahogany pendulum clock spotted in heritage antique store.',
  },
  {
    id: 'gp-3',
    title: 'Seaside Sunset at Marina',
    image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    date: 'August 5, 2026',
    location: 'Marina Beach, Chennai',
    note: 'Evening ocean horizon with fishing boats and lighthouse glow.',
  },
  {
    id: 'gp-4',
    title: 'Rare Book Collection at Used Bookstore',
    image_url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80',
    date: 'July 28, 2026',
    location: 'Moore Market, Chennai',
    note: 'First edition classic books on wooden bookshelves.',
  }
];

/**
 * Requests an OAuth 2.0 access token with Google Photos Picker scope
 * via Google Identity Services (GIS).
 */
export async function getGoogleOAuthToken(): Promise<string> {
  if (!isGooglePhotosConfigured) {
    throw new Error('Google Client ID is not configured in .env (VITE_GOOGLE_CLIENT_ID).');
  }

  return new Promise((resolve, reject) => {
    const google = (window as any).google;
    if (!google?.accounts?.oauth2) {
      return reject(
        new Error('Google Identity Services library is still loading. Please check your network and refresh.')
      );
    }

    const tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: googleClientId,
      scope: 'https://www.googleapis.com/auth/photospicker.mediaitems.readonly',
      callback: (tokenResponse: any) => {
        if (tokenResponse.error) {
          reject(new Error(tokenResponse.error_description || tokenResponse.error));
        } else if (tokenResponse.access_token) {
          resolve(tokenResponse.access_token);
        } else {
          reject(new Error('No access token received from Google.'));
        }
      },
    });

    tokenClient.requestAccessToken({ prompt: 'consent' });
  });
}

/**
 * Initiates the Google Photos Picker session and polls for user selection.
 * Returns the selected media converted into selectable photo items.
 */
export async function launchGooglePhotosPicker(
  onStatusUpdate?: (status: string) => void
): Promise<DemoSelectablePhoto[]> {
  onStatusUpdate?.('Requesting Google authorization...');
  const accessToken = await getGoogleOAuthToken();

  onStatusUpdate?.('Creating Google Photos Picker session...');
  const createSessionRes = await fetch('https://photospicker.googleapis.com/v1/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!createSessionRes.ok) {
    const errData = await createSessionRes.json().catch(() => ({}));
    throw new Error(
      errData?.error?.message || `Failed to create picker session (${createSessionRes.status}). Verify Google Photos Picker API is enabled.`
    );
  }

  const session = await createSessionRes.json();
  const sessionId = session.id;
  const pickerUri = session.pickerUri;

  onStatusUpdate?.('Opening Google Photos Picker in popup...');
  const pickerUrl = pickerUri.includes('?') ? `${pickerUri}&autoclose=true` : `${pickerUri}/autoclose`;
  const popup = window.open(pickerUrl, 'GooglePhotosPicker', 'width=840,height=680,scrollbars=yes,resizable=yes');

  if (!popup) {
    throw new Error('Popup blocked! Please allow popups for localhost:5173 to choose photos.');
  }

  onStatusUpdate?.('Waiting for you to select photos in the Google Photos window...');

  // Poll for completion (up to ~3 minutes)
  const maxAttempts = 90;
  let attempts = 0;
  let isMediaSelected = false;

  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    attempts++;

    try {
      const checkRes = await fetch(`https://photospicker.googleapis.com/v1/sessions/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (checkRes.ok) {
        const checkData = await checkRes.json();
        if (checkData.mediaItemsSet === true) {
          isMediaSelected = true;
          break;
        }
      }
    } catch {
      // Ignore polling connection glitches
    }

    if (popup.closed && attempts > 3) {
      // Check once more after popup closure
      const finalCheck = await fetch(`https://photospicker.googleapis.com/v1/sessions/${sessionId}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      }).catch(() => null);

      if (finalCheck?.ok) {
        const finalData = await finalCheck.json();
        if (finalData.mediaItemsSet === true) {
          isMediaSelected = true;
          break;
        }
      }
      break;
    }
  }

  if (!isMediaSelected) {
    // Delete session to free quota
    await fetch(`https://photospicker.googleapis.com/v1/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${accessToken}` },
    }).catch(() => {});
    throw new Error('No photos were selected or the Google Photos window was closed.');
  }

  onStatusUpdate?.('Retrieving selected photos...');
  const itemsRes = await fetch(
    `https://photospicker.googleapis.com/v1/mediaItems?sessionId=${sessionId}&pageSize=50`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );

  if (!itemsRes.ok) {
    throw new Error('Failed to retrieve selected media items from Google Photos.');
  }

  const itemsData = await itemsRes.json();
  const rawItems = itemsData.mediaItems || [];

  // Delete session after successfully listing items
  await fetch(`https://photospicker.googleapis.com/v1/sessions/${sessionId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${accessToken}` },
  }).catch(() => {});

  if (rawItems.length === 0) {
    throw new Error('No photos were returned from your Google Photos selection.');
  }

  return rawItems
    .map((item: any) => {
      const rawUrl = item.mediaFile?.baseUrl;
      const filename = item.mediaFile?.filename || 'Google Photo';
      const dateFormatted = item.createTime
        ? new Date(item.createTime).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })
        : 'Recent Photo';

      return {
        id: item.id || crypto.randomUUID(),
        title: filename.replace(/\.[^/.]+$/, ''),
        // Append =w1024 parameter for high-res preview and Gemini analysis
        image_url: rawUrl ? `${rawUrl}=w1024` : '',
        date: dateFormatted,
        location: 'Google Photos Library',
        note: `Imported via Google Photos Picker (${filename})`,
      };
    })
    .filter((p: DemoSelectablePhoto) => Boolean(p.image_url));
}

/** Legacy stub export for compatibility */
export async function openGooglePhotosPicker(): Promise<string[]> {
  const photos = await launchGooglePhotosPicker();
  return photos.map(p => p.image_url);
}
