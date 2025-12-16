import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { Briefcase, User, Building2, LogOut, ShieldCheck, Menu, X, FileText, UserCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const Layout = ({ children }: { children?: React.ReactNode }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

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
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <div className="bg-blue-600 p-1.5 rounded-lg">
                  <Briefcase className="text-white h-6 w-6" />
                </div>
                <span className="text-xl font-bold text-gray-900 tracking-tight">JobFlow</span>
              </Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-4">
              <NavLink to="/" label="Vagas" />
              
              {isAuthenticated ? (
                <>
                  <NavLink to="/dashboard" label="Dashboard" icon={user?.role === UserRole.COMPANY ? Building2 : user?.role === UserRole.ADMIN ? ShieldCheck : User} />
                  
                  {user?.role === UserRole.CANDIDATE && (
                    <NavLink to="/my-applications" label="Candidaturas" icon={FileText} />
                  )}

                  {/* Profile Link for both Candidates and Companies */}
                  {(user?.role === UserRole.CANDIDATE || user?.role === UserRole.COMPANY) && (
                      <NavLink to="/profile" label={user?.role === UserRole.COMPANY ? "Perfil da Empresa" : "Meu Perfil"} icon={UserCircle} />
                  )}

                  {user?.role === UserRole.COMPANY && (
                    <Link to="/post-job" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition font-medium text-sm">
                      Anunciar Vaga
                    </Link>
                  )}
                  <div className="h-6 w-px bg-gray-300 mx-2"></div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                    <button 
                      onClick={handleLogout}
                      className="text-gray-500 hover:text-red-600 transition-colors"
                      title="Sair"
                    >
                      <LogOut size={20} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                   <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium px-4 py-2">
                    Entrar
                  </Link>
                  <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition font-medium text-sm">
                    Cadastrar
                  </Link>
                </div>
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
                <Link to="/" className="block py-2 text-gray-700">Vagas</Link>
                {isAuthenticated ? (
                    <>
                         <Link to="/dashboard" className="block py-2 text-gray-700">Dashboard</Link>
                         {user?.role === UserRole.CANDIDATE && (
                            <Link to="/my-applications" className="block py-2 text-gray-700">Minhas Candidaturas</Link>
                         )}
                         
                         {(user?.role === UserRole.CANDIDATE || user?.role === UserRole.COMPANY) && (
                            <Link to="/profile" className="block py-2 text-gray-700">
                                {user?.role === UserRole.COMPANY ? "Perfil da Empresa" : "Meu Perfil"}
                            </Link>
                         )}

                         {user?.role === UserRole.COMPANY && (
                             <Link to="/post-job" className="block py-2 text-blue-600 font-medium">Anunciar Vaga</Link>
                         )}
                         <button onClick={handleLogout} className="block w-full text-left py-2 text-red-600">Sair</button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="block py-2 text-gray-700">Entrar</Link>
                        <Link to="/register" className="block py-2 text-blue-600 font-bold">Cadastrar</Link>
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