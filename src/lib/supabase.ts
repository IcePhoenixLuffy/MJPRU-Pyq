import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables with SSR / test runner safe check
const env = (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {}) as Record<string, string | undefined>;
const supabaseUrl = env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || '';

// Config state
export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('http') &&
    supabaseAnonKey.length > 20
  );
};

// Singleton client or null
export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

export const OFFICIAL_ADMIN_EMAIL = 'admin@mjpru.ac.in';

/**
 * Checks whether an authenticated Supabase user is the authorized administrator.
 * Matches official university administrator email or assigned admin role.
 */
export const isAuthorizedAdminUser = (user: { email?: string; app_metadata?: Record<string, any>; user_metadata?: Record<string, any> } | null | undefined): boolean => {
  if (!user || !user.email) return false;
  const emailMatches = user.email.trim().toLowerCase() === OFFICIAL_ADMIN_EMAIL.toLowerCase();
  const roleMatches = user.app_metadata?.role === 'admin' || user.user_metadata?.role === 'admin';
  return emailMatches || roleMatches;
};

/**
 * Complete SQL Migration Script for Supabase SQL Editor
 * Users can copy and run this in Supabase -> SQL Editor
 */
export const SUPABASE_SQL_SETUP = `-- ==============================================================================
-- MJPRU PYQ Database Schema & Security Setup
-- University: M.J.P. Rohilkhand University, Bareilly (U.P.)
-- Authorized Administrator: admin@mjpru.ac.in
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Departments Table
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL,
  description TEXT,
  icon_name TEXT DEFAULT 'GraduationCap',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 3. Academic Years Table (1st, 2nd, 3rd, 4th Year)
CREATE TABLE IF NOT EXISTS public.academic_years (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  year_number INT NOT NULL UNIQUE,
  sort_order INT NOT NULL
);

-- 4. Semesters Table (Semesters 1 through 8)
CREATE TABLE IF NOT EXISTS public.semesters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  semester_number INT NOT NULL UNIQUE CHECK (semester_number BETWEEN 1 AND 8),
  academic_year_id UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
  name TEXT NOT NULL
);

-- 5. Subjects Table
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  semester_id UUID NOT NULL REFERENCES public.semesters(id) ON DELETE CASCADE,
  subject_name TEXT NOT NULL,
  subject_code TEXT NOT NULL,
  credits INT DEFAULT 4,
  category TEXT DEFAULT 'Theory' CHECK (category IN ('Theory', 'Elective', 'Practical', 'Project', 'Seminar', 'Training')),
  elective_group TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  CONSTRAINT unique_dept_subject UNIQUE (department_id, subject_code)
);

-- Upgrade existing tables if already created
ALTER TABLE public.subjects ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Theory';
ALTER TABLE public.subjects ADD COLUMN IF NOT EXISTS elective_group TEXT;
ALTER TABLE public.subjects ADD COLUMN IF NOT EXISTS note TEXT;

-- Migration: Upgrade question_papers examination_year to support academic sessions (e.g. '2025–26') while preserving all existing records
ALTER TABLE public.question_papers ALTER COLUMN examination_year TYPE TEXT USING examination_year::TEXT;
ALTER TABLE public.question_papers DROP CONSTRAINT IF EXISTS question_papers_examination_year_check;

-- 6. Question Papers Table
CREATE TABLE IF NOT EXISTS public.question_papers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  academic_year_id UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
  semester_id UUID NOT NULL REFERENCES public.semesters(id) ON DELETE CASCADE,
  examination_year TEXT NOT NULL,
  examination_type TEXT NOT NULL DEFAULT 'Regular' CHECK (examination_type IN ('Regular', 'Back Paper', 'Carry Over', 'Improvement', 'Mid-Term', 'End-Term')),
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size_bytes BIGINT DEFAULT 0,
  page_count INT DEFAULT 2,
  description TEXT,
  download_count INT DEFAULT 0,
  uploaded_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 7. User Profiles & Roles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin', 'faculty')),
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 8. Indexes for Instant Filtering & Global Search Performance
CREATE INDEX IF NOT EXISTS idx_papers_department ON public.question_papers(department_id);
CREATE INDEX IF NOT EXISTS idx_papers_subject ON public.question_papers(subject_id);
CREATE INDEX IF NOT EXISTS idx_papers_semester ON public.question_papers(semester_id);
CREATE INDEX IF NOT EXISTS idx_papers_dept_subject ON public.question_papers(department_id, subject_id);
CREATE INDEX IF NOT EXISTS idx_papers_exam_year ON public.question_papers(examination_year DESC);
CREATE INDEX IF NOT EXISTS idx_papers_exam_type ON public.question_papers(examination_type);
CREATE INDEX IF NOT EXISTS idx_subjects_department ON public.subjects(department_id);
CREATE INDEX IF NOT EXISTS idx_subjects_code ON public.subjects(subject_code);
-- Unique constraint ensuring each question paper is strictly isolated to its department, semester, subject, and exam year
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_dept_paper_record ON public.question_papers(
  department_id, 
  academic_year_id, 
  semester_id, 
  subject_id, 
  examination_year, 
  examination_type
);

-- 9. Row Level Security (RLS) Policies
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Public READ access for students (anyone can browse and search PYQs)
CREATE POLICY "Public departments read" ON public.departments FOR SELECT USING (true);
CREATE POLICY "Public academic years read" ON public.academic_years FOR SELECT USING (true);
CREATE POLICY "Public semesters read" ON public.semesters FOR SELECT USING (true);
CREATE POLICY "Public subjects read" ON public.subjects FOR SELECT USING (true);
CREATE POLICY "Public question papers read" ON public.question_papers FOR SELECT USING (true);
CREATE POLICY "Public profiles read" ON public.profiles FOR SELECT USING (true);

-- Authenticated Admin WRITE access restricted strictly to admin@mjpru.ac.in or role 'admin'
DROP POLICY IF EXISTS "Admin write departments" ON public.departments;
CREATE POLICY "Admin write departments" ON public.departments 
  FOR ALL USING (
    auth.role() = 'authenticated' AND (
      auth.jwt() ->> 'email' = 'admin@mjpru.ac.in' OR 
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admin write subjects" ON public.subjects;
CREATE POLICY "Admin write subjects" ON public.subjects 
  FOR ALL USING (
    auth.role() = 'authenticated' AND (
      auth.jwt() ->> 'email' = 'admin@mjpru.ac.in' OR 
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admin write papers" ON public.question_papers;
CREATE POLICY "Admin write papers" ON public.question_papers 
  FOR ALL USING (
    auth.role() = 'authenticated' AND (
      auth.jwt() ->> 'email' = 'admin@mjpru.ac.in' OR 
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    )
  );

-- 10. Storage Bucket Setup for PDF Files
-- Create 'pyq-papers' bucket:
INSERT INTO storage.buckets (id, name, public) 
VALUES ('pyq-papers', 'pyq-papers', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: Anyone can view and download PDF files
DROP POLICY IF EXISTS "Public PDF Access" ON storage.objects;
CREATE POLICY "Public PDF Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'pyq-papers');

-- Storage RLS: Admin only uploads, updates, and deletes
DROP POLICY IF EXISTS "Admin Upload PDF" ON storage.objects;
CREATE POLICY "Admin Upload PDF" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'pyq-papers' AND 
    auth.role() = 'authenticated' AND (
      auth.jwt() ->> 'email' = 'admin@mjpru.ac.in' OR 
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admin Update PDF" ON storage.objects;
CREATE POLICY "Admin Update PDF" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'pyq-papers' AND 
    auth.role() = 'authenticated' AND (
      auth.jwt() ->> 'email' = 'admin@mjpru.ac.in' OR 
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admin Delete PDF" ON storage.objects;
CREATE POLICY "Admin Delete PDF" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'pyq-papers' AND 
    auth.role() = 'authenticated' AND (
      auth.jwt() ->> 'email' = 'admin@mjpru.ac.in' OR 
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    )
  );
`;
