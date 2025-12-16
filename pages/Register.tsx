import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole, User, JobArea, JobType } from '../types';
import { useNavigate, Link } from 'react-router-dom';
import { User as UserIcon, Building2, ArrowRight, Upload, X, ImageIcon, CheckCircle, Camera, FileText, AlertCircle } from 'lucide-react';

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>(UserRole.CANDIDATE);
  const [success, setSuccess] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    location: '',
    companyName: '',
    companyArea: JobArea.TECH,
    companyWebsite: '',
    companyLogo: '',
    candidatePhoto: '',
    resume: '',
    resumeName: '',
    skills: '',
    experience: '',
    education: '',
    areaOfInterest: JobArea.TECH,
    availability: JobType.FULL_TIME,
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, companyLogo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setFormData(prev => ({ ...prev, companyLogo: '' }));
  };

  const handleCandidatePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, candidatePhoto: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeCandidatePhoto = () => {
    setFormData(prev => ({ ...prev, candidatePhoto: '' }));
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setResumeError(null);

    if (file) {
      // Validate file type
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        setResumeError('Formato inválido. Por favor envie apenas arquivos PDF, DOC ou DOCX.');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setResumeError('O arquivo é muito grande. O tamanho máximo permitido é 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ 
            ...prev, 
            resume: reader.result as string,
            resumeName: file.name
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeResume = () => {
    setFormData(prev => ({ ...prev, resume: '', resumeName: '' }));
    setResumeError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create new user object (Mock ID generation)
    // Transform the comma-separated string into a clean array of strings
    const skillsArray = role === UserRole.CANDIDATE 
        ? formData.skills.split(',').map(s => s.trim()).filter(s => s.length > 0) 
        : undefined;

    // Determine avatar URL
    let avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random&color=fff`;
    if (role === UserRole.COMPANY && formData.companyLogo) {
        avatarUrl = formData.companyLogo;
    } else if (role === UserRole.CANDIDATE && formData.candidatePhoto) {
        avatarUrl = formData.candidatePhoto;
    }

    const newUser: User = {
        id: `user-${Date.now()}`,
        name: formData.name,
        email: formData.email,
        location: formData.location,
        role: role,
        avatar: avatarUrl,
        skills: skillsArray,
        experience: role === UserRole.CANDIDATE ? formData.experience : undefined,
        education: role === UserRole.CANDIDATE ? formData.education : undefined,
        areaOfInterest: role === UserRole.CANDIDATE ? formData.areaOfInterest : undefined,
        availability: role === UserRole.CANDIDATE ? formData.availability : undefined,
        resumeUrl: role === UserRole.CANDIDATE ? formData.resume : undefined,
        resumeName: role === UserRole.CANDIDATE ? formData.resumeName : undefined,
        companyName: role === UserRole.COMPANY ? (formData.companyName || formData.name) : undefined,
        companyArea: role === UserRole.COMPANY ? formData.companyArea : undefined,
        companyWebsite: role === UserRole.COMPANY ? formData.companyWebsite : undefined,
        companyLogo: role === UserRole.COMPANY ? formData.companyLogo : undefined
    };

    register(newUser);
    
    // Show success message and delay redirect
    setSuccess(true);
    
    setTimeout(() => {
        navigate(role === UserRole.COMPANY ? '/dashboard' : '/');
    }, 3000);
  };

  if (success) {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center py-12 px-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="text-green-600 w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Conta criada com sucesso!</h2>
                <p className="text-gray-600 mb-6">Verifique seu email para ativar.</p>
                <div className="animate-pulse text-sm text-blue-600 font-medium">
                    Redirecionando para o sistema...
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-12 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Crie sua conta</h2>
            <p className="text-gray-500 mt-2">Comece sua jornada no JobFlow</p>
        </div>

        {/* Role Toggle */}
        <div className="bg-gray-100 p-1 rounded-lg flex mb-8">
            <button 
                type="button"
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${role === UserRole.CANDIDATE ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setRole(UserRole.CANDIDATE)}
            >
                <UserIcon size={16} /> Candidato
            </button>
            <button 
                type="button"
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${role === UserRole.COMPANY ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setRole(UserRole.COMPANY)}
            >
                <Building2 size={16} /> Empresa
            </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
            <input 
                type="text" 
                required
                className="w-full bg-white text-gray-900 border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2.5 border"
                placeholder="Seu nome"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Localização</label>
             <input 
                 type="text" 
                 className="w-full bg-white text-gray-900 border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2.5 border"
                 placeholder="Cidade, Estado"
                 value={formData.location}
                 onChange={e => setFormData({...formData, location: e.target.value})}
             />
          </div>

          {role === UserRole.COMPANY && (
            <>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Empresa</label>
                <input 
                    type="text" 
                    required
                    className="w-full bg-white text-gray-900 border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2.5 border"
                    placeholder="Nome da sua empresa"
                    value={formData.companyName}
                    onChange={e => setFormData({...formData, companyName: e.target.value})}
                />
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Logo da Empresa</label>
                <div className="mt-1 flex items-center gap-4">
                    {formData.companyLogo ? (
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                            <img src={formData.companyLogo} alt="Logo preview" className="w-full h-full object-cover" />
                            <button
                                type="button"
                                onClick={removeLogo}
                                className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl hover:bg-red-600 transition"
                                title="Remover logo"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    ) : (
                        <div className="w-16 h-16 rounded-lg bg-gray-50 flex items-center justify-center border-2 border-dashed border-gray-300 text-gray-400 shrink-0">
                            <ImageIcon size={24} />
                        </div>
                    )}
                    <label className="cursor-pointer bg-white px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition w-full justify-center">
                        <Upload size={16} />
                        <span>Carregar Logo</span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
                    </label>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Site da Empresa</label>
                <input 
                    type="url" 
                    className="w-full bg-white text-gray-900 border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2.5 border"
                    placeholder="https://www.suaempresa.com.br"
                    value={formData.companyWebsite}
                    onChange={e => setFormData({...formData, companyWebsite: e.target.value})}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Área de Atuação</label>
                <select 
                    className="w-full bg-white text-gray-900 border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2.5 border"
                    value={formData.companyArea}
                    onChange={e => setFormData({...formData, companyArea: e.target.value as JobArea})}
                >
                    {Object.values(JobArea).map(area => (
                        <option key={area} value={area}>{area}</option>
                    ))}
                </select>
            </div>
            </>
          )}

          {role === UserRole.CANDIDATE && (
            <>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Foto de Perfil</label>
                <div className="mt-1 flex items-center gap-4">
                    {formData.candidatePhoto ? (
                        <div className="relative w-16 h-16 rounded-full overflow-hidden border border-gray-200 shrink-0">
                            <img src={formData.candidatePhoto} alt="Foto preview" className="w-full h-full object-cover" />
                            <button
                                type="button"
                                onClick={removeCandidatePhoto}
                                className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-full hover:bg-red-600 transition transform translate-x-1 -translate-y-1"
                                title="Remover foto"
                            >
                                <X size={10} />
                            </button>
                        </div>
                    ) : (
                        <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center border-2 border-dashed border-gray-300 text-gray-400 shrink-0">
                            <Camera size={24} />
                        </div>
                    )}
                    <label className="cursor-pointer bg-white px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition w-full justify-center">
                        <Upload size={16} />
                        <span>Carregar Foto</span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleCandidatePhotoChange} />
                    </label>
                </div>
            </div>

             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Área de Interesse</label>
                <select 
                    required
                    className="w-full bg-white text-gray-900 border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2.5 border"
                    value={formData.areaOfInterest}
                    onChange={e => setFormData({...formData, areaOfInterest: e.target.value as JobArea})}
                >
                    {Object.values(JobArea).map(area => (
                        <option key={area} value={area}>{area}</option>
                    ))}
                </select>
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Disponibilidade</label>
                <select 
                    className="w-full bg-white text-gray-900 border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2.5 border"
                    value={formData.availability}
                    onChange={e => setFormData({...formData, availability: e.target.value as JobType})}
                >
                    {Object.values(JobType).map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Habilidades e Competências</label>
                <input 
                    type="text" 
                    required
                    className="w-full bg-white text-gray-900 border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2.5 border"
                    placeholder="Ex: JavaScript, Marketing Digital, Inglês Avançado"
                    value={formData.skills}
                    onChange={e => setFormData({...formData, skills: e.target.value})}
                />
                <p className="text-xs text-gray-500 mt-1">Separe as habilidades por vírgula para melhorar o match com as vagas.</p>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currículo (PDF ou DOC)</label>
                <div className="mt-1 flex flex-col gap-2">
                     {formData.resume ? (
                        <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg border border-blue-100 w-full">
                            <FileText size={18} />
                            <span className="text-sm truncate flex-1">{formData.resumeName}</span>
                            <button type="button" onClick={removeResume} className="text-red-500 hover:text-red-700"><X size={16} /></button>
                        </div>
                     ) : (
                        <label className={`cursor-pointer bg-white w-full border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center transition ${resumeError ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50 text-gray-500'}`}>
                            {resumeError ? <AlertCircle size={24} className="text-red-500 mb-2" /> : <FileText size={24} className="mb-2" />}
                            <span className="text-sm font-medium">{resumeError ? 'Erro no arquivo' : 'Clique para enviar currículo'}</span>
                            <span className={`text-xs mt-1 ${resumeError ? 'text-red-500' : 'text-gray-400'}`}>(PDF, DOC, DOCX - Máx 5MB)</span>
                            <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleResumeChange} />
                        </label>
                     )}
                     {resumeError && (
                        <p className="text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle size={12} /> {resumeError}
                        </p>
                     )}
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experiência Profissional</label>
                <textarea 
                    className="w-full bg-white text-gray-900 border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2.5 border"
                    placeholder="Descreva suas experiências profissionais anteriores, cargos e empresas..."
                    rows={5}
                    value={formData.experience}
                    onChange={e => setFormData({...formData, experience: e.target.value})}
                />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Formação Acadêmica</label>
                <textarea 
                    className="w-full bg-white text-gray-900 border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2.5 border"
                    placeholder="Graduação, cursos técnicos, certificações..."
                    rows={3}
                    value={formData.education}
                    onChange={e => setFormData({...formData, education: e.target.value})}
                />
            </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input 
                type="email" 
                required
                className="w-full bg-white text-gray-900 border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2.5 border"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input 
                type="password" 
                required
                className="w-full bg-white text-gray-900 border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2.5 border"
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 mt-6 shadow-lg shadow-blue-200"
          >
            Criar Conta <ArrowRight size={18} />
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
            Já tem uma conta? <Link to="/login" className="text-blue-600 font-semibold hover:underline">Entrar</Link>
        </div>
      </div>
    </div>
  );
};