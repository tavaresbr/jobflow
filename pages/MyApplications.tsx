import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ApplicationStatus, UserRole } from '../types';
import { MOCK_APPLICATIONS } from '../services/mockData';
import { Link, Navigate } from 'react-router-dom';
import { FileText, Building2, Calendar, ArrowRight, Clock, CheckCircle, XCircle, AlertCircle, Search } from 'lucide-react';

export const MyApplications = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" />;
  if (user.role !== UserRole.CANDIDATE) return <Navigate to="/dashboard" />;

  const myApplications = MOCK_APPLICATIONS.filter(app => app.candidateId === user.id);

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.APPROVED: return 'bg-green-100 text-green-800 border-green-200';
      case ApplicationStatus.REJECTED: return 'bg-red-50 text-red-800 border-red-200';
      case ApplicationStatus.REVIEWING: return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      default: return 'bg-blue-50 text-blue-800 border-blue-200';
    }
  };

  const getStatusIcon = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.APPROVED: return <CheckCircle size={16} />;
      case ApplicationStatus.REJECTED: return <XCircle size={16} />;
      case ApplicationStatus.REVIEWING: return <Clock size={16} />;
      default: return <FileText size={16} />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Minhas Candidaturas</h1>
          <p className="text-gray-500">Acompanhe o status dos processos seletivos.</p>
        </div>
        <Link to="/" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm font-medium">
            <Search size={18} /> Buscar Novas Vagas
        </Link>
      </div>

      {/* Applications List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {myApplications.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {myApplications.map(app => (
              <div key={app.id} className="p-6 hover:bg-gray-50 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 font-bold text-lg shrink-0">
                    {app.companyName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{app.jobTitle}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mt-1">
                        <span className="flex items-center gap-1"><Building2 size={14} /> {app.companyName}</span>
                        <span className="hidden md:inline">•</span>
                        <span className="flex items-center gap-1"><Calendar size={14} /> Aplicado em {new Date(app.appliedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 pl-16 md:pl-0">
                   <div className={`px-3 py-1.5 rounded-full text-sm font-medium border flex items-center gap-2 ${getStatusColor(app.status)}`}>
                      {getStatusIcon(app.status)}
                      {app.status}
                   </div>
                   <Link 
                    to={`/job/${app.jobId}`}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition"
                    title="Ver Detalhes da Vaga"
                   >
                     <ArrowRight size={20} />
                   </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="bg-gray-50 p-4 rounded-full mb-4">
                <AlertCircle className="text-gray-400 w-12 h-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Nenhuma candidatura encontrada</h3>
            <p className="text-gray-500 max-w-sm mt-2 mb-6">Você ainda não se candidatou a nenhuma vaga. Explore as oportunidades disponíveis e dê o próximo passo na sua carreira.</p>
            <Link to="/" className="text-blue-600 font-semibold hover:underline">
                Explorar Vagas
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};