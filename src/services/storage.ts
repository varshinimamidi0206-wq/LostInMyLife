import { Memory } from '../types/memory';
import { INITIAL_DEMO_MEMORIES } from './demoData';
import { supabase, isSupabaseConfigured } from './supabase';

const getStorageKey = (userId?: string | null) =>
  userId ? `lost_in_my_life_memories_${userId}` : 'lost_in_my_life_memories_guest';

const DEMO_MODE_KEY = 'lost_in_my_life_demo_mode_v3';

export function getLocalMemories(userId?: string | null): Memory[] {
  try {
    const key = getStorageKey(userId);
    const raw = localStorage.getItem(key);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map(m => ({
        ...m,
        title: m.title || m.object_name || 'Physical Memory',
        summary: m.summary || m.description?.slice(0, 100) || 'Saved physical memory.',
        memory_type: m.memory_type || 'object',
        source: m.source || 'camera',
      }));
    }
    return [];
  } catch (err) {
    console.error('Error reading local memories:', err);
    return [];
  }
}

export function saveLocalMemories(memories: Memory[], userId?: string | null): void {
  try {
    const key = getStorageKey(userId);
    localStorage.setItem(key, JSON.stringify(memories));
  } catch (err) {
    console.error('Error saving local memories:', err);
  }
}

export function addLocalMemory(memory: Memory, userId?: string | null): Memory[] {
  const current = getLocalMemories(userId);
  const updated = [memory, ...current.filter(m => m.id !== memory.id)];
  saveLocalMemories(updated, userId);
  return updated;
}

export function removeLocalMemory(id: string, userId?: string | null): Memory[] {
  const current = getLocalMemories(userId);
  const updated = current.filter(m => m.id !== id);
  saveLocalMemories(updated, userId);
  return updated;
}

export function resetToDemoData(userId?: string | null): Memory[] {
  saveLocalMemories(INITIAL_DEMO_MEMORIES, userId);
  return INITIAL_DEMO_MEMORIES;
}

export function clearAllLocalMemories(userId?: string | null): Memory[] {
  saveLocalMemories([], userId);
  return [];
}

export function getDemoModeSetting(): boolean {
  try {
    const raw = localStorage.getItem(DEMO_MODE_KEY);
    return raw === null ? false : raw === 'true';
  } catch {
    return false;
  }
}

export function setDemoModeSetting(val: boolean): void {
  try {
    localStorage.setItem(DEMO_MODE_KEY, String(val));
  } catch (err) {
    console.error('Error saving demo mode setting:', err);
  }
}

/**
 * Loads memories from Supabase strictly restricted to the authenticated user via RLS.
 */
export async function syncMemories(userId?: string | null): Promise<Memory[]> {
  if (isSupabaseConfigured && supabase && userId) {
    try {
      const { data, error } = await supabase
        .from('memories')
        .select('*')
        .eq('user_id', userId)
        .order('captured_at', { ascending: false });

      if (!error && data) {
        const mapped: Memory[] = data.map(row => ({
          id: row.id,
          user_id: row.user_id,
          image_url: row.image_url,
          title: row.title || row.object_name || 'Physical Memory',
          summary: row.summary || row.description || 'Saved physical world memory.',
          memory_type: row.memory_type || 'object',
          source: row.source || 'camera',
          source_reference: row.source_reference,
          context: row.context,
          people_context: row.people_context || [],
          tags: row.tags || [],
          is_imported: Boolean(row.is_imported),
          object_name: row.object_name,
          place_name: row.place_name,
          category: row.category || 'Objects',
          brand: row.brand,
          model: row.model,
          price: row.price,
          currency: row.currency || (row.price ? 'INR' : undefined),
          visible_text: row.visible_text || [],
          colors: row.colors || [],
          description: row.description || row.summary,
          important_details: row.important_details || [],
          location: row.location || 'Physical World',
          latitude: row.latitude,
          longitude: row.longitude,
          captured_at: row.captured_at,
          search_text: row.search_text,
          confidence: row.confidence || 0.95,
          is_demo: false,
        }));
        saveLocalMemories(mapped, userId);
        return mapped;
      }
      if (error) {
        console.warn('Supabase RLS query error:', error.message);
      }
    } catch (err) {
      console.warn('Supabase sync error, using cached local memories:', err);
    }
  }

  return getLocalMemories(userId);
}

/**
 * Directly persists a memory to Supabase using the authenticated user's ID
 */
export async function persistMemory(memory: Memory, userId?: string | null): Promise<Memory> {
  if (isSupabaseConfigured && supabase && userId) {
    try {
      const insertPayload: Record<string, any> = {
        id: memory.id,
        user_id: userId,
        image_url: memory.image_url,
        title: memory.title || memory.object_name || 'Physical Memory',
        summary: memory.summary || memory.description || 'Saved physical world memory.',
        memory_type: memory.memory_type || 'object',
        source: memory.source || 'camera',
        source_reference: memory.source_reference || null,
        context: memory.context || null,
        place_name: memory.place_name || null,
        people_context: memory.people_context || [],
        tags: memory.tags || [],
        is_imported: Boolean(memory.is_imported),
        object_name: memory.object_name || memory.title,
        category: memory.category || 'Objects',
        brand: memory.brand || null,
        model: memory.model || null,
        price: memory.price || null,
        currency: memory.currency || (memory.price ? 'INR' : null),
        visible_text: memory.visible_text || [],
        colors: memory.colors || [],
        description: memory.description || memory.summary,
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

      if (!error && data) {
        return { ...memory, ...data };
      }
      if (error) {
        console.warn('Supabase RLS insert error:', error.message);
      }
    } catch (err) {
      console.warn('Supabase insert exception:', err);
    }
  }
  return memory;
}

/**
 * Deletes a memory from Supabase and local cache
 */
export async function deleteMemoryRecord(id: string, userId?: string | null): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase.from('memories').delete().eq('id', id);
      if (userId) {
        query = query.eq('user_id', userId);
      }
      await query;
    } catch (err) {
      console.warn('Supabase delete error:', err);
    }
  }
  removeLocalMemory(id, userId);
}
