-- Add voice note support to reports table
-- Run this in your Supabase SQL editor

-- Add voice_note_duration column (stores duration in seconds)
ALTER TABLE reports 
ADD COLUMN IF NOT EXISTS voice_note_duration INTEGER;

-- Add voice_note_confirmed column (tracks if user confirmed to submit the voice note)
ALTER TABLE reports 
ADD COLUMN IF NOT EXISTS voice_note_confirmed BOOLEAN DEFAULT FALSE;

-- Add comments for documentation
COMMENT ON COLUMN reports.voice_note_duration IS 'Duration of optional voice note in seconds';
COMMENT ON COLUMN reports.voice_note_confirmed IS 'Whether user confirmed to include voice note with report';
