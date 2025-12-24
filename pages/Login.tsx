import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { useNavigate, Link } from 'react-router-dom';
import { Briefcase, Lock, Mail, Loader2 } from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(email, password);
      // Navigation happens in AuthContext via auth state change or manually here if needed
      // But typically AuthContext updates user, and layout/protected routes handle it.
      // We will redirect to dashboard/home based on role check in a useEffect or simple navigation here
      navigate('/dashboard'); 
    } catch (err: any) {
      console.error(err);
      setError('Falha no login. Verifique suas credenciais.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="flex justify-center mb-6">
             <div className="bg-blue-600 p-3 rounded-xl">
                <Briefcase className="text-white h-8 w-8" />
            </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Bem-vindo de volta</h2>
        <p className="text-center text-gray-500 mb-8">Acesse sua conta para continuar</p>
        
        {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm text-center border border-red-100">
                {error}
            </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                    <input 
                        type="email" 
                        required
                        className="w-full bg-white text-gray-900 border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2.5 pl-10 border"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <Mail size={18} className="absolute left-3 top-3 text-gray-400" />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                <div className="relative">
                    <input 
                        type="password" 
                        required
                        className="w-full bg-white text-gray-900 border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2.5 pl-10 border"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Lock size={18} className="absolute left-3 top-3 text-gray-400" />
                </div>
            </div>

            <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-lg shadow-blue-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : 'Entrar'}
            </button>
        </form>

        <div className="mt-6 text-center text-sm">
            <span className="text-gray-500">Não tem uma conta? </span>
            <Link to="/register" className="text-blue-600 font-semibold hover:underline">
                Cadastre-se
            </Link>
        </div>
      </div>
    </div>
  );
};