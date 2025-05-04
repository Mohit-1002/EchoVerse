-- Function to create the setup function
CREATE OR REPLACE FUNCTION create_setup_function()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create the function to set up diary_entries table
  CREATE OR REPLACE FUNCTION create_diary_entries_table()
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $func$
  BEGIN
    -- Check if the table already exists
    IF NOT EXISTS (
      SELECT FROM pg_tables
      WHERE schemaname = 'public'
      AND tablename = 'diary_entries'
    ) THEN
      -- Create the diary_entries table
      CREATE TABLE public.diary_entries (
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

      -- Create indexes
      CREATE INDEX idx_diary_entries_user_id ON public.diary_entries(user_id);
      CREATE INDEX idx_diary_entries_unlock_date ON public.diary_entries(unlock_date);

      -- Enable RLS
      ALTER TABLE public.diary_entries ENABLE ROW LEVEL SECURITY;

      -- Create RLS policy
      CREATE POLICY "Users can only access their own entries"
        ON public.diary_entries
        FOR ALL
        USING (auth.uid() = user_id);
    END IF;
  END;
  $func$;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION create_setup_function TO authenticated;
GRANT EXECUTE ON FUNCTION create_diary_entries_table TO authenticated;
