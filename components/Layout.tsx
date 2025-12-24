import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { Briefcase, User, Building2, ShieldCheck, Menu, X, FileText, UserCircle, Settings, RefreshCw, Wifi, WifiOff, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const Layout = ({ children }: { children?: React.ReactNode }) => {
  const { user, isAuthenticated, switchUserRole, isDemoMode, isSetupRequired, dbStatusMessage } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const NavLink = ({ to, label, icon: Icon }: any) => (
    <Link 
      to={to} 
      className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors px-3 py-2 rounded-md hover:bg-blue-50"
    >
      {Icon && <Icon size={18} />}
      <span>{label}</span>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Setup Required Banner */}
        {isSetupRequired && (
            <div className="bg-yellow-600 text-white px-4 py-2 text-sm text-center">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2">
                    <span className="flex items-center gap-2 font-medium">
                        <AlertTriangle size={16} /> 
                        Conexão com Supabase estabelecida, mas as tabelas não foram encontradas.
                    </span>
                    <Link to="/settings" className="underline font-bold hover:text-yellow-100 flex items-center gap-1">
                        Configurar Banco de Dados <ArrowRight size={14} />
                    </Link>
                </div>
            </div>
        )}

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center space-x-2">
                <div className="bg-blue-600 p-1.5 rounded-lg">
                  <Briefcase className="text-white h-6 w-6" />
                </div>
                <span className="text-xl font-bold text-gray-900 tracking-tight">JobFlow</span>
              </Link>
              
              {/* Status Indicator Badge */}
              <Link to="/settings"
                className={`hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border hover:opacity-80 transition cursor-pointer ${
                    isSetupRequired 
                        ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                        : isDemoMode 
                            ? 'bg-gray-100 text-gray-600 border-gray-200' 
                            : 'bg-green-50 text-green-700 border-green-200'
                }`}
                title={`${dbStatusMessage} - Clique para ver detalhes`}
              >
                {isSetupRequired ? <AlertTriangle size={12} /> : isDemoMode ? <WifiOff size={12} /> : <Wifi size={12} />}
                {isSetupRequired ? 'Requer Configuração' : isDemoMode ? 'Modo Demo' : 'Online'}
              </Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-4">
              <NavLink to="/" label="Vagas" />
              
              {isAuthenticated && (
                <>
                  <NavLink 
                    to="/dashboard" 
                    label={user?.role === UserRole.ADMIN ? "Painel Admin" : "Dashboard"} 
                    icon={user?.role === UserRole.COMPANY ? Building2 : user?.role === UserRole.ADMIN ? ShieldCheck : User} 
                  />
                  
                  {user?.role === UserRole.CANDIDATE && (
                    <NavLink to="/my-applications" label="Candidaturas" icon={FileText} />
                  )}

                  {(user?.role === UserRole.CANDIDATE || user?.role === UserRole.COMPANY) && (
                      <NavLink to="/profile" label={user?.role === UserRole.COMPANY ? "Perfil da Empresa" : "Meu Perfil"} icon={UserCircle} />
                  )}

                  <NavLink to="/settings" label="Configurações" icon={Settings} />

                  {user?.role === UserRole.COMPANY && (
                    <Link to="/post-job" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition font-medium text-sm">
                      Anunciar Vaga
                    </Link>
                  )}
                  <div className="h-6 w-px bg-gray-300 mx-2"></div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                    
                    <button 
                      onClick={switchUserRole}
                      className="flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded hover:bg-gray-200 transition"
                      title="Alternar entre Candidato e Empresa"
                    >
                      <RefreshCw size={12} />
                      {user?.role === UserRole.CANDIDATE ? 'Ver como Empresa' : 'Ver como Candidato'}
                    </button>
                  </div>
                </>
              )}
            </div>

             {/* Mobile Menu Button */}
             <div className="md:hidden flex items-center">
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600">
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
            <div className="md:hidden bg-white border-t border-gray-100 py-2 px-4 space-y-2 shadow-lg">
                <Link to="/settings" className={`px-2 py-1 rounded text-xs font-semibold inline-flex items-center gap-2 mb-2 w-full justify-center border ${isSetupRequired ? 'bg-yellow-100 text-yellow-800' : isDemoMode ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'}`}>
                    Status: {isSetupRequired ? 'Configuração Pendente' : isDemoMode ? 'Modo Demo' : 'Online'}
                </Link>
                <Link to="/" className="block py-2 text-gray-700">Vagas</Link>
                {isAuthenticated && (
                    <>
                         <Link to="/dashboard" className="block py-2 text-gray-700">
                            {user?.role === UserRole.ADMIN ? "Painel Admin" : "Dashboard"}
                         </Link>
                         {user?.role === UserRole.CANDIDATE && (
                            <Link to="/my-applications" className="block py-2 text-gray-700">Minhas Candidaturas</Link>
                         )}
                         
                         {(user?.role === UserRole.CANDIDATE || user?.role === UserRole.COMPANY) && (
                            <Link to="/profile" className="block py-2 text-gray-700">
                                {user?.role === UserRole.COMPANY ? "Perfil da Empresa" : "Meu Perfil"}
                            </Link>
                         )}

                         <Link to="/settings" className="block py-2 text-gray-700">Configurações</Link>

                         {user?.role === UserRole.COMPANY && (
                             <Link to="/post-job" className="block py-2 text-blue-600 font-medium">Anunciar Vaga</Link>
                         )}
                         
                         <button onClick={switchUserRole} className="block w-full text-left py-2 text-purple-600 font-medium border-t border-gray-100 mt-2">
                            Alternar Perfil ({user?.role === UserRole.CANDIDATE ? 'Ir p/ Empresa' : 'Ir p/ Candidato'})
                         </button>
                    </>
                )}
            </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
               <div className="flex items-center space-x-2 mb-4">
                  <div className="bg-blue-600 p-1 rounded">
                    <Briefcase className="text-white h-4 w-4" />
                  </div>
                  <span className="text-lg font-bold text-gray-900">JobFlow</span>
                </div>
                <p className="text-gray-500 text-sm">
                    A plataforma líder em conectar talentos a oportunidades.
                </p>
            </div>
            <div>
                <h4 className="font-semibold text-gray-900 mb-3">Plataforma</h4>
                <ul className="space-y-2 text-sm text-gray-500">
                    <li><Link to="/candidates" className="hover:text-blue-600">Para Candidatos</Link></li>
                    <li><Link to="/companies" className="hover:text-blue-600">Para Empresas</Link></li>
                    <li><Link to="/pricing" className="hover:text-blue-600">Planos e Preços</Link></li>
                </ul>
            </div>
            <div>
                <h4 className="font-semibold text-gray-900 mb-3">Legal</h4>
                <ul className="space-y-2 text-sm text-gray-500">
                    <li><Link to="/terms" className="hover:text-blue-600">Termos de Uso</Link></li>
                    <li><Link to="/privacy" className="hover:text-blue-600">Privacidade</Link></li>
                </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-100 text-center text-sm text-gray-400">
            &copy; 2024 JobFlow SaaS. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};