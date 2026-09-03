import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const memory = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    if (!memory || (!memory.title && !memory.object_name)) {
      return res.status(400).json({ error: 'Memory object with title or object_name is required' });
    }

    const title = memory.title || memory.object_name || 'Physical Memory';
    const summary = memory.summary || memory.description?.slice(0, 120) || 'Saved physical memory.';

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) {
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Attempt full insert with new fields
      const insertPayload: Record<string, any> = {
        id: memory.id,
        image_url: memory.image_url,
        title: title,
        summary: summary,
        memory_type: memory.memory_type || 'object',
        source: memory.source || 'camera',
        source_reference: memory.source_reference || null,
        context: memory.context || null,
        place_name: memory.place_name || null,
        people_context: memory.people_context || [],
        tags: memory.tags || [],
        is_imported: Boolean(memory.is_imported),
        object_name: memory.object_name || title,
        category: memory.category || 'General',
        brand: memory.brand || null,
        model: memory.model || null,
        price: memory.price || null,
        currency: memory.currency || (memory.price ? 'INR' : null),
        visible_text: memory.visible_text || [],
        colors: memory.colors || [],
        description: memory.description || summary,
        important_details: memory.important_details || [],
        location: memory.location || 'Physical World',
        latitude: memory.latitude || null,
        longitude: memory.longitude || null,
        captured_at: memory.captured_at || new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('memories')
        .insert([insertPayload])
        .select()
        .single();

      if (error) {
        console.warn('Supabase insert warning, trying minimal backward-compatible insert:', error.message);
        // Fallback: If some columns don't exist yet in user's Supabase schema
        const minimalPayload = {
          id: memory.id,
          image_url: memory.image_url,
          object_name: title,
          category: memory.category || 'General',
          description: memory.description || summary,
          location: memory.location || 'Physical World',
          captured_at: memory.captured_at || new Date().toISOString(),
          price: memory.price || null,
          currency: memory.currency || null,
          visible_text: memory.visible_text || [],
          colors: memory.colors || [],
          important_details: memory.important_details || [],
        };
        const fallbackInsert = await supabase
          .from('memories')
          .insert([minimalPayload])
          .select()
          .single();

        if (fallbackInsert.error) {
          console.warn('Fallback insert also failed, using local storage cache:', fallbackInsert.error.message);
          return res.status(200).json({
            success: true,
            storage: 'local_fallback',
            memory: { ...insertPayload, ...memory },
            warning: fallbackInsert.error.message,
          });
        }

        return res.status(200).json({
          success: true,
          storage: 'supabase_compatible',
          memory: { ...insertPayload, ...fallbackInsert.data },
        });
      }

      return res.status(200).json({
        success: true,
        storage: 'supabase',
        memory: data,
      });
    }

    // Default fallback if Supabase not configured in env
    return res.status(200).json({
      success: true,
      storage: 'local',
      memory,
    });
  } catch (error: any) {
    console.error('Error in save-memory API:', error);
    return res.status(500).json({ error: 'Failed to save memory' });
  }
}
