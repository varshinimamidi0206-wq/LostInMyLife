-- ==============================================================================
-- LostInMyLife - Supabase Schema & Setup
-- "Search your physical memories, not just your photos."
-- ==============================================================================

-- 1. Enable extensions if permitted (pgvector is optional; fallback works without it)
DO $$
BEGIN
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "vector";
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'pgvector extension not installed or not supported in this tier. Falling back to full-text search.';
END $$;

-- 2. Create memories table (if not already created)
CREATE TABLE IF NOT EXISTS public.memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    image_url TEXT NOT NULL,
    title TEXT,
    summary TEXT,
    memory_type TEXT DEFAULT 'object',
    source TEXT DEFAULT 'camera',
    source_reference TEXT,
    context TEXT,
    people_context TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    is_imported BOOLEAN DEFAULT FALSE,
    object_name TEXT,
    place_name TEXT,
    category TEXT,
    brand TEXT,
    model TEXT,
    price TEXT,
    currency TEXT DEFAULT 'INR',
    visible_text TEXT[] DEFAULT '{}',
    colors TEXT[] DEFAULT '{}',
    description TEXT,
    important_details TEXT[] DEFAULT '{}',
    location TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    captured_at TIMESTAMPTZ DEFAULT now(),
    search_text TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Safe Alterations for Existing Databases (Idempotent)
ALTER TABLE public.memories ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.memories ADD COLUMN IF NOT EXISTS summary TEXT;
ALTER TABLE public.memories ADD COLUMN IF NOT EXISTS memory_type TEXT DEFAULT 'object';
ALTER TABLE public.memories ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'camera';
ALTER TABLE public.memories ADD COLUMN IF NOT EXISTS source_reference TEXT;
ALTER TABLE public.memories ADD COLUMN IF NOT EXISTS context TEXT;
ALTER TABLE public.memories ADD COLUMN IF NOT EXISTS people_context TEXT[] DEFAULT '{}';
ALTER TABLE public.memories ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE public.memories ADD COLUMN IF NOT EXISTS is_imported BOOLEAN DEFAULT FALSE;
ALTER TABLE public.memories ADD COLUMN IF NOT EXISTS place_name TEXT;

-- Try adding embedding column if vector extension is present
DO $$
BEGIN
    ALTER TABLE public.memories ADD COLUMN IF NOT EXISTS embedding vector(768);
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Vector column skipped - using structured text fallback.';
END $$;

-- 3. Comprehensive search vector trigger (includes title, summary, memory_type, place_name, tags, details)
CREATE OR REPLACE FUNCTION public.update_memory_search_text()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_text := LOWER(
        COALESCE(NEW.title, '') || ' ' ||
        COALESCE(NEW.summary, '') || ' ' ||
        COALESCE(NEW.memory_type, '') || ' ' ||
        COALESCE(NEW.object_name, '') || ' ' ||
        COALESCE(NEW.place_name, '') || ' ' ||
        COALESCE(NEW.category, '') || ' ' ||
        COALESCE(NEW.brand, '') || ' ' ||
        COALESCE(NEW.model, '') || ' ' ||
        COALESCE(NEW.description, '') || ' ' ||
        COALESCE(NEW.context, '') || ' ' ||
        COALESCE(NEW.location, '') || ' ' ||
        COALESCE(ARRAY_TO_STRING(NEW.visible_text, ' '), '') || ' ' ||
        COALESCE(ARRAY_TO_STRING(NEW.colors, ' '), '') || ' ' ||
        COALESCE(ARRAY_TO_STRING(NEW.people_context, ' '), '') || ' ' ||
        COALESCE(ARRAY_TO_STRING(NEW.tags, ' '), '') || ' ' ||
        COALESCE(ARRAY_TO_STRING(NEW.important_details, ' '), '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_memory_search_text ON public.memories;
CREATE TRIGGER trg_memory_search_text
    BEFORE INSERT OR UPDATE ON public.memories
    FOR EACH ROW
    EXECUTE FUNCTION public.update_memory_search_text();

-- 4. Full Text Search Indexes
CREATE INDEX IF NOT EXISTS idx_memories_search_text ON public.memories USING gin (to_tsvector('english', search_text));
CREATE INDEX IF NOT EXISTS idx_memories_memory_type ON public.memories(memory_type);
CREATE INDEX IF NOT EXISTS idx_memories_category ON public.memories(category);
CREATE INDEX IF NOT EXISTS idx_memories_source ON public.memories(source);
CREATE INDEX IF NOT EXISTS idx_memories_captured_at ON public.memories(captured_at DESC);

-- 5. Row Level Security (RLS)
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;

-- Allow public read/write for hackathon demo & prototype usage
CREATE POLICY "Allow public demo read access"
    ON public.memories FOR SELECT
    USING (true);

CREATE POLICY "Allow public demo insert access"
    ON public.memories FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow public demo update access"
    ON public.memories FOR UPDATE
    USING (true);

CREATE POLICY "Allow public demo delete access"
    ON public.memories FOR DELETE
    USING (true);

-- 6. Helper search function with robust ranking
CREATE OR REPLACE FUNCTION public.search_memories(query_text TEXT, match_limit INT DEFAULT 25)
RETURNS SETOF public.memories AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM public.memories
    WHERE 
        search_text ILIKE ('%' || LOWER(query_text) || '%')
        OR to_tsvector('english', search_text) @@ plainto_tsquery('english', query_text)
    ORDER BY 
        CASE 
            WHEN LOWER(COALESCE(title, object_name, '')) ILIKE ('%' || LOWER(query_text) || '%') THEN 1
            WHEN LOWER(COALESCE(location, place_name, '')) ILIKE ('%' || LOWER(query_text) || '%') THEN 2
            WHEN LOWER(COALESCE(summary, description, '')) ILIKE ('%' || LOWER(query_text) || '%') THEN 3
            ELSE 4
        END,
        captured_at DESC
    LIMIT match_limit;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 7. Supabase Storage Setup Instructions:
--
-- Go to Supabase Studio -> Storage -> Create new bucket:
-- Bucket Name: "memory-images"
-- Public: YES (check "Public bucket")
--
-- Policy for Storage:
-- Allow public SELECT and INSERT to bucket "memory-images":
-- INSERT: CREATE POLICY "Allow public uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'memory-images');
-- SELECT: CREATE POLICY "Allow public views" ON storage.objects FOR SELECT USING (bucket_id = 'memory-images');
-- ==============================================================================
