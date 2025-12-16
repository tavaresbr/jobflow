import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_JOBS } from '../services/mockData';
import { useAuth } from '../context/AuthContext';
import { Building2, MapPin, Wallet, Calendar, CheckCircle, Share2, AlertCircle } from 'lucide-react';
import { UserRole } from '../types';
import { analyzeCandidateMatch } from '../services/geminiService';

export const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const job = MOCK_JOBS.find(j => j.id === id);
  const [hasApplied, setHasApplied] = useState(false);
  const [aiMatch, setAiMatch] = useState<{score: number, reason: string} | null>(null);

  useEffect(() => {
    // Simulate checking if applied and calculating match
    if (user?.role === UserRole.CANDIDATE && job) {
        // Mock async call to AI service
        analyzeCandidateMatch(user.skills || [], job.requirements)
            .then(setAiMatch);
    }
  }, [user, job]);

  if (!job) return <div className="text-center py-20">Vaga não encontrada</div>;

  const handleApply = () => {
    if (!isAuthenticated) {
        navigate('/login');
        return;
    }
    setHasApplied(true);
  };

  const formatSalary = (min?: number, max?: number) => {
    if (min && max) return `R$ ${min.toLocaleString('pt-BR')} - ${max.toLocaleString('pt-BR')}`;
    if (min) return `A partir de R$ ${min.toLocaleString('pt-BR')}`;
    if (max) return `Até R$ ${max.toLocaleString('pt-BR')}`;
    return 'Salário a combinar';
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 p-8 border-b border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex gap-4 items-center">
                    <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center text-2xl font-bold text-gray-600">
                        {job.companyName.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
                        <p className="text-gray-500 font-medium flex items-center gap-1">
                            <Building2 size={16} /> {job.companyName}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition" title="Compartilhar">
                        <Share2 size={20} />
                    </button>
                </div>
            </div>

            <div className="flex flex-wrap gap-4 mt-6">
                 <span className="flex items-center gap-2 text-gray-700 bg-white px-3 py-1.5 rounded-lg border border-gray-200 text-sm shadow-sm">
                    <MapPin size={16} className="text-blue-500" /> {job.location} ({job.model})
                </span>
                <span className="flex items-center gap-2 text-gray-700 bg-white px-3 py-1.5 rounded-lg border border-gray-200 text-sm shadow-sm">
                    <Wallet size={16} className="text-green-500" /> {formatSalary(job.salaryMin, job.salaryMax)}
                </span>
                 <span className="flex items-center gap-2 text-gray-700 bg-white px-3 py-1.5 rounded-lg border border-gray-200 text-sm shadow-sm">
                    <Calendar size={16} className="text-purple-500" /> {job.type}
                </span>
            </div>

            {job.address && job.address.cep && (
                <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200 text-sm text-gray-600">
                    <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                        <MapPin size={14} className="text-gray-400" /> Endereço Completo:
                    </h3>
                    <p>{job.address.street}, {job.address.number} {job.address.complement && `- ${job.address.complement}`}</p>
                    <p className="text-gray-500 mt-1">CEP: {job.address.cep}</p>
                </div>
            )}
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
                {/* AI Insight for Candidates */}
                {user?.role === UserRole.CANDIDATE && aiMatch && (
                    <div className={`p-4 rounded-lg border ${aiMatch.score > 70 ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                        <h3 className="font-semibold flex items-center gap-2 mb-1">
                            <span className="text-xs font-black bg-gradient-to-r from-blue-500 to-purple-500 text-white px-2 rounded">IA</span>
                            Match de Compatibilidade: {aiMatch.score}%
                        </h3>
                        <p className="text-sm text-gray-700">{aiMatch.reason}</p>
                    </div>
                )}

                <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Descrição da Vaga</h2>
                    <p className="text-gray-600 leading-relaxed whitespace-pre-line">{job.description}</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Requisitos</h2>
                    <ul className="space-y-2">
                        {job.requirements.map((req, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-gray-600">
                                <div className="mt-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                </div>
                                {req}
                            </li>
                        ))}
                    </ul>
                </section>
            </div>

            <div className="md:col-span-1">
                <div className="bg-white p-6 rounded-xl border border-gray-200 sticky top-24 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4">Interessado?</h3>
                    
                    {user?.role === UserRole.COMPANY ? (
                         <div className="p-3 bg-blue-50 text-blue-800 text-sm rounded-lg flex gap-2">
                            <AlertCircle size={18} className="shrink-0" />
                            <span>Você está visualizando como empresa.</span>
                         </div>
                    ) : (
                        <>
                             {!hasApplied ? (
                                <button 
                                    onClick={handleApply}
                                    className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200 mb-4"
                                >
                                    Candidatar-se Agora
                                </button>
                            ) : (
                                <div className="w-full bg-green-100 text-green-800 font-bold py-3 rounded-lg flex items-center justify-center gap-2 mb-4">
                                    <CheckCircle size={20} />
                                    Candidatura Enviada
                                </div>
                            )}
                            <p className="text-xs text-gray-400 text-center">
                                Ao se candidatar, você concorda com nossos termos de uso.
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};