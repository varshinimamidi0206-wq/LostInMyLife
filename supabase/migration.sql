-- ==============================================================================
-- LostInMyLife: Supabase Migration for Real Google Authentication & RLS
-- Run this script in your Supabase Dashboard SQL Editor
-- (https://supabase.com/dashboard/project/_/sql)
-- ==============================================================================

-- 1. Ensure user_id column exists with proper UUID reference
ALTER TABLE public.memories ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Add any missing columns for memory metadata
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

-- 3. Create index on user_id for fast user-specific queries
CREATE INDEX IF NOT EXISTS idx_memories_user_id ON public.memories(user_id);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;

-- 5. Clean up old/demo policies if present
DROP POLICY IF EXISTS "Allow public demo read access" ON public.memories;
DROP POLICY IF EXISTS "Allow public demo insert access" ON public.memories;
DROP POLICY IF EXISTS "Allow public demo update access" ON public.memories;
DROP POLICY IF EXISTS "Allow public demo delete access" ON public.memories;
DROP POLICY IF EXISTS "Users can read own memories" ON public.memories;
DROP POLICY IF EXISTS "Users can insert own memories" ON public.memories;
DROP POLICY IF EXISTS "Users can update own memories" ON public.memories;
DROP POLICY IF EXISTS "Users can delete own memories" ON public.memories;

-- 6. User Isolation Policies: Users can only access and modify their own memories
CREATE POLICY "Users can read own memories"
    ON public.memories FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own memories"
    ON public.memories FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own memories"
    ON public.memories FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own memories"
    ON public.memories FOR DELETE
    USING (auth.uid() = user_id);

-- 7. Update search vector trigger
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
