import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole, User, JobArea, JobType } from '../types';
import { useNavigate, Link } from 'react-router-dom';
import { User as UserIcon, Building2, ArrowRight, Upload, X, ImageIcon, CheckCircle, Camera, FileText, AlertCircle, Loader2, Search, Phone, MapPin } from 'lucide-react';

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>(UserRole.CANDIDATE);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingCnpj, setLoadingCnpj] = useState(false);
  const [error, setError] = useState('');
  const [resumeError, setResumeError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '', // Razão Social (Empresa) ou Nome (Candidato)
    email: '',
    password: '',
    location: '',
    phone: '', // Novo campo
    
    // Company specific
    cnpj: '', // Novo campo
    companyName: '', // Nome Fantasia
    companyArea: JobArea.TECH,
    companyWebsite: '',
    companyLogo: '',
    companyDescription: '', // Novo campo editável
    
    // Candidate specific
    candidatePhoto: '',
    resume: '',
    resumeName: '',
    skills: '',
    experience: '',
    education: '',
    areaOfInterest: JobArea.TECH,
    availability: JobType.FULL_TIME,
  });

  // Formata CNPJ enquanto digita
  const formatCNPJ = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .substring(0, 18);
  };

  // Busca dados na BrasilAPI
  const handleCnpjBlur = async () => {
    const cleanCnpj = formData.cnpj.replace(/\D/g, '');
    if (cleanCnpj.length !== 14) return;

    setLoadingCnpj(true);
    try {
        const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);
        if (!response.ok) throw new Error('CNPJ não encontrado');
        
        const data = await response.json();
        
        setFormData(prev => ({
            ...prev,
            companyName: data.nome_fantasia || data.razao_social, // Nome Fantasia
            name: data.razao_social, // Razão Social vai para o nome do usuário/conta
            location: `${data.municipio} - ${data.uf}`,
            phone: data.ddd_telefone_1 || '',
            companyDescription: data.cnae_fiscal_descricao ? `Atividade Principal: ${data.cnae_fiscal_descricao}` : '',
            // Tenta adivinhar a área baseado no CNAE (lógica simples)
            companyArea: detectAreaFromCNAE(data.cnae_fiscal_descricao)
        }));
    } catch (err) {
        console.error(err);
        // Não bloqueia o fluxo, apenas avisa console ou poderia setar um erro visual leve
    } finally {
        setLoadingCnpj(false);
    }
  };

  const detectAreaFromCNAE = (cnaeDesc: string): JobArea => {
      if (!cnaeDesc) return JobArea.OTHER;
      const desc = cnaeDesc.toLowerCase();
      if (desc.includes('software') || desc.includes('computador') || desc.includes('ti')) return JobArea.TECH;
      if (desc.includes('saúde') || desc.includes('médico') || desc.includes('hospital')) return JobArea.HEALTH;
      if (desc.includes('educação') || desc.includes('ensino') || desc.includes('escola')) return JobArea.EDUCATION;
      if (desc.includes('vendas') || desc.includes('comércio')) return JobArea.SALES;
      if (desc.includes('financeiro') || desc.includes('banco') || desc.includes('seguro')) return JobArea.FINANCE;
      return JobArea.OTHER;
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Transform the comma-separated string into a clean array of strings
    const skillsArray = role === UserRole.CANDIDATE 
        ? formData.skills.split(',').map(s => s.trim()).filter(s => s.length > 0) 
        : [];

    // Determine avatar URL
    let avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random&color=fff`;
    if (role === UserRole.COMPANY && formData.companyLogo) {
        avatarUrl = formData.companyLogo;
    } else if (role === UserRole.CANDIDATE && formData.candidatePhoto) {
        avatarUrl = formData.candidatePhoto;
    }

    // Append phone to description for companies if necessary, or location
    let finalDescription = formData.companyDescription;
    if (role === UserRole.COMPANY && formData.phone) {
        finalDescription += `\n\nContato: ${formData.phone}`;
    }

    // Construct metadata for Supabase
    // Note: Password is passed separately to auth.signUp
    const userMetadata = {
        name: formData.name, // Razão social for Company, Person name for Candidate
        role: role,
        avatar: avatarUrl,
        location: formData.location,
        
        // Company Fields
        companyName: role === UserRole.COMPANY ? (formData.companyName || formData.name) : null,
        companyArea: role === UserRole.COMPANY ? formData.companyArea : null,
        companyWebsite: role === UserRole.COMPANY ? formData.companyWebsite : null,
        companyLogo: role === UserRole.COMPANY ? formData.companyLogo : null,
        companyDescription: role === UserRole.COMPANY ? finalDescription : null,

        // Candidate Fields
        skills: skillsArray,
        experience: role === UserRole.CANDIDATE ? formData.experience : null,
        education: role === UserRole.CANDIDATE ? formData.education : null,
        areaOfInterest: role === UserRole.CANDIDATE ? formData.areaOfInterest : null,
        availability: role === UserRole.CANDIDATE ? formData.availability : null,
        resumeUrl: role === UserRole.CANDIDATE ? formData.resume : null,
        resumeName: role === UserRole.CANDIDATE ? formData.resumeName : null,
    };

    try {
        await register(formData.email, formData.password, userMetadata);
        setSuccess(true);
    } catch (err: any) {
        console.error(err);
        setError(err.message || 'Erro ao criar conta. Tente novamente.');
        setLoading(false);
    }
  };

  if (success) {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center py-12 px-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="text-green-600 w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Conta criada com sucesso!</h2>
                <p className="text-gray-600 mb-6">Verifique seu email para confirmar seu cadastro.</p>
                <div className="space-y-3">
                    <p className="text-sm text-gray-500">Já confirmou?</p>
                    <Link to="/login" className="block w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition">
                        Fazer Login
                    </Link>
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

        {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm text-center border border-red-100">
                {error}
            </div>
        )}

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
          
          {/* ----- CAMPOS EMPRESA ----- */}
          {role === UserRole.COMPANY && (
            <>
             {/* CNPJ Input */}
             <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
                <label className="block text-sm font-bold text-blue-800 mb-1">Buscar por CNPJ (Opcional)</label>
                <div className="relative">
                    <input 
                        type="text"
                        className="w-full bg-white text-gray-900 border-blue-200 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2.5 pr-10 border"
                        placeholder="00.000.000/0000-00"
                        value={formData.cnpj}
                        onChange={e => setFormData({...formData, cnpj: formatCNPJ(e.target.value)})}
                        onBlur={handleCnpjBlur}
                    />
                    <div className="absolute right-3 top-2.5 text-blue-500">
                        {loadingCnpj ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                    </div>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                    Preencha o CNPJ para carregar os dados da empresa automaticamente.
                </p>
             </div>

             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Razão Social</label>
                <input 
                    type="text" 
                    required
                    className="w-full bg-white text-gray-900 border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2.5 border"
                    placeholder="Razão Social Ltda"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                />
            </div>

             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Fantasia (Público)</label>
                <input 
                    type="text" 
                    required
                    className="w-full bg-white text-gray-900 border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2.5 border"
                    placeholder="Nome da sua marca"
                    value={formData.companyName}
                    onChange={e => setFormData({...formData, companyName: e.target.value})}
                />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                     <div className="relative">
                        <input 
                            type="tel" 
                            className="w-full bg-white text-gray-900 border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2.5 pl-9 border"
                            placeholder="(00) 0000-0000"
                            value={formData.phone}
                            onChange={e => setFormData({...formData, phone: e.target.value})}
                        />
                        <Phone size={16} className="absolute left-3 top-3 text-gray-400" />
                     </div>
                </div>
                <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Localização</label>
                     <div className="relative">
                        <input 
                             type="text" 
                             className="w-full bg-white text-gray-900 border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2.5 pl-9 border"
                             placeholder="Cidade - UF"
                             value={formData.location}
                             onChange={e => setFormData({...formData, location: e.target.value})}
                         />
                         <MapPin size={16} className="absolute left-3 top-3 text-gray-400" />
                     </div>
                </div>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição / Sobre</label>
                <textarea 
                    className="w-full bg-white text-gray-900 border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2.5 border"
                    placeholder="Breve descrição da empresa..."
                    rows={3}
                    value={formData.companyDescription}
                    onChange={e => setFormData({...formData, companyDescription: e.target.value})}
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
            </>
          )}

          {/* ----- CAMPOS CANDIDATO ----- */}
          {role === UserRole.CANDIDATE && (
            <>
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
                 <label className="block text-sm font-medium text-gray-700 mb-1">Localização</label>
                 <input 
                     type="text" 
                     className="w-full bg-white text-gray-900 border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2.5 border"
                     placeholder="Cidade, Estado"
                     value={formData.location}
                     onChange={e => setFormData({...formData, location: e.target.value})}
                 />
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

          {/* ----- CAMPOS COMUNS ----- */}
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
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 mt-6 shadow-lg shadow-blue-200 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <><span className="mr-1">Criar Conta</span> <ArrowRight size={18} /></>}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
            Já tem uma conta? <Link to="/login" className="text-blue-600 font-semibold hover:underline">Entrar</Link>
        </div>
      </div>
    </div>
  );
};