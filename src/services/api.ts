import { AIAnalysisResult, AskMemoryResponse, Memory, SimilarityMatch } from '../types/memory';

/**
 * Analyzes an image of a physical memory using Gemini via server-side API.
 */
export async function analyzeMemoryImage(
  imageBase64: string,
  userNote?: string,
  manualLocation?: string
): Promise<AIAnalysisResult> {
  const response = await fetch('/api/analyze-memory', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image_base64: imageBase64,
      user_note: userNote,
      manual_location: manualLocation,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Analysis failed' }));
    throw new Error(err.error || 'Failed to analyze memory');
  }

  const data = await response.json();
  return data.analysis;
}

/**
 * Grounds a natural language query against memory evidence.
 */
export async function askMyMemory(
  question: string,
  memories: Memory[]
): Promise<AskMemoryResponse> {
  const response = await fetch('/api/ask-memory', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question,
      memories,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Query failed' }));
    throw new Error(err.error || 'Failed to ask memory');
  }

  return response.json();
}

/**
 * Checks "Have I seen this before?" duplicate or similarity check.
 */
export async function findSimilarMemory(
  title: string,
  category: string,
  brand: string | null,
  colors: string[],
  memories: Memory[],
  visible_text?: string[]
): Promise<SimilarityMatch> {
  const response = await fetch('/api/find-similar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title,
      object_name: title,
      category,
      brand,
      colors,
      visible_text,
      memories,
    }),
  });

  if (!response.ok) {
    return {
      match_found: false,
      similar_memory: null,
      similarity_reason: '',
    };
  }

  return response.json();
}

/**
 * Searches memories using natural language and structured filters.
 */
export async function searchMemories(
  query: string,
  category: string,
  memories: Memory[]
): Promise<Memory[]> {
  const response = await fetch('/api/search-memories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      category,
      memories,
    }),
  });

  if (!response.ok) {
    return memories;
  }

  const data = await response.json();
  return data.results || [];
}

/**
 * Persists memory record to Supabase via serverless API.
 */
export async function saveMemoryRecord(memory: Memory): Promise<Memory> {
  const response = await fetch('/api/save-memory', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(memory),
  });

  if (!response.ok) {
    return memory;
  }

  const data = await response.json();
  return data.memory || memory;
}
