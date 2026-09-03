-- ==============================================================================
-- Migration: Add memory_type, title, summary, source, context, tags
-- Run this in your Supabase SQL Editor to safely upgrade your existing table.
-- ==============================================================================

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

-- Backfill title & summary for any existing records
UPDATE public.memories
SET 
  title = COALESCE(title, object_name, 'Physical Memory'),
  summary = COALESCE(summary, description, 'Saved physical world observation.'),
  memory_type = COALESCE(memory_type, 'object'),
  source = COALESCE(source, 'camera')
WHERE title IS NULL OR summary IS NULL;

-- Update search vector trigger
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
