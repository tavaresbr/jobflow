
-- Setup Inicial do Banco de Dados JobFlow
-- Este arquivo reflete a estrutura criada via migração 'init_schema'

-- Enums
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS job_type CASCADE;
DROP TYPE IF EXISTS work_model CASCADE;
DROP TYPE IF EXISTS job_area CASCADE;
DROP TYPE IF EXISTS application_status CASCADE;
DROP TYPE IF EXISTS job_status_type CASCADE;

CREATE TYPE user_role AS ENUM ('CANDIDATE', 'COMPANY', 'ADMIN');
CREATE TYPE job_type AS ENUM ('CLT', 'PJ', 'Freelancer', 'Estágio');
CREATE TYPE work_model AS ENUM ('Presencial', 'Remoto', 'Híbrido');
CREATE TYPE job_area AS ENUM ('Tecnologia', 'Marketing', 'Design', 'Vendas', 'Financeiro', 'Recursos Humanos', 'Saúde', 'Educação', 'Operações', 'Outros');
CREATE TYPE application_status AS ENUM ('Enviado', 'Em análise', 'Aprovado', 'Rejeitado');
CREATE TYPE job_status_type AS ENUM ('ACTIVE', 'PAUSED', 'CLOSED');

-- Tabelas
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'CANDIDATE',
  avatar TEXT,
  location TEXT,
  address JSONB,
  company_name TEXT,
  company_area job_area,
  company_website TEXT,
  company_logo TEXT,
  company_description TEXT,
  resume_url TEXT,
  resume_name TEXT,
  skills TEXT[],
  experience TEXT,
  education TEXT,
  area_of_interest job_area,
  availability job_type,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT[] NOT NULL DEFAULT '{}',
  location TEXT NOT NULL,
  address JSONB,
  type job_type NOT NULL,
  model work_model NOT NULL,
  area job_area NOT NULL,
  salary_min NUMERIC,
  salary_max NUMERIC,
  status job_status_type NOT NULL DEFAULT 'ACTIVE',
  posted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status application_status NOT NULL DEFAULT 'Enviado',
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(job_id, candidate_id)
);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Jobs are viewable by everyone" ON public.jobs FOR SELECT USING (true);
CREATE POLICY "Companies can insert jobs" ON public.jobs FOR INSERT WITH CHECK (auth.uid() = company_id);
CREATE POLICY "Companies can update own jobs" ON public.jobs FOR UPDATE USING (auth.uid() = company_id);
CREATE POLICY "Companies can delete own jobs" ON public.jobs FOR DELETE USING (auth.uid() = company_id);

CREATE POLICY "Candidates can apply" ON public.applications FOR INSERT WITH CHECK (auth.uid() = candidate_id);
CREATE POLICY "Candidates can view own applications" ON public.applications FOR SELECT USING (auth.uid() = candidate_id);
CREATE POLICY "Companies can view applications for their jobs" ON public.applications FOR SELECT USING (EXISTS (SELECT 1 FROM public.jobs WHERE public.jobs.id = public.applications.job_id AND public.jobs.company_id = auth.uid()));

-- Auth Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
  meta jsonb;
BEGIN
  meta := new.raw_user_meta_data;
  INSERT INTO public.profiles (
    id, email, name, role, avatar, location,
    company_name, company_area, company_website, company_logo, company_description,
    resume_url, resume_name, skills, experience, education, area_of_interest, availability
  )
  VALUES (
    new.id, 
    new.email, 
    COALESCE(meta->>'name', ''), 
    COALESCE((meta->>'role')::public.user_role, 'CANDIDATE'::public.user_role),
    meta->>'avatar',
    meta->>'location',
    meta->'address',
    meta->>'companyName',
    CASE WHEN meta->>'companyArea' IS NOT NULL THEN (meta->>'companyArea')::public.job_area ELSE NULL END,
    meta->>'companyWebsite',
    meta->>'companyLogo',
    meta->>'companyDescription',
    meta->>'resumeUrl',
    meta->>'resumeName',
    CASE WHEN meta->'skills' IS NOT NULL AND jsonb_typeof(meta->'skills') = 'array' THEN ARRAY(SELECT jsonb_array_elements_text(meta->'skills')) ELSE NULL END,
    meta->>'experience',
    meta->>'education',
    CASE WHEN meta->>'areaOfInterest' IS NOT NULL THEN (meta->>'areaOfInterest')::public.job_area ELSE NULL END,
    CASE WHEN meta->>'availability' IS NOT NULL THEN (meta->>'availability')::public.job_type ELSE NULL END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
