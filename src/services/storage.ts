import { Memory } from '../types/memory';
import { INITIAL_DEMO_MEMORIES } from './demoData';
import { supabase, isSupabaseConfigured } from './supabase';

const MEMORIES_STORAGE_KEY = 'lost_in_my_life_memories_v2';
const DEMO_MODE_KEY = 'lost_in_my_life_demo_mode_v2';

export function getLocalMemories(): Memory[] {
  try {
    const raw = localStorage.getItem(MEMORIES_STORAGE_KEY);
    if (!raw) {
      saveLocalMemories(INITIAL_DEMO_MEMORIES);
      return INITIAL_DEMO_MEMORIES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Ensure backward-compatibility mapping
      return parsed.map(m => ({
        ...m,
        title: m.title || m.object_name || 'Physical Memory',
        summary: m.summary || m.description?.slice(0, 100) || 'Saved physical memory.',
        memory_type: m.memory_type || 'object',
        source: m.source || 'camera',
      }));
    }
    return INITIAL_DEMO_MEMORIES;
  } catch (err) {
    console.error('Error reading local memories:', err);
    return INITIAL_DEMO_MEMORIES;
  }
}

export function saveLocalMemories(memories: Memory[]): void {
  try {
    localStorage.setItem(MEMORIES_STORAGE_KEY, JSON.stringify(memories));
  } catch (err) {
    console.error('Error saving local memories:', err);
  }
}

export function addLocalMemory(memory: Memory): Memory[] {
  const current = getLocalMemories();
  const updated = [memory, ...current.filter(m => m.id !== memory.id)];
  saveLocalMemories(updated);
  return updated;
}

export function removeLocalMemory(id: string): Memory[] {
  const current = getLocalMemories();
  const updated = current.filter(m => m.id !== id);
  saveLocalMemories(updated);
  return updated;
}

export function resetToDemoData(): Memory[] {
  saveLocalMemories(INITIAL_DEMO_MEMORIES);
  return INITIAL_DEMO_MEMORIES;
}

export function clearAllLocalMemories(): Memory[] {
  saveLocalMemories([]);
  return [];
}

export function getDemoModeSetting(): boolean {
  try {
    const raw = localStorage.getItem(DEMO_MODE_KEY);
    return raw === null ? true : raw === 'true';
  } catch {
    return true;
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
 * Loads memories from Supabase if configured, merging or falling back to local storage
 */
export async function syncMemories(): Promise<Memory[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('memories')
        .select('*')
        .order('captured_at', { ascending: false });

      if (!error && data && data.length > 0) {
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
          category: row.category || 'General',
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
        saveLocalMemories(mapped);
        return mapped;
      }
    } catch (err) {
      console.warn('Supabase sync error, using local memories:', err);
    }
  }

  return getLocalMemories();
}
