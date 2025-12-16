import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole, JobArea, JobType } from '../types';
import { Navigate } from 'react-router-dom';
import { User, MapPin, Briefcase, GraduationCap, Code, FileText, Upload, Save, X, Building2, Globe, Layout, Camera } from 'lucide-react';

export const Profile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);
  
  // Local state for form fields
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        location: user.location || '',
        
        // Candidate specific
        experience: user.experience || '',
        education: user.education || '',
        skills: user.skills ? user.skills.join(', ') : '',
        areaOfInterest: user.areaOfInterest || JobArea.TECH,
        availability: user.availability || JobType.FULL_TIME,
        resume: user.resumeUrl || '',
        resumeName: user.resumeName || '',
        
        // Company specific
        companyName: user.companyName || user.name,
        companyWebsite: user.companyWebsite || '',
        companyArea: user.companyArea || JobArea.TECH,
        companyDescription: user.companyDescription || '',
        companyLogo: user.companyLogo || '',
      });
    }
  }, [user]);

  if (!user) return <Navigate to="/login" />;
  // Only allow Candidate or Company (Not Admin)
  if (user.role === UserRole.ADMIN) return <Navigate to="/dashboard" />;

  const isCompany = user.role === UserRole.COMPANY;

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setResumeError(null);

    if (file) {
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        setResumeError('Formato inválido. Apenas PDF, DOC ou DOCX.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setResumeError('Arquivo muito grande. Máx 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev: any) => ({ 
            ...prev, 
            resume: reader.result as string,
            resumeName: file.name
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev: any) => ({ ...prev, companyLogo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    let updatedUser = { ...user };

    if (isCompany) {
         updatedUser = {
            ...updatedUser,
            name: formData.name, // Usually companies might change the recruiter name
            companyName: formData.companyName,
            location: formData.location,
            companyWebsite: formData.companyWebsite,
            companyArea: formData.companyArea,
            companyDescription: formData.companyDescription,
            companyLogo: formData.companyLogo,
         }
    } else {
        const skillsArray = formData.skills.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
        updatedUser = {
            ...updatedUser,
            name: formData.name,
            location: formData.location,
            experience: formData.experience,
            education: formData.education,
            skills: skillsArray,
            areaOfInterest: formData.areaOfInterest,
            availability: formData.availability,
            resumeUrl: formData.resume,
            resumeName: formData.resumeName,
        };
    }

    updateUser(updatedUser);
    setIsEditing(false);
    alert("Perfil atualizado com sucesso!");
  };

  const handleCancel = () => {
    // Reset form data to current user state
    setFormData({
        name: user.name,
        email: user.email,
        location: user.location || '',
        experience: user.experience || '',
        education: user.education || '',
        skills: user.skills ? user.skills.join(', ') : '',
        areaOfInterest: user.areaOfInterest || JobArea.TECH,
        availability: user.availability || JobType.FULL_TIME,
        resume: user.resumeUrl || '',
        resumeName: user.resumeName || '',
        companyName: user.companyName || user.name,
        companyWebsite: user.companyWebsite || '',
        companyArea: user.companyArea || JobArea.TECH,
        companyDescription: user.companyDescription || '',
        companyLogo: user.companyLogo || '',
    });
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className={`p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${isCompany ? 'bg-gradient-to-r from-gray-800 to-gray-900' : 'bg-gradient-to-r from-blue-600 to-indigo-700'}`}>
            <div className="flex items-center gap-6">
                <div className="relative">
                    <div className="w-24 h-24 bg-white rounded-full p-1 shadow-lg overflow-hidden flex items-center justify-center">
                        {(isCompany ? formData.companyLogo : user.avatar) ? (
                            <img src={isCompany ? formData.companyLogo : user.avatar} alt={formData.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                            <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                                {isCompany ? <Building2 size={40} /> : <User size={40} />}
                            </div>
                        )}
                    </div>
                    {isEditing && isCompany && (
                         <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-blue-700 shadow-md">
                            <Camera size={14} />
                            <input type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
                         </label>
                    )}
                </div>
                
                <div>
                    {isEditing && isCompany ? (
                        <input 
                            type="text" 
                            className="bg-white text-gray-900 rounded px-2 py-1 text-xl font-bold mb-1 w-full border-transparent shadow-sm"
                            value={formData.companyName}
                            onChange={e => setFormData({...formData, companyName: e.target.value})}
                            placeholder="Nome da Empresa"
                        />
                    ) : (
                        <h1 className="text-2xl font-bold">{isCompany ? user.companyName : user.name}</h1>
                    )}
                    
                    <p className="text-blue-100 flex items-center gap-2 text-sm opacity-90">
                         <MapPin size={16} /> {formData.location || 'Localização não informada'}
                    </p>
                </div>
            </div>
            {!isEditing && (
                <button 
                    onClick={() => setIsEditing(true)}
                    className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition backdrop-blur-sm border border-white/30"
                >
                    Editar Perfil
                </button>
            )}
        </div>

        <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                    {/* Common: Basic Contact */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <User size={18} className="text-blue-600" /> {isCompany ? 'Dados do Recrutador' : 'Dados Pessoais'}
                        </h3>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                            <div>
                                <label className="text-xs text-gray-500 uppercase font-bold">Nome</label>
                                {isEditing ? (
                                    <input 
                                        type="text" 
                                        className="w-full bg-white text-gray-900 border-gray-300 rounded p-1 text-sm mt-1"
                                        value={formData.name}
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                    />
                                ) : (
                                    <p className="text-sm text-gray-800">{user.name}</p>
                                )}
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase font-bold">Email</label>
                                <p className="text-sm text-gray-800">{user.email}</p> 
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase font-bold">Localização</label>
                                {isEditing ? (
                                    <input 
                                        type="text" 
                                        className="w-full bg-white text-gray-900 border-gray-300 rounded p-1 text-sm mt-1"
                                        value={formData.location}
                                        onChange={e => setFormData({...formData, location: e.target.value})}
                                    />
                                ) : (
                                    <p className="text-sm text-gray-800">{formData.location || '-'}</p>
                                )}
                            </div>
                            {isCompany && (
                                <div>
                                    <label className="text-xs text-gray-500 uppercase font-bold">Website</label>
                                     {isEditing ? (
                                        <input 
                                            type="text" 
                                            className="w-full bg-white text-gray-900 border-gray-300 rounded p-1 text-sm mt-1"
                                            value={formData.companyWebsite}
                                            onChange={e => setFormData({...formData, companyWebsite: e.target.value})}
                                        />
                                    ) : (
                                        <p className="text-sm text-blue-600 truncate">
                                            {formData.companyWebsite ? <a href={formData.companyWebsite} target="_blank" rel="noreferrer">{formData.companyWebsite}</a> : '-'}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {!isCompany && (
                        <>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <Code size={18} className="text-purple-600" /> Habilidades
                                </h3>
                                {isEditing ? (
                                    <textarea 
                                        className="w-full bg-white text-gray-900 border-gray-300 rounded p-2 text-sm"
                                        rows={3}
                                        value={formData.skills}
                                        onChange={e => setFormData({...formData, skills: e.target.value})}
                                        placeholder="Separe por vírgulas"
                                    />
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {user.skills?.map((skill, i) => (
                                            <span key={i} className="bg-purple-50 text-purple-700 px-2 py-1 rounded-md text-sm border border-purple-100">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <FileText size={18} className="text-green-600" /> Currículo
                                </h3>
                                {isEditing ? (
                                    <div className="space-y-2">
                                        <label className="block w-full border border-dashed border-gray-300 rounded-lg p-3 text-center cursor-pointer hover:bg-gray-50 transition">
                                            <Upload size={16} className="mx-auto mb-1 text-gray-400"/>
                                            <span className="text-xs text-gray-500">Alterar PDF/DOC</span>
                                            <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleResumeChange} />
                                        </label>
                                        {formData.resumeName && <p className="text-xs text-gray-600 truncate">{formData.resumeName}</p>}
                                        {resumeError && <p className="text-xs text-red-500">{resumeError}</p>}
                                    </div>
                                ) : (
                                    user.resumeName ? (
                                        <div className="flex items-center gap-2 bg-green-50 p-2 rounded border border-green-100">
                                            <FileText size={16} className="text-green-600" />
                                            <span className="text-sm text-green-800 truncate">{user.resumeName}</span>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-400 italic">Nenhum currículo enviado.</p>
                                    )
                                )}
                            </div>
                        </>
                    )}

                    {isCompany && (
                        <div>
                             <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <Layout size={18} className="text-indigo-600" /> Área de Atuação
                            </h3>
                             {isEditing ? (
                                <select 
                                    className="w-full bg-white text-gray-900 border-gray-300 rounded p-2 text-sm"
                                    value={formData.companyArea}
                                    onChange={e => setFormData({...formData, companyArea: e.target.value})}
                                >
                                    {Object.values(JobArea).map(area => <option key={area} value={area}>{area}</option>)}
                                </select>
                            ) : (
                                <div className="p-2 bg-gray-50 rounded text-sm font-medium border border-gray-100 inline-block">
                                    {formData.companyArea}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Column */}
                <div className="md:col-span-2 space-y-8">
                     {!isCompany ? (
                        <>
                             {/* Candidate Preferences */}
                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Área de Interesse</label>
                                    {isEditing ? (
                                        <select 
                                            className="w-full bg-white text-gray-900 border-gray-300 rounded p-2 text-sm"
                                            value={formData.areaOfInterest}
                                            onChange={e => setFormData({...formData, areaOfInterest: e.target.value})}
                                        >
                                            {Object.values(JobArea).map(area => <option key={area} value={area}>{area}</option>)}
                                        </select>
                                    ) : (
                                        <div className="p-2 bg-gray-50 rounded text-sm font-medium">{user.areaOfInterest}</div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Disponibilidade</label>
                                     {isEditing ? (
                                        <select 
                                            className="w-full bg-white text-gray-900 border-gray-300 rounded p-2 text-sm"
                                            value={formData.availability}
                                            onChange={e => setFormData({...formData, availability: e.target.value})}
                                        >
                                            {Object.values(JobType).map(type => <option key={type} value={type}>{type}</option>)}
                                        </select>
                                    ) : (
                                        <div className="p-2 bg-gray-50 rounded text-sm font-medium">{user.availability}</div>
                                    )}
                                </div>
                             </div>

                             <div className="border-t border-gray-100 pt-6">
                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Briefcase size={20} className="text-gray-400" /> Experiência Profissional
                                </h3>
                                {isEditing ? (
                                    <textarea 
                                        className="w-full bg-white text-gray-900 border-gray-300 rounded p-3 text-sm focus:ring-blue-500 focus:border-blue-500"
                                        rows={6}
                                        value={formData.experience}
                                        onChange={e => setFormData({...formData, experience: e.target.value})}
                                    />
                                ) : (
                                    <div className="prose prose-sm text-gray-600 whitespace-pre-line">
                                        {user.experience || "Nenhuma experiência informada."}
                                    </div>
                                )}
                             </div>

                             <div className="border-t border-gray-100 pt-6">
                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <GraduationCap size={20} className="text-gray-400" /> Formação Acadêmica
                                </h3>
                                 {isEditing ? (
                                    <textarea 
                                        className="w-full bg-white text-gray-900 border-gray-300 rounded p-3 text-sm focus:ring-blue-500 focus:border-blue-500"
                                        rows={4}
                                        value={formData.education}
                                        onChange={e => setFormData({...formData, education: e.target.value})}
                                    />
                                ) : (
                                    <div className="prose prose-sm text-gray-600 whitespace-pre-line">
                                        {user.education || "Nenhuma formação informada."}
                                    </div>
                                )}
                             </div>
                        </>
                     ) : (
                        <>
                            {/* Company Description */}
                             <div>
                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Building2 size={20} className="text-gray-400" /> Sobre a Empresa
                                </h3>
                                {isEditing ? (
                                    <textarea 
                                        className="w-full bg-white text-gray-900 border-gray-300 rounded p-3 text-sm focus:ring-blue-500 focus:border-blue-500"
                                        rows={10}
                                        value={formData.companyDescription}
                                        onChange={e => setFormData({...formData, companyDescription: e.target.value})}
                                        placeholder="Descreva a missão, visão e cultura da sua empresa..."
                                    />
                                ) : (
                                    <div className="prose prose-sm text-gray-600 whitespace-pre-line">
                                        {formData.companyDescription || "Nenhuma descrição informada."}
                                    </div>
                                )}
                             </div>
                        </>
                     )}
                </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
                <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-gray-200">
                    <button 
                        onClick={handleCancel}
                        className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSave}
                        className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-sm"
                    >
                        <Save size={18} /> Salvar Alterações
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};