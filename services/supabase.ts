import { createClient } from '@supabase/supabase-js';
import { Job, JobType, WorkModel, JobArea, Application, ApplicationStatus, User, UserRole } from '../types';
import { MOCK_JOBS, MOCK_APPLICATIONS } from './mockData';

// Helper para obter variáveis de ambiente de forma segura (suporta Vite e process.env)
const getEnv = (key: string, viteKey: string) => {
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[viteKey]) {
    // @ts-ignore
    return import.meta.env[viteKey];
  }
  // @ts-ignore
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    // @ts-ignore
    return process.env[key];
  }
  return '';
};

// Substitua estas strings pelos valores do seu projeto Supabase
const supabaseUrl = getEnv('SUPABASE_URL', 'VITE_SUPABASE_URL') || 'https://otmxblvjpyncohcerhxu.supabase.co';
const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90bXhibHZqcHluY29oY2VyaHh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4OTAzODcsImV4cCI6MjA4MTQ2NjM4N30.nu6R0KU-49iVGP8NP0iZVK4h7unOuv97v6-z_9jKx9w';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Expor URL mascarada para diagnóstico
export const getMaskedUrl = () => {
    try {
        const url = new URL(supabaseUrl);
        return `${url.protocol}//${url.hostname.substring(0, 4)}***${url.hostname.substring(url.hostname.length - 10)}`;
    } catch (e) {
        return 'URL Inválida';
    }
};

/**
 * Mapeia o objeto do banco (snake_case) para o tipo da aplicação (camelCase)
 */
export const mapJobFromDB = (dbJob: any): Job => ({
  id: dbJob.id,
  companyId: dbJob.company_id,
  companyName: dbJob.profiles?.company_name || dbJob.profiles?.name || 'Empresa Confidencial',
  title: dbJob.title,
  description: dbJob.description,
  requirements: dbJob.requirements || [],
  location: dbJob.location,
  address: dbJob.address,
  type: dbJob.type as JobType,
  model: dbJob.model as WorkModel,
  area: dbJob.area as JobArea,
  salaryMin: dbJob.salary_min,
  salaryMax: dbJob.salary_max,
  postedAt: dbJob.posted_at,
  status: dbJob.status
});

export const mapApplicationFromDB = (dbApp: any): Application => ({
  id: dbApp.id,
  jobId: dbApp.job_id,
  candidateId: dbApp.candidate_id,
  candidateName: dbApp.profiles?.name || 'Candidato',
  status: dbApp.status as ApplicationStatus,
  appliedAt: dbApp.applied_at,
  jobTitle: dbApp.jobs?.title || 'Vaga Indisponível',
  companyName: dbApp.jobs?.profiles?.company_name || 'Empresa'
});

export const mapProfileToUser = (profile: any, email?: string): User => ({
    id: profile.id,
    email: profile.email || email || '',
    name: profile.name,
    role: profile.role as UserRole,
    avatar: profile.avatar,
    location: profile.location,
    
    // Empresa
    companyName: profile.company_name,
    companyArea: profile.company_area,
    companyWebsite: profile.company_website,
    companyLogo: profile.company_logo,
    companyDescription: profile.company_description,

    // Candidato
    resumeUrl: profile.resume_url,
    resumeName: profile.resume_name,
    skills: profile.skills || [],
    experience: profile.experience,
    education: profile.education,
    areaOfInterest: profile.area_of_interest,
    availability: profile.availability
});

// Helper para logar erros críticos de DB
const handleDbError = (context: string, error: any) => {
  if (error?.code === 'PGRST205' || error?.code === '42P01') {
      console.warn(`⚠️ Tabela inexistente em ${context}. Usando dados mockados.`);
      return true; // Indica que é erro de tabela faltando
  }
  console.error(`Erro em ${context}:`, JSON.stringify(error, null, 2));
  return false;
};

// --- Teste de Conexão ---

export const testConnection = async (): Promise<{ success: boolean; isSetupRequired: boolean; message: string; latency: number }> => {
    const start = performance.now();
    try {
        if (!supabaseUrl.includes('http')) {
            return { success: false, isSetupRequired: false, message: 'URL do Supabase inválida', latency: 0 };
        }
        // Tenta buscar 1 item apenas para ver se a tabela existe
        const { error } = await supabase.from('jobs').select('id').limit(1);
        const end = performance.now();
        const latency = Math.round(end - start);
        
        if (error) {
            // Códigos de erro Postgres para "Tabela não existe"
            if (error.code === 'PGRST205' || error.code === '42P01') {
                return { 
                    success: false, 
                    isSetupRequired: true, 
                    message: 'Conectado, mas tabelas não encontradas (Requer Setup SQL)', 
                    latency 
                };
            }
            return { success: false, isSetupRequired: false, message: `Erro de conexão: ${error.message}`, latency };
        }
        return { success: true, isSetupRequired: false, message: 'Conectado ao Supabase', latency };
    } catch (e: any) {
        const end = performance.now();
        return { success: false, isSetupRequired: false, message: e.message || 'Erro desconhecido', latency: Math.round(end - start) };
    }
};

// --- Job Services ---

export const getJobs = async () => {
  try {
    const { data, error } = await supabase
        .from('jobs')
        .select('*, profiles(company_name, name)')
        .eq('status', 'ACTIVE')
        .order('posted_at', { ascending: false });
    
    if (error) {
        handleDbError("getJobs", error);
        return MOCK_JOBS; 
    }
    
    if (!data) return MOCK_JOBS;
    return data.map(mapJobFromDB);
  } catch (err) {
    console.error("Exceção em getJobs:", err);
    return MOCK_JOBS;
  }
};

export const getJobById = async (id: string) => {
  try {
    const { data, error } = await supabase
        .from('jobs')
        .select('*, profiles(company_name, name)')
        .eq('id', id)
        .single();

    if (error) {
        handleDbError("getJobById", error);
        const mockJob = MOCK_JOBS.find(j => j.id === id);
        return mockJob || null;
    }
    return mapJobFromDB(data);
  } catch (err) {
    console.error("Exceção em getJobById:", err);
    return MOCK_JOBS.find(j => j.id === id) || null;
  }
};

export const createJob = async (job: Partial<Job>) => {
  try {
      const dbJob = {
        company_id: job.companyId,
        title: job.title,
        description: job.description,
        requirements: job.requirements,
        location: job.location,
        address: job.address,
        type: job.type,
        model: job.model,
        area: job.area,
        salary_min: job.salaryMin,
        salary_max: job.salaryMax,
        status: 'ACTIVE'
      };

      const { data, error } = await supabase.from('jobs').insert(dbJob).select().single();
      
      if (error) {
        handleDbError("createJob", error);
        return { ...job, id: 'mock-id-' + Date.now(), postedAt: new Date().toISOString() };
      }
      return data;
  } catch (err) {
      console.error("Fallback createJob", err);
      return { ...job, id: 'mock-id-' + Date.now(), postedAt: new Date().toISOString() };
  }
};

export const getCompanyJobs = async (companyId: string) => {
  try {
    const { data, error } = await supabase
        .from('jobs')
        .select('*, profiles(company_name, name)')
        .eq('company_id', companyId)
        .order('posted_at', { ascending: false });

    if (error) {
        handleDbError("getCompanyJobs", error);
        return MOCK_JOBS.filter(j => j.companyId === companyId);
    }
    return data.map(mapJobFromDB);
  } catch (err) {
    console.error("Exceção em getCompanyJobs:", err);
    return MOCK_JOBS.filter(j => j.companyId === companyId);
  }
};

// --- Application Services ---

export const applyToJob = async (jobId: string, candidateId: string) => {
  try {
      const { data, error } = await supabase.from('applications').insert({
        job_id: jobId,
        candidate_id: candidateId,
        status: 'Enviado'
      }).select();

      if (error) {
        handleDbError("applyToJob", error);
        return [{ id: 'mock-app-' + Date.now() }];
      }
      return data;
  } catch (err) {
      return [{ id: 'mock-app-' + Date.now() }];
  }
};

export const checkHasApplied = async (jobId: string, candidateId: string) => {
  try {
      const { data, error } = await supabase
        .from('applications')
        .select('id')
        .eq('job_id', jobId)
        .eq('candidate_id', candidateId)
        .maybeSingle();
        
      if (error) {
         if (error.code !== 'PGRST116') {
            handleDbError("checkHasApplied", error);
         }
         return MOCK_APPLICATIONS.some(a => a.jobId === jobId && a.candidateId === candidateId);
      }
      return !!data;
  } catch (err) {
      return MOCK_APPLICATIONS.some(a => a.jobId === jobId && a.candidateId === candidateId);
  }
};

export const getCandidateApplications = async (candidateId: string) => {
  try {
    const { data, error } = await supabase
        .from('applications')
        .select('*, jobs(title, profiles(company_name))')
        .eq('candidate_id', candidateId)
        .order('applied_at', { ascending: false });

    if (error) {
        handleDbError("getCandidateApplications", error);
        return MOCK_APPLICATIONS.filter(a => a.candidateId === candidateId);
    }
    return data.map(mapApplicationFromDB);
  } catch (err) {
    console.error("Exceção em getCandidateApplications:", err);
    return MOCK_APPLICATIONS.filter(a => a.candidateId === candidateId);
  }
};

export const getJobApplications = async (jobIds: string[]) => {
   if (jobIds.length === 0) return [];
   
   try {
    const { data, error } = await supabase
        .from('applications')
        .select('*, profiles(name)')
        .in('job_id', jobIds)
        .order('applied_at', { ascending: false });
        
    if (error) {
        handleDbError("getJobApplications", error);
        return MOCK_APPLICATIONS.filter(a => jobIds.includes(a.jobId));
    }
    return data.map(mapApplicationFromDB);
   } catch (err) {
    console.error("Exceção em getJobApplications:", err);
    return MOCK_APPLICATIONS.filter(a => jobIds.includes(a.jobId));
   }
};

export const checkSupabaseConnection = async () => {
    // Deprecated in favor of testConnection logic for UI status
    const result = await testConnection();
    return result.success;
};