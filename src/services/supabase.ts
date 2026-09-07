import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseKey && 
  !supabaseUrl.includes('your-project')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/**
 * Uploads an image to Supabase Storage bucket 'memory-images'.
 * If Supabase is not configured or upload fails, falls back to a base64 Data URL.
 */
export async function uploadMemoryImage(file: Blob, fileName: string): Promise<string> {
  if (isSupabaseConfigured && supabase) {
    try {
      const filePath = `captures/${Date.now()}_${fileName.replace(/[^a-zA-Z0-9._-]/g, '')}`;
      const { error: uploadError } = await supabase.storage
        .from('memory-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (!uploadError) {
        const { data } = supabase.storage
          .from('memory-images')
          .getPublicUrl(filePath);

        if (data?.publicUrl) {
          return data.publicUrl;
        }
      } else {
        console.warn('Supabase storage upload failed, falling back to base64 Data URL:', uploadError.message);
      }
    } catch (err) {
      console.warn('Supabase upload exception:', err);
    }
  }

  // Fallback: Convert Blob to base64 Data URL
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
}
