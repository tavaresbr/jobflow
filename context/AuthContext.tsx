import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { supabase, testConnection, mapProfileToUser } from '../services/supabase';
import { MOCK_USERS } from '../services/mockData';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isDemoMode: boolean; // Indica se estamos usando dados mockados
  isSetupRequired: boolean; // Indica se conectou mas faltam tabelas
  dbStatusMessage: string;
  connectionLatency: number | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, metadata: any) => Promise<void>;
  updateUser: (updatedUser: User) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  switchUserRole: () => void;
  checkConnection: () => Promise<void>; // Permite re-testar conexão manualmente
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children?: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [isSetupRequired, setIsSetupRequired] = useState(false);
  const [dbStatusMessage, setDbStatusMessage] = useState('Verificando conexão...');
  const [connectionLatency, setConnectionLatency] = useState<number | null>(null);

  // Verifica conexão e restaura sessão
  useEffect(() => {
    const initAuth = async () => {
        setLoading(true);
        // 1. Testa a conexão com o banco
        const { success, isSetupRequired: setupNeeded, message, latency } = await testConnection();
        setIsDemoMode(!success);
        setIsSetupRequired(setupNeeded);
        setDbStatusMessage(message);
        setConnectionLatency(latency);

        if (success) {
            // Modo Real: Verifica sessão ativa
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                await fetchProfile(session.user.id, session.user.email);
            } else {
                setUser(null);
            }
        } else {
            // Modo Demo ou Setup Required: Carrega usuário mockado padrão para não quebrar a UI
            console.warn("Modo Demo Ativado:", message);
            setUser(MOCK_USERS[0]);
        }
        setLoading(false);
    };

    initAuth();

    // Listener para mudanças de auth (login/logout em outras abas ou pelo client)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_OUT') {
            if (!isDemoMode) setUser(null);
        } else if (session?.user && !isDemoMode) {
             await fetchProfile(session.user.id, session.user.email);
        }
    });

    return () => subscription.unsubscribe();
  }, []); // Dependência vazia para rodar apenas no mount

  // Função auxiliar para recarregar conexão manualmente (usado em Settings)
  const checkConnection = async () => {
    setLoading(true);
    const result = await testConnection();
    setIsDemoMode(!result.success);
    setIsSetupRequired(result.isSetupRequired);
    setDbStatusMessage(result.message);
    setConnectionLatency(result.latency);
    
    if (result.success) {
        // Se conectou agora, tenta pegar a sessão
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            await fetchProfile(session.user.id, session.user.email);
        } else {
            setUser(null);
        }
    } else {
        // Voltou para demo, reseta para mock
        setUser(MOCK_USERS[0]);
    }
    setLoading(false);
  };

  const fetchProfile = async (userId: string, email?: string) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        
        if (error) {
            console.error("Erro ao buscar perfil:", error);
            // Se o perfil não existe mas o user auth existe (banco inconsistente), cria objeto temporário
            setUser({ 
                id: userId, 
                email: email || '', 
                name: email?.split('@')[0] || 'Usuário', 
                role: UserRole.CANDIDATE 
            });
            return;
        }

        if (data) {
            setUser(mapProfileToUser(data, email));
        }
    } catch (err) {
        console.error("Exceção ao buscar perfil:", err);
    }
  };

  const login = async (email: string, password: string) => {
    if (isDemoMode) {
        console.log("Modo Demo: Login simulado para:", email);
        const mockUser = MOCK_USERS.find(u => u.email === email) || MOCK_USERS[0];
        setUser(mockUser);
        return;
    }

    // Login Real
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    
    if (data.user) {
        await fetchProfile(data.user.id, data.user.email);
    }
  };

  const register = async (email: string, password: string, metadata: any) => {
    if (isDemoMode) {
        console.log("Modo Demo: Registro simulado");
        setUser({
            id: 'new-user-' + Date.now(),
            email,
            name: metadata.name,
            role: metadata.role,
            ...metadata
        } as User);
        return;
    }

    // Registro Real
    // 1. Cria usuário no Auth
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { 
                name: metadata.name,
                role: metadata.role 
            }
        }
    });

    if (error) throw error;

    if (data.user) {
        // 2. Insere na tabela profiles
        // (Nota: Em produção, isso idealmente é feito via Trigger no DB, mas aqui faremos manual para garantir)
        const profileData = {
            id: data.user.id,
            email: email,
            role: metadata.role,
            name: metadata.name,
            avatar: metadata.avatar,
            location: metadata.location,
            
            // Campos específicos
            company_name: metadata.companyName,
            company_area: metadata.companyArea,
            company_website: metadata.companyWebsite,
            company_logo: metadata.companyLogo,
            company_description: metadata.companyDescription,
            
            resume_url: metadata.resumeUrl,
            resume_name: metadata.resumeName,
            skills: metadata.skills,
            experience: metadata.experience,
            education: metadata.education,
            area_of_interest: metadata.areaOfInterest,
            availability: metadata.availability
        };

        const { error: profileError } = await supabase
            .from('profiles')
            .insert(profileData);

        if (profileError) {
            console.error("Erro ao criar perfil:", profileError);
            // Não bloqueia o fluxo, mas loga erro. O usuário foi criado no Auth.
        }

        // Faz login automático ou pede verificação dependendo da config do Supabase
        // Se a sessão foi criada automaticamente:
        if (data.session) {
            setUser(mapProfileToUser(profileData, email));
        } else {
             // Caso exija confirmação de email
             alert("Cadastro realizado! Verifique seu email para confirmar.");
        }
    }
  };

  const updateUser = async (updatedUser: User) => {
    setUser(updatedUser); // Atualização otimista local

    if (isDemoMode) {
        console.log("Modo Demo: Perfil atualizado localmente");
        return;
    }

    try {
        const dbProfile = {
            name: updatedUser.name,
            location: updatedUser.location,
            avatar: updatedUser.avatar,
            
            company_name: updatedUser.companyName,
            company_area: updatedUser.companyArea,
            company_website: updatedUser.companyWebsite,
            company_description: updatedUser.companyDescription,
            company_logo: updatedUser.companyLogo,
            
            resume_url: updatedUser.resumeUrl,
            resume_name: updatedUser.resumeName,
            skills: updatedUser.skills,
            experience: updatedUser.experience,
            education: updatedUser.education,
            area_of_interest: updatedUser.areaOfInterest,
            availability: updatedUser.availability,
            
            updated_at: new Date().toISOString()
        };

        const { error } = await supabase
            .from('profiles')
            .update(dbProfile)
            .eq('id', updatedUser.id);

        if (error) throw error;
    } catch (e) {
        console.error("Erro ao atualizar perfil no DB:", e);
        alert("Erro ao salvar alterações no banco de dados.");
    }
  };

  const logout = async () => {
    if (isDemoMode) {
        alert("Modo Demonstração: Reiniciando sessão para usuário padrão.");
        setUser(MOCK_USERS[0]);
        return;
    }
    
    await supabase.auth.signOut();
    setUser(null);
  };

  const switchUserRole = () => {
    if (!isDemoMode) {
        alert("Em modo conectado, você deve fazer logout e login com outra conta para trocar de perfil.");
        return;
    }

    // Apenas demo
    if (user?.role === UserRole.CANDIDATE) {
        setUser(MOCK_USERS[1]);
    } else {
        setUser(MOCK_USERS[0]);
    }
  };

  return (
    <AuthContext.Provider value={{ 
        user, 
        loading, 
        login, 
        register, 
        updateUser, 
        logout, 
        isAuthenticated: !!user, 
        switchUserRole,
        isDemoMode,
        isSetupRequired,
        dbStatusMessage,
        connectionLatency,
        checkConnection
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};