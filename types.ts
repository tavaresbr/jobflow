
export enum UserRole {
  CANDIDATE = 'CANDIDATE',
  COMPANY = 'COMPANY',
  ADMIN = 'ADMIN'
}

export enum JobType {
  FULL_TIME = 'CLT',
  CONTRACT = 'PJ',
  FREELANCE = 'Freelancer',
  INTERNSHIP = 'Estágio'
}

export enum WorkModel {
  ONSITE = 'Presencial',
  REMOTE = 'Remoto',
  HYBRID = 'Híbrido'
}

export enum JobArea {
  TECH = 'Tecnologia',
  MARKETING = 'Marketing',
  DESIGN = 'Design',
  SALES = 'Vendas',
  FINANCE = 'Financeiro',
  HR = 'Recursos Humanos',
  HEALTH = 'Saúde',
  EDUCATION = 'Educação',
  OPERATIONS = 'Operações',
  OTHER = 'Outros'
}

export enum ApplicationStatus {
  APPLIED = 'Enviado',
  REVIEWING = 'Em análise',
  APPROVED = 'Aprovado',
  REJECTED = 'Rejeitado'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  location?: string;
  address?: {
    cep: string;
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
    mapQuery?: string;
  };
  // Specific fields based on role could be expanded here
  companyName?: string; // For companies
  companyArea?: string; // For companies
  companyWebsite?: string; // For companies
  companyLogo?: string; // For companies
  companyDescription?: string; // For companies
  cnpj?: string; // For companies
  phone?: string; // For companies
  social?: {
    linkedin?: string;
    instagram?: string;
    twitter?: string;
  };
  resumeUrl?: string; // For candidates
  resumeName?: string; // For candidates - to display file name
  skills?: string[]; // For candidates
  experience?: string; // For candidates
  education?: string; // For candidates
  areaOfInterest?: string; // For candidates
  availability?: string; // For candidates
}

export interface Job {
  id: string;
  companyId: string;
  companyName: string;
  title: string;
  description: string;
  requirements: string[];
  location: string;
  address?: {
    cep: string;
    street: string;
    number: string;
    complement: string;
  };
  type: JobType;
  model: WorkModel;
  area: JobArea; // New field for filtering
  salaryMin?: number;
  salaryMax?: number;
  postedAt: string;
  status: 'ACTIVE' | 'PAUSED' | 'CLOSED';
}

export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  candidateName: string;
  status: ApplicationStatus;
  appliedAt: string;
  jobTitle: string; // Denormalized for easier display
  companyName: string; // Denormalized
}

export interface Stats {
  totalJobs: number;
  totalApplications: number;
  activeUsers: number;
  revenue: number;
}