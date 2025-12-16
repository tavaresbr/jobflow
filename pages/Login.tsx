import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { useNavigate } from 'react-router-dom';
import { Briefcase } from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (role: UserRole) => {
    login(role);
    navigate(role === UserRole.COMPANY || role === UserRole.ADMIN ? '/dashboard' : '/');
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="flex justify-center mb-6">
             <div className="bg-blue-600 p-3 rounded-xl">
                <Briefcase className="text-white h-8 w-8" />
            </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Bem-vindo de volta</h2>
        <p className="text-center text-gray-500 mb-8">Selecione como deseja entrar (Simulação)</p>
        
        <div className="space-y-4">
          <button 
            onClick={() => handleLogin(UserRole.CANDIDATE)}
            className="w-full bg-white border-2 border-gray-200 text-gray-700 font-semibold py-4 rounded-xl hover:border-blue-500 hover:text-blue-600 transition flex items-center justify-center gap-3"
          >
            Sou Candidato
          </button>
          
          <button 
            onClick={() => handleLogin(UserRole.COMPANY)}
             className="w-full bg-white border-2 border-gray-200 text-gray-700 font-semibold py-4 rounded-xl hover:border-purple-500 hover:text-purple-600 transition flex items-center justify-center gap-3"
          >
            Sou Empresa
          </button>

          <button 
            onClick={() => handleLogin(UserRole.ADMIN)}
             className="w-full bg-gray-50 text-gray-400 text-sm py-2 rounded hover:text-gray-600"
          >
            Acesso Admin
          </button>
        </div>
      </div>
    </div>
  );
};