-- Create tables for EchoVerse

-- Table for diary entries
CREATE TABLE diary_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  mood TEXT,
  audio_url TEXT NOT NULL,
  encryption_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unlock_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER NOT NULL,
  is_played BOOLEAN DEFAULT FALSE
);

-- Create index for faster queries
CREATE INDEX idx_diary_entries_user_id ON diary_entries(user_id);
CREATE INDEX idx_diary_entries_unlock_date ON diary_entries(unlock_date);

-- RLS (Row Level Security) policies
ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own entries
CREATE POLICY "Users can only access their own entries"
  ON diary_entries
  FOR ALL
  USING (auth.uid() = user_id);

-- Storage bucket for audio files
-- Run this in SQL Editor after creating the storage bucket in Supabase dashboard
INSERT INTO storage.buckets (id, name, public) VALUES ('audio-diaries', 'audio-diaries', FALSE);

-- Storage RLS policy
CREATE POLICY "Users can only access their own audio files"
  ON storage.objects
  FOR ALL
  USING (auth.uid()::text = (storage.foldername(name))[1]);
