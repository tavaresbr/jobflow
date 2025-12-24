import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole, ApplicationStatus, JobType, User, Job } from '../types';
import { MOCK_APPLICATIONS, MOCK_JOBS, MOCK_USERS } from '../services/mockData';
import { getCompanyJobs, getJobApplications, getCandidateApplications } from '../services/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Briefcase, Users, FileText, CheckCircle, DollarSign, MapPin, ArrowRight, Calendar, Settings, Plus, Trash2, Ban, Shield, TrendingUp, Search, Building2, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  
  // Real Data State
  const [companyJobs, setCompanyJobs] = useState<Job[]>([]);
  const [companyApplications, setCompanyApplications] = useState<any[]>([]);
  const [candidateApplications, setCandidateApplications] = useState<any[]>([]);

  // Admin State Management
  const [adminTab, setAdminTab] = useState<'overview' | 'users' | 'companies' | 'jobs'>('overview');
  const [adminUsers, setAdminUsers] = useState<User[]>(MOCK_USERS);
  const [adminJobs, setAdminJobs] = useState<Job[]>(MOCK_JOBS);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
        if (!user) return;
        
        try {
            if (user.role === UserRole.COMPANY) {
                const jobs = await getCompanyJobs(user.id);
                setCompanyJobs(jobs);
                const jobIds = jobs.map(j => j.id);
                const apps = await getJobApplications(jobIds);
                setCompanyApplications(apps);
            } else if (user.role === UserRole.CANDIDATE) {
                const apps = await getCandidateApplications(user.id);
                setCandidateApplications(apps);
            }
        } catch (error) {
            console.error("Dashboard fetch error", error);
        } finally {
            setLoading(false);
        }
    };
    fetchDashboardData();
  }, [user]);

  if (!user) return <div>Access Denied</div>;
  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

  // --- CANDIDATE VIEW ---
  if (user.role === UserRole.CANDIDATE) {
    const myApplications = candidateApplications.length > 0 ? candidateApplications : MOCK_APPLICATIONS.filter(app => app.candidateId === user.id);
    const recommendedJobs = MOCK_JOBS.slice(0, 2); // Still mock for recommendations
    
    return (
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg">
            <h1 className="text-3xl font-bold mb-2">Olá, {user.name.split(' ')[0]}!</h1>
            <p className="text-blue-100">Aqui está o resumo da sua jornada profissional hoje.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                        <FileText size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Candidaturas</p>
                        <h3 className="text-2xl font-bold text-gray-900">{myApplications.length}</h3>
                    </div>
                </div>
            </div>
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Entrevistas</p>
                        <h3 className="text-2xl font-bold text-gray-900">0</h3>
                    </div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
                <div>
                     <p className="text-sm text-gray-500 font-medium mb-1">Status Recente</p>
                     <p className="font-semibold text-gray-900">
                        {myApplications.length > 0 ? myApplications[0].status : 'Nenhuma atividade'}
                     </p>
                </div>
                <Link to="/my-applications" className="text-blue-600 text-sm font-bold hover:underline">Ver tudo</Link>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recommended Jobs */}
            <div className="lg:col-span-2 space-y-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Briefcase size={20} className="text-blue-600"/> Vagas Recomendadas
                </h2>
                {recommendedJobs.map(job => (
                     <div key={job.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
                         <div className="flex justify-between items-start">
                             <div>
                                 <h3 className="font-bold text-lg text-gray-900">{job.title}</h3>
                                 <p className="text-gray-500 text-sm mb-3">{job.companyName}</p>
                                 <div className="flex gap-3 text-sm text-gray-600">
                                     <span className="flex items-center gap-1"><MapPin size={14}/> {job.location}</span>
                                     <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                        job.type === JobType.FULL_TIME ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                     }`}>{job.type}</span>
                                 </div>
                             </div>
                             <Link to={`/job/${job.id}`} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition">
                                Ver Vaga
                             </Link>
                         </div>
                     </div>
                ))}
                 <Link to="/" className="block text-center p-3 bg-blue-50 text-blue-700 rounded-xl font-medium hover:bg-blue-100 transition">
                    Buscar mais vagas
                </Link>
            </div>
            
            {/* Profile Completion or Tips */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit">
                <h3 className="font-bold text-gray-900 mb-4">Complete seu Perfil</h3>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{width: '75%'}}></div>
                </div>
                <p className="text-sm text-gray-600 mb-4">Seu perfil está 75% completo. Adicione mais habilidades para aumentar suas chances.</p>
                <Link to="/profile" className="block w-full text-center border border-gray-300 text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-50 transition">
                    Editar Perfil
                </Link>
            </div>
        </div>
      </div>
    );
  }

  // --- COMPANY VIEW ---
  if (user.role === UserRole.COMPANY) {
    const myJobs = companyJobs;
    const applications = companyApplications;

    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
             <div>
                <h1 className="text-2xl font-bold text-gray-900">Painel da Empresa</h1>
                <p className="text-gray-500">Gerencie suas vagas e candidatos em um só lugar.</p>
             </div>
             <Link to="/post-job" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-medium shadow-sm">
                <Plus size={18} /> Nova Vaga
             </Link>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                        <Briefcase size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Vagas Ativas</p>
                        <h3 className="text-2xl font-bold text-gray-900">{myJobs.filter(j => j.status === 'ACTIVE').length}</h3>
                    </div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Candidatos Totais</p>
                        <h3 className="text-2xl font-bold text-gray-900">{applications.length}</h3>
                    </div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                        <FileText size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Currículos Novos</p>
                        <h3 className="text-2xl font-bold text-gray-900">{applications.filter(a => a.status === ApplicationStatus.APPLIED).length}</h3>
                    </div>
                </div>
            </div>
        </div>

        {/* Jobs List Management Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <Briefcase size={18} /> Suas Vagas Publicadas
                </h3>
            </div>
            
            {myJobs.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                    <p className="mb-4">Você ainda não publicou nenhuma vaga.</p>
                    <Link to="/post-job" className="text-blue-600 font-semibold hover:underline">
                        Publicar primeira vaga
                    </Link>
                </div>
            ) : (
                <div className="divide-y divide-gray-100">
                    {myJobs.map(job => {
                        const candidateCount = applications.filter(a => a.jobId === job.id).length;
                        return (
                            <div key={job.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-blue-50/30 transition">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h4 className="font-bold text-gray-900 text-lg hover:text-blue-600 transition">
                                            <Link to={`/job/${job.id}`}>{job.title}</Link>
                                        </h4>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                            job.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {job.status === 'ACTIVE' ? 'Ativa' : 'Fechada'}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Calendar size={14} /> Postada em {new Date(job.postedAt).toLocaleDateString()}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <MapPin size={14} /> {job.location}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <DollarSign size={14} /> {job.type}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-6 self-start md:self-center">
                                    <div className="text-center px-4 border-l border-gray-100">
                                        <span className="block text-2xl font-bold text-gray-900">
                                            {candidateCount}
                                        </span>
                                        <span className="text-xs text-gray-500 uppercase font-semibold tracking-wide">Candidatos</span>
                                    </div>
                                    
                                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white rounded-lg text-gray-700 hover:bg-gray-50 hover:text-blue-600 hover:border-blue-300 font-medium transition shadow-sm">
                                        <Settings size={16} /> 
                                        <span>Gerenciar</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
      </div>
    );
  }

  // --- ADMIN VIEW (Keep as is for MVP, mock data OK) ---
  if (user.role === UserRole.ADMIN) {
    // ... existing admin logic ...
    const handleDeleteUser = (userId: string) => {
        if(window.confirm('Tem certeza que deseja remover este usuário?')) {
            setAdminUsers(prev => prev.filter(u => u.id !== userId));
        }
    };

    const handleDeleteJob = (jobId: string) => {
        if(window.confirm('Tem certeza que deseja excluir esta vaga?')) {
            setAdminJobs(prev => prev.filter(j => j.id !== jobId));
        }
    };

    const handleCloseJob = (jobId: string) => {
        setAdminJobs(prev => prev.map(j => j.id === jobId ? {...j, status: 'CLOSED'} : j));
    };

    const candidates = adminUsers.filter(u => u.role === UserRole.CANDIDATE);
    const companies = adminUsers.filter(u => u.role === UserRole.COMPANY);
    const totalApplications = MOCK_APPLICATIONS.length;
    const activeJobs = adminJobs.filter(j => j.status === 'ACTIVE').length;
    
    const chartData = [
      { name: 'Seg', applications: 40, jobs: 24 },
      { name: 'Ter', applications: 30, jobs: 13 },
      { name: 'Qua', applications: 20, jobs: 38 },
      { name: 'Qui', applications: 27, jobs: 39 },
      { name: 'Sex', applications: 18, jobs: 48 },
      { name: 'Sab', applications: 23, jobs: 38 },
      { name: 'Dom', applications: 34, jobs: 43 },
    ];

    const pieData = [
        { name: 'Ativo', value: activeJobs },
        { name: 'Pausado/Fechado', value: adminJobs.length - activeJobs },
    ];
    const COLORS = ['#0088FE', '#FF8042'];

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Shield className="text-blue-600" /> Painel Administrativo
            </h1>
            
            <div className="bg-white rounded-lg p-1 flex shadow-sm border border-gray-200">
                {[
                    { id: 'overview', label: 'Visão Geral', icon: TrendingUp },
                    { id: 'users', label: 'Usuários', icon: Users },
                    { id: 'companies', label: 'Empresas', icon: Building2 },
                    { id: 'jobs', label: 'Moderação', icon: Briefcase },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setAdminTab(tab.id as any)}
                        className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition ${
                            adminTab === tab.id 
                            ? 'bg-blue-600 text-white shadow' 
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        <tab.icon size={16} /> <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                ))}
            </div>
        </div>

        {/* --- OVERVIEW TAB --- */}
        {adminTab === 'overview' && (
            <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                        { label: 'Receita Mensal (Est.)', val: 'R$ 15.2k', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
                        { label: 'Usuários Ativos', val: adminUsers.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
                        { label: 'Vagas Publicadas', val: adminJobs.length, icon: Briefcase, color: 'text-purple-600', bg: 'bg-purple-100' },
                        { label: 'Candidaturas', val: totalApplications, icon: FileText, color: 'text-orange-600', bg: 'bg-orange-100' },
                    ].map((kpi, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
                            <div className={`p-3 rounded-lg ${kpi.bg} ${kpi.color}`}>
                                <kpi.icon size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">{kpi.label}</p>
                                <h3 className="text-2xl font-bold text-gray-900">{kpi.val}</h3>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="font-semibold text-gray-800 mb-6">Atividade da Plataforma</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="jobs" fill="#4F46E5" name="Novas Vagas" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="applications" fill="#93C5FD" name="Candidaturas" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="font-semibold text-gray-800 mb-6">Status das Vagas</h3>
                        <div className="h-64 flex justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </>
        )}

        {/* --- USERS TAB --- */}
        {adminTab === 'users' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-800">Gerenciar Candidatos ({candidates.length})</h3>
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Buscar usuário..." 
                            className="pl-8 pr-4 py-1.5 bg-white text-gray-900 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {candidates
                                .filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.includes(searchTerm))
                                .map(user => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                            Candidato
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button 
                                            onClick={() => handleDeleteUser(user.id)}
                                            className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-2 rounded-md transition"
                                            title="Banir Usuário"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* --- COMPANIES TAB --- */}
        {adminTab === 'companies' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-800">Gerenciar Empresas ({companies.length})</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email Responsável</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Website</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {companies.map(company => (
                                <tr key={company.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                                                {company.companyName?.charAt(0)}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{company.companyName}</div>
                                                <div className="text-xs text-gray-500">{company.companyArea}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{company.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-500 hover:underline cursor-pointer">
                                        {company.companyWebsite || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button 
                                            onClick={() => handleDeleteUser(company.id)}
                                            className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-2 rounded-md transition"
                                            title="Bloquear Empresa"
                                        >
                                            <Ban size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* --- JOBS MODERATION TAB --- */}
        {adminTab === 'jobs' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-800">Moderação de Vagas ({adminJobs.length})</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vaga</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {adminJobs.map(job => (
                                <tr key={job.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900"><Link to={`/job/${job.id}`} className="hover:text-blue-600">{job.title}</Link></div>
                                        <div className="text-xs text-gray-500">{job.type} • {job.location}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{job.companyName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            job.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            {job.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(job.postedAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-2">
                                        {job.status === 'ACTIVE' && (
                                            <button 
                                                onClick={() => handleCloseJob(job.id)}
                                                className="text-orange-600 hover:text-orange-900 bg-orange-50 hover:bg-orange-100 p-2 rounded-md transition"
                                                title="Encerrar Vaga"
                                            >
                                                <Ban size={16} />
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => handleDeleteJob(job.id)}
                                            className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-2 rounded-md transition"
                                            title="Excluir Vaga"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}
      </div>
    );
  }

  return <div>Role unknown</div>;
};