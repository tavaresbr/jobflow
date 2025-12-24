import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase, getMaskedUrl } from '../services/supabase';
import { Lock, Bell, Shield, Trash2, CheckCircle, AlertTriangle, Loader2, Save, Database, Copy, Download, FileJson, RefreshCw, Wifi, WifiOff, Globe, Server, Activity } from 'lucide-react';

// Script SQL completo para recriar o banco caso necessário
const SETUP_SCRIPT = `-- ==============================================================================
-- SCRIPT DE SETUP - JOBFLOW SAAS
-- Execute este script no SQL Editor do Supabase para criar a estrutura do banco.
-- ==============================================================================

-- 1. Criação de Enums (Tipos Personalizados)
-- O bloco DO verifica se o tipo já existe para evitar erros ao rodar novamente.
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('CANDIDATE', 'COMPANY', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE job_type AS ENUM ('CLT', 'PJ', 'Freelancer', 'Estágio');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE work_model AS ENUM ('Presencial', 'Remoto', 'Híbrido');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE job_area AS ENUM ('Tecnologia', 'Marketing', 'Design', 'Vendas', 'Financeiro', 'Recursos Humanos', 'Saúde', 'Educação', 'Operações', 'Outros');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE application_status AS ENUM ('Enviado', 'Em análise', 'Aprovado', 'Rejeitado');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE job_status_type AS ENUM ('ACTIVE', 'PAUSED', 'CLOSED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Tabela Profiles (Extensão da tabela auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'CANDIDATE',
  name TEXT NOT NULL,
  avatar TEXT,
  location TEXT,
  
  -- Campos Empresa
  company_name TEXT,
  company_area job_area,
  company_website TEXT,
  company_logo TEXT,
  company_description TEXT,

  -- Campos Candidato
  resume_url TEXT,
  resume_name TEXT,
  skills TEXT[],
  experience TEXT,
  education TEXT,
  area_of_interest job_area,
  availability job_type,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabela Jobs (Vagas)
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT[] DEFAULT '{}',
  location TEXT NOT NULL,
  address JSONB,
  type job_type NOT NULL,
  model work_model NOT NULL,
  area job_area NOT NULL,
  salary_min NUMERIC,
  salary_max NUMERIC,
  status job_status_type DEFAULT 'ACTIVE',
  posted_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Tabela Applications (Candidaturas)
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status application_status DEFAULT 'Enviado',
  applied_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(job_id, candidate_id)
);

-- 5. Segurança (Row Level Security - RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Remove policies antigas para evitar conflitos ao re-rodar o script
DROP POLICY IF EXISTS "Profiles são visíveis publicamente" ON public.profiles;
DROP POLICY IF EXISTS "Usuários editam próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Usuários inserem próprio perfil" ON public.profiles;

DROP POLICY IF EXISTS "Vagas visíveis publicamente" ON public.jobs;
DROP POLICY IF EXISTS "Empresas criam vagas" ON public.jobs;
DROP POLICY IF EXISTS "Empresas editam suas vagas" ON public.jobs;
DROP POLICY IF EXISTS "Empresas deletam suas vagas" ON public.jobs;

DROP POLICY IF EXISTS "Candidatos veem suas aplicações" ON public.applications;
DROP POLICY IF EXISTS "Empresas veem aplicações de suas vagas" ON public.applications;
DROP POLICY IF EXISTS "Candidatos aplicam" ON public.applications;

-- Recria Policies
-- Profiles
CREATE POLICY "Profiles são visíveis publicamente" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Usuários editam próprio perfil" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Usuários inserem próprio perfil" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Jobs
CREATE POLICY "Vagas visíveis publicamente" ON public.jobs FOR SELECT USING (status = 'ACTIVE' OR auth.uid() = company_id);
CREATE POLICY "Empresas criam vagas" ON public.jobs FOR INSERT WITH CHECK (auth.uid() = company_id);
CREATE POLICY "Empresas editam suas vagas" ON public.jobs FOR UPDATE USING (auth.uid() = company_id);
CREATE POLICY "Empresas deletam suas vagas" ON public.jobs FOR DELETE USING (auth.uid() = company_id);

-- Applications
CREATE POLICY "Candidatos veem suas aplicações" ON public.applications FOR SELECT USING (auth.uid() = candidate_id);
CREATE POLICY "Empresas veem aplicações de suas vagas" ON public.applications FOR SELECT USING (EXISTS (SELECT 1 FROM public.jobs WHERE jobs.id = applications.job_id AND jobs.company_id = auth.uid()));
CREATE POLICY "Candidatos aplicam" ON public.applications FOR INSERT WITH CHECK (auth.uid() = candidate_id);

-- 6. Trigger para atualizar 'updated_at' automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
`;

export const Settings = () => {
  const { user, isDemoMode, isSetupRequired, dbStatusMessage, connectionLatency, checkConnection } = useAuth();
  const [activeSection, setActiveSection] = useState<'security' | 'notifications' | 'database'>('security');
  
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copyFeedback, setCopyFeedback] = useState('');
  const [checkingDb, setCheckingDb] = useState(false);

  // Password State
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  // Notifications State (Mock)
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    applicationUpdates: true,
    marketing: false
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (passwords.newPassword.length < 6) {
        setErrorMsg('A senha deve ter pelo menos 6 caracteres.');
        return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
        setErrorMsg('As senhas não coincidem.');
        return;
    }

    setLoading(true);

    try {
        const { error } = await supabase.auth.updateUser({
            password: passwords.newPassword
        });

        if (error) throw error;

        setSuccessMsg('Senha atualizada com sucesso!');
        setPasswords({ newPassword: '', confirmPassword: '' });
    } catch (error: any) {
        setErrorMsg(error.message || 'Erro ao atualizar senha.');
    } finally {
        setLoading(false);
    }
  };

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Funções para a aba de Banco de Dados
  const handleCopyScript = () => {
    navigator.clipboard.writeText(SETUP_SCRIPT);
    setCopyFeedback('Copiado!');
    setTimeout(() => setCopyFeedback(''), 2000);
  };

  const handleDownloadScript = () => {
    const element = document.createElement("a");
    const file = new Blob([SETUP_SCRIPT], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "supabase_setup.sql";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleTestConnection = async () => {
    setCheckingDb(true);
    await checkConnection();
    setTimeout(() => setCheckingDb(false), 500);
  };

  const getLatencyColor = (latency: number | null) => {
      if (latency === null) return 'text-gray-400';
      if (latency < 200) return 'text-green-600';
      if (latency < 500) return 'text-yellow-600';
      return 'text-red-600';
  };

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Configurações da Conta</h1>
        <p className="text-gray-500">Gerencie sua segurança, preferências e sistema.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar de Navegação */}
        <div className="md:col-span-1 space-y-2">
            <button 
                onClick={() => setActiveSection('security')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-left transition ${activeSection === 'security' ? 'bg-white border border-gray-200 text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
            >
                <Shield size={20} /> Segurança
            </button>
            <button 
                onClick={() => setActiveSection('notifications')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-left transition ${activeSection === 'notifications' ? 'bg-white border border-gray-200 text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
            >
                <Bell size={20} /> Notificações
            </button>
            <button 
                onClick={() => setActiveSection('database')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-left transition ${activeSection === 'database' ? 'bg-white border border-gray-200 text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
            >
                <Database size={20} /> Banco de Dados
            </button>
        </div>

        {/* Conteúdo Principal */}
        <div className="md:col-span-2 space-y-6">
            
            {/* Sessão de Segurança */}
            {activeSection === 'security' && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Lock className="text-blue-600" size={24} /> Alterar Senha
                    </h2>

                    {successMsg && (
                        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg flex items-center gap-2 text-sm">
                            <CheckCircle size={16} /> {successMsg}
                        </div>
                    )}

                    {errorMsg && (
                        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 text-sm">
                            <AlertTriangle size={16} /> {errorMsg}
                        </div>
                    )}

                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nova Senha</label>
                            <input 
                                type="password"
                                required
                                className="w-full bg-white text-gray-900 border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2.5 border"
                                value={passwords.newPassword}
                                onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Nova Senha</label>
                            <input 
                                type="password"
                                required
                                className="w-full bg-white text-gray-900 border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2.5 border"
                                value={passwords.confirmPassword}
                                onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                            />
                        </div>
                        <div className="flex justify-end pt-2">
                            <button 
                                type="submit"
                                disabled={loading}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-70"
                            >
                                {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                Atualizar Senha
                            </button>
                        </div>
                    </form>
                    
                    {/* Zona de Perigo */}
                    <div className="mt-8 pt-8 border-t border-gray-100">
                        <div className="bg-red-50 p-6 rounded-xl border border-red-100">
                            <h2 className="text-xl font-bold text-red-700 mb-2 flex items-center gap-2">
                                <AlertTriangle size={24} /> Zona de Perigo
                            </h2>
                            <p className="text-red-600 text-sm mb-4">
                                A exclusão da sua conta é uma ação irreversível. Todos os seus dados serão perdidos.
                            </p>
                            <button 
                                onClick={() => alert('Funcionalidade indisponível na versão demo.')}
                                className="bg-white border border-red-200 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-50 transition flex items-center gap-2"
                            >
                                <Trash2 size={16} /> Excluir Minha Conta
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sessão de Notificações */}
            {activeSection === 'notifications' && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Bell className="text-purple-600" size={24} /> Preferências de Notificação
                    </h2>
                    
                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                            <div>
                                <p className="font-medium text-gray-900">Alertas de Vagas</p>
                                <p className="text-sm text-gray-500">Receba e-mails sobre vagas compatíveis com seu perfil.</p>
                            </div>
                            <button 
                                onClick={() => toggleNotification('emailAlerts')}
                                className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${notifications.emailAlerts ? 'bg-blue-600' : 'bg-gray-200'}`}
                            >
                                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${notifications.emailAlerts ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </button>
                        </div>

                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                            <div>
                                <p className="font-medium text-gray-900">Atualizações de Candidatura</p>
                                <p className="text-sm text-gray-500">Seja notificado quando o status da sua candidatura mudar.</p>
                            </div>
                            <button 
                                onClick={() => toggleNotification('applicationUpdates')}
                                className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${notifications.applicationUpdates ? 'bg-blue-600' : 'bg-gray-200'}`}
                            >
                                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${notifications.applicationUpdates ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </button>
                        </div>

                        <div className="flex items-center justify-between py-2">
                            <div>
                                <p className="font-medium text-gray-900">Marketing e Novidades</p>
                                <p className="text-sm text-gray-500">Receba notícias sobre novas funcionalidades do JobFlow.</p>
                            </div>
                            <button 
                                onClick={() => toggleNotification('marketing')}
                                className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${notifications.marketing ? 'bg-blue-600' : 'bg-gray-200'}`}
                            >
                                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${notifications.marketing ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sessão de Banco de Dados (Setup Script) */}
            {activeSection === 'database' && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Database className="text-green-600" size={24} /> Banco de Dados
                        </h2>
                        <button 
                            onClick={handleTestConnection}
                            disabled={checkingDb}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                                isDemoMode && !isSetupRequired
                                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                        >
                            {checkingDb ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                            {checkingDb ? 'Testando...' : 'Verificar Conexão'}
                        </button>
                    </div>

                    <div className={`mb-6 p-4 rounded-lg border flex items-start gap-3 ${
                        isSetupRequired 
                            ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
                            : isDemoMode 
                                ? 'bg-gray-50 border-gray-200 text-gray-700' 
                                : 'bg-green-50 border-green-200 text-green-800'
                    }`}>
                        {isSetupRequired ? <AlertTriangle className="shrink-0 mt-0.5" /> : isDemoMode ? <WifiOff className="shrink-0 mt-0.5" /> : <Wifi className="shrink-0 mt-0.5" />}
                        <div>
                            <p className="font-bold">
                                {isSetupRequired 
                                    ? 'Conexão Estabelecida - Setup Necessário' 
                                    : isDemoMode 
                                        ? 'Desconectado / Modo Mock' 
                                        : 'Conectado ao Supabase'}
                            </p>
                            <p className="text-sm mt-1">{dbStatusMessage}</p>
                        </div>
                    </div>

                    {/* Painel de Diagnóstico */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <p className="text-xs text-gray-500 uppercase font-semibold flex items-center gap-1 mb-1">
                                <Activity size={12} /> Latência
                            </p>
                            <p className={`font-mono font-medium ${getLatencyColor(connectionLatency)}`}>
                                {connectionLatency !== null ? `${connectionLatency} ms` : '...'}
                            </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                             <p className="text-xs text-gray-500 uppercase font-semibold flex items-center gap-1 mb-1">
                                <Globe size={12} /> Host
                            </p>
                            <p className="font-mono text-gray-700 font-medium truncate" title="URL do Projeto Supabase">
                                {getMaskedUrl()}
                            </p>
                        </div>
                    </div>

                    {(isDemoMode || isSetupRequired) && (
                        <>
                            <p className="text-gray-500 text-sm mb-4">
                                {isSetupRequired 
                                    ? 'O banco de dados respondeu, mas as tabelas necessárias não foram encontradas. Execute o script abaixo no SQL Editor do Supabase.' 
                                    : 'O app está usando dados falsos. Para conectar, configure as variáveis de ambiente.'}
                            </p>

                            <div className="relative mb-4">
                                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs font-mono h-64 border border-gray-700">
                                    {SETUP_SCRIPT}
                                </pre>
                                <div className="absolute top-2 right-2 flex gap-2">
                                    <button 
                                        onClick={handleCopyScript}
                                        className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1 transition"
                                    >
                                        {copyFeedback ? <CheckCircle size={12} /> : <Copy size={12} />}
                                        {copyFeedback || 'Copiar'}
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-blue-50 p-4 rounded-lg border border-blue-100">
                                <div className="flex items-center gap-3">
                                    <FileJson className="text-blue-600" size={24} />
                                    <div>
                                        <p className="font-medium text-blue-900 text-sm">Salvar Script Localmente</p>
                                        <p className="text-blue-700 text-xs">Baixe o arquivo .sql para usar depois.</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={handleDownloadScript}
                                    className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-sm text-sm"
                                >
                                    <Download size={16} /> Baixar supabase_setup.sql
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}

        </div>
      </div>
    </div>
  );
};