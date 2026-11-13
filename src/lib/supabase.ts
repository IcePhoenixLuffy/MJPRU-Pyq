import { createClient, SupabaseClient } from '@supabase/supabase-js';

const env: Record<string, string | undefined> = import.meta.env ?? {};
const penv: Record<string, string | undefined> = typeof process !== 'undefined' ? process.env : {};

const url = env.VITE_SUPABASE_URL ?? '';
const key = env.VITE_SUPABASE_ANON_KEY ?? '';

export const isSupabaseConfigured = (): boolean => url.startsWith('http') && key.length > 20;

// persistSession / autoRefreshToken are already true by default
export const supabase: SupabaseClient | null = isSupabaseConfigured() ? createClient(url, key) : null;

export const OFFICIAL_ADMIN_EMAIL = (
  env.VITE_OFFICIAL_ADMIN_EMAIL || penv.VITE_OFFICIAL_ADMIN_EMAIL || penv.OFFICIAL_ADMIN_EMAIL || 'admin@mjpru.ac.in'
).trim();
const adminEmailSql = OFFICIAL_ADMIN_EMAIL.replace(/'/g, "''");

/**
 * UI-only convenience check. Must mirror public.is_admin() in the SQL below.
 * Only app_metadata is trusted: user_metadata is editable by any signed-in user.
 * Real enforcement is always the RLS policies, never this function.
 */
export const isAuthorizedAdminUser = (
  user: { app_metadata?: Record<string, any> } | null | undefined
): boolean => user?.app_metadata?.role === 'admin';

export const SUPABASE_SQL_SETUP = `-- ============================================================================
-- MJPRU PYQ schema & security (M.J.P. Rohilkhand University, Bareilly)
-- Safe to re-run. Admin = JWT app_metadata.role = 'admin' (promoted at the end).
-- ============================================================================

-- 1. Admin helper (used by every write policy)
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS boolean
LANGUAGE sql STABLE SET search_path = '' AS $fn$
  SELECT coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false)
$fn$;

-- 2. Tables
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL,
  description TEXT,
  icon_name TEXT DEFAULT 'GraduationCap',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.academic_years (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  year_number INT NOT NULL UNIQUE CHECK (year_number BETWEEN 1 AND 4),
  sort_order INT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.semesters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  semester_number INT NOT NULL UNIQUE CHECK (semester_number BETWEEN 1 AND 8),
  academic_year_id UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  UNIQUE (id, academic_year_id)
);

CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  semester_id UUID NOT NULL REFERENCES public.semesters(id) ON DELETE CASCADE,
  subject_name TEXT NOT NULL,
  subject_code TEXT NOT NULL,
  credits INT DEFAULT 4,
  category TEXT DEFAULT 'Theory' CHECK (category IN ('Theory','Elective','Practical','Project','Seminar','Training')),
  elective_group TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (department_id, subject_code),
  UNIQUE (id, department_id, semester_id)
);

-- Composite FKs guarantee a paper's dept / semester / year always agree with its subject
CREATE TABLE IF NOT EXISTS public.question_papers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID NOT NULL,
  subject_id UUID NOT NULL,
  academic_year_id UUID NOT NULL,
  semester_id UUID NOT NULL,
  examination_year TEXT NOT NULL CHECK (examination_year ~ '^[0-9]{4}([–-][0-9]{2})?$'),
  examination_type TEXT NOT NULL DEFAULT 'Regular'
    CHECK (examination_type IN ('Regular','Back Paper','Carry Over','Improvement','Mid-Term','End-Term')),
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size_bytes BIGINT DEFAULT 0,
  page_count INT,
  description TEXT,
  download_count INT NOT NULL DEFAULT 0,
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  FOREIGN KEY (subject_id, department_id, semester_id)
    REFERENCES public.subjects(id, department_id, semester_id) ON DELETE CASCADE,
  FOREIGN KEY (semester_id, academic_year_id)
    REFERENCES public.semesters(id, academic_year_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student','admin','faculty')),
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Upgrade path for databases created with the older schema
ALTER TABLE public.subjects ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Theory';
ALTER TABLE public.subjects ADD COLUMN IF NOT EXISTS elective_group TEXT;
ALTER TABLE public.subjects ADD COLUMN IF NOT EXISTS note TEXT;
ALTER TABLE public.question_papers ALTER COLUMN examination_year TYPE TEXT USING examination_year::TEXT;
ALTER TABLE public.question_papers DROP CONSTRAINT IF EXISTS question_papers_examination_year_check;

-- 4. Indexes (one unique index also prevents duplicate uploads)
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_dept_paper_record ON public.question_papers
  (department_id, academic_year_id, semester_id, subject_id, examination_year, examination_type);
CREATE INDEX IF NOT EXISTS idx_papers_dept_subject ON public.question_papers(department_id, subject_id);
CREATE INDEX IF NOT EXISTS idx_papers_subject ON public.question_papers(subject_id);
CREATE INDEX IF NOT EXISTS idx_papers_semester ON public.question_papers(semester_id);
CREATE INDEX IF NOT EXISTS idx_papers_exam_year ON public.question_papers(examination_year DESC);
CREATE INDEX IF NOT EXISTS idx_subjects_semester ON public.subjects(semester_id);
CREATE INDEX IF NOT EXISTS idx_subjects_code ON public.subjects(subject_code);

-- 5. Row Level Security: public read, admin-only write (rebuilt cleanly on every run)
DO $rls$
DECLARE t TEXT; p RECORD;
BEGIN
  FOREACH t IN ARRAY ARRAY['departments','academic_years','semesters','subjects','question_papers'] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    FOR p IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = t LOOP
      EXECUTE format('DROP POLICY %I ON public.%I', p.policyname, t);
    END LOOP;
    EXECUTE format('CREATE POLICY "Public read" ON public.%I FOR SELECT USING (true)', t);
    EXECUTE format('CREATE POLICY "Admin write" ON public.%I FOR ALL TO authenticated
      USING ((SELECT public.is_admin())) WITH CHECK ((SELECT public.is_admin()))', t);
  END LOOP;
END $rls$;

-- Profiles: users see only their own row (admin sees all); auto-created on signup
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public profiles read" ON public.profiles;
DROP POLICY IF EXISTS "Own profile read" ON public.profiles;
CREATE POLICY "Own profile read" ON public.profiles FOR SELECT TO authenticated
  USING (id = (SELECT auth.uid()) OR (SELECT public.is_admin()));

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $fn$
BEGIN
  INSERT INTO public.profiles (id, full_name) VALUES (new.id, new.raw_user_meta_data ->> 'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END $fn$;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Download counter (students can't UPDATE the table, so expose a narrow RPC)
-- Client: supabase.rpc('increment_download', { paper_id })
CREATE OR REPLACE FUNCTION public.increment_download(paper_id UUID) RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = '' AS $fn$
  UPDATE public.question_papers SET download_count = download_count + 1 WHERE id = paper_id
$fn$;
GRANT EXECUTE ON FUNCTION public.increment_download(UUID) TO anon, authenticated;

-- 7. Storage: public PDF bucket, 20 MB cap, PDFs only, admin-only writes
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('pyq-papers', 'pyq-papers', true, 20971520, ARRAY['application/pdf'])
ON CONFLICT (id) DO UPDATE
  SET file_size_limit = EXCLUDED.file_size_limit, allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public PDF Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin Upload PDF" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update PDF" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete PDF" ON storage.objects;
DROP POLICY IF EXISTS "Admin PDF write" ON storage.objects;
CREATE POLICY "Public PDF Access" ON storage.objects FOR SELECT USING (bucket_id = 'pyq-papers');
CREATE POLICY "Admin PDF write" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'pyq-papers' AND (SELECT public.is_admin()))
  WITH CHECK (bucket_id = 'pyq-papers' AND (SELECT public.is_admin()));

-- 8. Seed: 4 years, 8 semesters (2 per year)
INSERT INTO public.academic_years (name, year_number, sort_order)
SELECT n || CASE n WHEN 1 THEN 'st' WHEN 2 THEN 'nd' WHEN 3 THEN 'rd' ELSE 'th' END || ' Year', n, n
FROM generate_series(1, 4) n ON CONFLICT (year_number) DO NOTHING;

INSERT INTO public.semesters (semester_number, academic_year_id, name)
SELECT s, (SELECT id FROM public.academic_years WHERE year_number = (s + 1) / 2), 'Semester ' || s
FROM generate_series(1, 8) s ON CONFLICT (semester_number) DO NOTHING;

-- 9. Promote the administrator (run AFTER that user has signed up; they must re-login)
UPDATE auth.users
SET raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'
WHERE lower(email) = lower('${adminEmailSql}');
`;