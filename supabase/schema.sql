-- RACHAPP Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================
-- BREAKFAST OPTIONS
-- =====================
CREATE TABLE breakfast_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE breakfast_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own breakfast options"
  ON breakfast_options FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Insert default breakfast options (run after inserting user, or use a trigger)
-- We'll handle defaults at the app level on first load.

-- =====================
-- CUSTOM HABITS
-- =====================
CREATE TABLE custom_habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  question TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE custom_habits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own custom habits"
  ON custom_habits FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================
-- DAILY LOGS
-- =====================
CREATE TABLE daily_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,

  -- Core habits
  slept_7h BOOLEAN,
  healthy_breakfast BOOLEAN,
  breakfast_option_id UUID REFERENCES breakfast_options(id) ON DELETE SET NULL,
  healthy_lunch BOOLEAN,
  lunch_description TEXT,
  healthy_dinner BOOLEAN,
  dinner_description TEXT,
  ate_candy BOOLEAN,
  drank_soda BOOLEAN,
  physical_activity TEXT CHECK (physical_activity IN ('gym', 'caminé', 'corrí', 'bici', 'deporte', 'nada')),
  drank_alcohol BOOLEAN,

  -- Custom habits stored as JSON { habit_id: boolean }
  custom_habits JSONB NOT NULL DEFAULT '{}',

  -- Confirmation
  confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  confirmed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(user_id, log_date)
);

ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own daily logs"
  ON daily_logs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER daily_logs_updated_at
  BEFORE UPDATE ON daily_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================
-- GOALS
-- =====================
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_key TEXT NOT NULL,  -- core habit key or custom_habit id
  target_pct INTEGER NOT NULL DEFAULT 70 CHECK (target_pct >= 0 AND target_pct <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(user_id, habit_key)
);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own goals"
  ON goals FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER goals_updated_at
  BEFORE UPDATE ON goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================
-- USER SETTINGS
-- =====================
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  healthy_day_threshold INTEGER NOT NULL DEFAULT 70 CHECK (healthy_day_threshold >= 0 AND healthy_day_threshold <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own settings"
  ON user_settings FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================
-- DEFAULT BREAKFAST OPTIONS (insert after auth user created)
-- You can run this manually with your user_id:
-- =====================
-- INSERT INTO breakfast_options (user_id, label) VALUES
--   ('<your-user-id>', 'Solo café con leche'),
--   ('<your-user-id>', 'Avocado Toast'),
--   ('<your-user-id>', 'Medialunas de jamón y queso');
