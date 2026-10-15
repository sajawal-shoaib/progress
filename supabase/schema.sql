-- WINTER ARC DATABASE SCHEMA FOR SUPABASE
-- Run this script in your Supabase SQL Editor to initialize tables, indexes, and security policies.

-- 1. USER SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  start_date TEXT NOT NULL,
  total_days INTEGER NOT NULL DEFAULT 90,
  sleep_target_hours NUMERIC NOT NULL DEFAULT 7.5,
  water_target_liters NUMERIC NOT NULL DEFAULT 3.0,
  max_scrolling_target_minutes INTEGER NOT NULL DEFAULT 30,
  gaming_target_minutes INTEGER NOT NULL DEFAULT 60,
  deep_work_target_hours NUMERIC NOT NULL DEFAULT 4.0,
  weight_unit TEXT NOT NULL DEFAULT 'kg',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. DAILY RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.daily_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  date TEXT NOT NULL,
  workout BOOLEAN NOT NULL DEFAULT FALSE,
  movement BOOLEAN NOT NULL DEFAULT FALSE,
  nutrition BOOLEAN NOT NULL DEFAULT FALSE,
  water BOOLEAN NOT NULL DEFAULT FALSE,
  sleep_hours NUMERIC NOT NULL DEFAULT 0,
  weight NUMERIC,
  scrolling_controlled BOOLEAN NOT NULL DEFAULT FALSE,
  scrolling_minutes INTEGER NOT NULL DEFAULT 60,
  gaming_minutes INTEGER NOT NULL DEFAULT 120,
  meditation BOOLEAN NOT NULL DEFAULT FALSE,
  reading BOOLEAN NOT NULL DEFAULT FALSE,
  promises_kept BOOLEAN NOT NULL DEFAULT FALSE,
  deep_work BOOLEAN NOT NULL DEFAULT FALSE,
  deep_work_hours NUMERIC NOT NULL DEFAULT 0,
  work_description TEXT DEFAULT '',
  learning TEXT DEFAULT '',
  biggest_win TEXT DEFAULT '',
  biggest_distraction TEXT DEFAULT '',
  tomorrow_focus TEXT DEFAULT '',
  score INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Not Recorded',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_user_daily_record UNIQUE (user_id, date)
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_daily_records_user_date ON public.daily_records(user_id, date);

-- 3. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_records ENABLE ROW LEVEL SECURITY;

-- Policies for user_settings
CREATE POLICY "Users can view their own settings" 
  ON public.user_settings FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own settings" 
  ON public.user_settings FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own settings" 
  ON public.user_settings FOR UPDATE 
  USING (auth.uid() = id);

-- Policies for daily_records
CREATE POLICY "Users can view their own daily records" 
  ON public.daily_records FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily records" 
  ON public.daily_records FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily records" 
  ON public.daily_records FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily records" 
  ON public.daily_records FOR DELETE 
  USING (auth.uid() = user_id);

-- 4. AUTOMATED UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = timezone('utc'::text, now());
   RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS set_user_settings_updated_at ON public.user_settings;
CREATE TRIGGER set_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_daily_records_updated_at ON public.daily_records;
CREATE TRIGGER set_daily_records_updated_at
  BEFORE UPDATE ON public.daily_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
