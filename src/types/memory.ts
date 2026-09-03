export type MemoryType =
  | 'object'
  | 'place'
  | 'person_context'
  | 'document'
  | 'book'
  | 'food'
  | 'product'
  | 'event'
  | 'receipt'
  | 'ticket'
  | 'sign'
  | 'other';

export type MemorySource = 'camera' | 'upload' | 'google_photos' | 'demo';

export interface Memory {
  id: string;
  user_id?: string;
  image_url: string;
  title: string;
  summary: string;
  memory_type: MemoryType;
  source: MemorySource;
  source_reference?: string | null;
  context?: string | null;
  people_context?: string[];
  tags?: string[];
  is_imported?: boolean;
  
  // Existing fields preserved for backward compatibility
  object_name?: string | null;
  place_name?: string | null;
  category: string;
  brand?: string | null;
  model?: string | null;
  price?: string | null;
  currency?: string | null;
  visible_text: string[];
  colors: string[];
  description: string;
  important_details: string[];
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  captured_at: string;
  search_text?: string;
  confidence?: number;
  created_at?: string;
  is_demo?: boolean;
}

export interface AIAnalysisResult {
  memory_type: MemoryType;
  title: string;
  summary: string;
  description: string;
  object_name: string | null;
  place_name: string | null;
  brand: string | null;
  model: string | null;
  price: string | null;
  currency: string | null;
  visible_text: string[];
  colors: string[];
  people_context: string[];
  important_details: string[];
  category: string;
  location_hint: string | null;
  confidence: number;
}

export interface AskMemoryResponse {
  answer: string;
  evidence_memories: Memory[];
  grounded_facts?: string[];
  confidence?: number;
}

export interface SimilarityMatch {
  match_found: boolean;
  similar_memory: Memory | null;
  similarity_reason: string;
  time_ago_text?: string;
}

export type NavigationTab = 'home' | 'capture' | 'memories' | 'ask' | 'studio';
