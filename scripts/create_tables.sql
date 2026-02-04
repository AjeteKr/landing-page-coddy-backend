-- create_tables.sql

-- Enables UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  password text,
  name text,
  role text NOT NULL DEFAULT 'student',
  is_active boolean NOT NULL DEFAULT true,
  last_login timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Courses (public)
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text,
  instructor text,
  level text,
  image_url text,
  price numeric(10,2) DEFAULT 0,
  is_public boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Landing settings (single active row)
CREATE TABLE IF NOT EXISTS landing_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  subtitle text,
  description text,
  features jsonb,
  cta_primary text,
  cta_secondary text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Testimonials
CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name text,
  author_role text,
  content text NOT NULL,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Schools (for stats example)
CREATE TABLE IF NOT EXISTS schools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Optional: classes table used by admin features
CREATE TABLE IF NOT EXISTS classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  teacher_id uuid REFERENCES users(id) ON DELETE SET NULL,
  capacity integer DEFAULT 0,
  status text NOT NULL DEFAULT 'active', -- 'active' | 'archived'
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Example index for frequent queries
CREATE INDEX IF NOT EXISTS idx_courses_is_public ON courses (is_public);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);

-- Example RLS policy suggestion for `courses` (allow anon select only for public courses)
ALTER TABLE IF EXISTS courses ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'public_select_public_courses'
      AND tablename = 'courses'
  ) THEN
    EXECUTE 'CREATE POLICY public_select_public_courses ON courses FOR SELECT USING (is_public = true)';
  END IF;
END$$;

-- NOTE: Adjust policies and permissions in the Supabase UI as needed.
