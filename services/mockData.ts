import { Job, JobType, WorkModel, Application, ApplicationStatus, UserRole, User, JobArea } from '../types';

export const MOCK_JOBS: Job[] = [
  {
    id: '1',
    companyId: 'comp1',
    companyName: 'TechNova Solutions',
    title: 'Senior React Developer',
    description: 'Procuramos um especialista em React para liderar nosso novo frontend.',
    requirements: ['React', 'TypeScript', 'Tailwind', 'Node.js'],
    location: 'São Paulo, SP',
    type: JobType.FULL_TIME,
    model: WorkModel.REMOTE,
    area: JobArea.TECH,
    salaryMin: 12000,
    salaryMax: 18000,
    postedAt: '2023-10-25',
    status: 'ACTIVE'
  },
  {
    id: '2',
    companyId: 'comp2',
    companyName: 'GreenEnergy Corp',
    title: 'Analista de Dados Pleno',
    description: 'Ajude-nos a analisar dados de consumo de energia renovável.',
    requirements: ['Python', 'SQL', 'Power BI', 'AWS'],
    location: 'Rio de Janeiro, RJ',
    type: JobType.FULL_TIME,
    model: WorkModel.HYBRID,
    area: JobArea.TECH,
    salaryMin: 8000,
    salaryMax: 11000,
    postedAt: '2023-10-26',
    status: 'ACTIVE'
  },
  {
    id: '3',
    companyId: 'comp1',
    companyName: 'TechNova Solutions',
    title: 'UI/UX Designer',
    description: 'Crie experiências incríveis para nossos usuários globais.',
    requirements: ['Figma', 'Prototipagem', 'Design System'],
    location: 'Remoto',
    type: JobType.CONTRACT,
    model: WorkModel.REMOTE,
    area: JobArea.DESIGN,
    salaryMin: 10000,
    salaryMax: 14000,
    postedAt: '2023-10-20',
    status: 'ACTIVE'
  },
];

export const MOCK_APPLICATIONS: Application[] = [
  {
    id: 'app1',
    jobId: '1',
    candidateId: 'cand1',
    candidateName: 'João Silva',
    status: ApplicationStatus.REVIEWING,
    appliedAt: '2023-10-27',
    jobTitle: 'Senior React Developer',
    companyName: 'TechNova Solutions'
  },
  {
    id: 'app2',
    jobId: '2',
    candidateId: 'cand1',
    candidateName: 'João Silva',
    status: ApplicationStatus.APPLIED,
    appliedAt: '2023-10-28',
    jobTitle: 'Analista de Dados Pleno',
    companyName: 'GreenEnergy Corp'
  }
];

export const MOCK_USERS: User[] = [
    {
        id: 'cand1',
        name: 'João Silva',
        email: 'joao@email.com',
        role: UserRole.CANDIDATE,
        location: 'São Paulo, SP',
        skills: ['React', 'JavaScript', 'CSS'],
        experience: 'Desenvolvedor Frontend na Empresa X (2 anos)',
        education: 'Ciência da Computação - USP',
        areaOfInterest: JobArea.TECH,
        availability: 'CLT'
    },
    {
        id: 'comp1',
        name: 'Recrutador TechNova',
        email: 'rh@technova.com',
        role: UserRole.COMPANY,
        companyName: 'TechNova Solutions',
        companyArea: JobArea.TECH,
        companyWebsite: 'https://technova.com',
        companyDescription: 'A TechNova é líder em soluções de tecnologia, focada em inovação e transformação digital para grandes empresas.',
        location: 'São Paulo, SP'
    },
    {
        id: 'admin1',
        name: 'Super Admin',
        email: 'admin@jobflow.com',
        role: UserRole.ADMIN
    }
];