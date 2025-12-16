import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { generateJobDescription } from '../services/geminiService';
import { JobType, WorkModel, Job, JobArea } from '../types';
import { MOCK_JOBS } from '../services/mockData';
import { Sparkles, Save, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PostJob = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    keywords: '',
    requirements: '', // Field for structured skills
    description: '',
    type: JobType.FULL_TIME,
    model: WorkModel.ONSITE,
    area: JobArea.TECH,
    location: '',
    cep: '',
    street: '',
    number: '',
    complement: '',
    salaryMin: '',
    salaryMax: ''
  });

  const handleGenerateDescription = async () => {
    // Use keywords if provided, otherwise fallback to requirements, otherwise warn
    const aiKeywords = formData.keywords || formData.requirements;

    if (!formData.title || !aiKeywords) {
        alert("Preencha o cargo e as palavras-chave (ou requisitos) para gerar a descrição.");
        return;
    }

    setLoading(true);
    const description = await generateJobDescription(
        formData.title, 
        aiKeywords, 
        user?.companyName || 'Empresa Confidencial'
    );
    setFormData(prev => ({ ...prev, description }));
    setLoading(false);
  };

  const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cepValue = e.target.value.replace(/\D/g, '');
    if (cepValue.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cepValue}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
            setFormData(prev => ({
                ...prev,
                street: data.logradouro,
                location: `${data.localidade}, ${data.uf}`,
                // Focus on number field automatically could be a nice touch, but let's keep it simple
            }));
        }
      } catch (error) {
        console.error("Erro ao buscar CEP", error);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Process requirements string into array
    const requirementsArray = formData.requirements
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    // Create the new Job object
    const newJob: Job = {
        id: Date.now().toString(), // Generate a simple ID
        companyId: user?.id || 'unknown',
        companyName: user?.companyName || user?.name || 'Empresa Confidencial',
        title: formData.title,
        description: formData.description,
        requirements: requirementsArray,
        location: formData.location,
        type: formData.type,
        model: formData.model,
        area: formData.area,
        salaryMin: formData.salaryMin ? parseFloat(formData.salaryMin) : undefined,
        salaryMax: formData.salaryMax ? parseFloat(formData.salaryMax) : undefined,
        postedAt: new Date().toISOString(),
        status: 'ACTIVE',
        address: {
            cep: formData.cep,
            street: formData.street,
            number: formData.number,
            complement: formData.complement
        }
    };

    // Save to mock data (In a real app, this would be an API call)
    MOCK_JOBS.unshift(newJob);
    
    console.log("Job saved:", newJob);
    alert("Vaga publicada com sucesso!");
    navigate('/dashboard');
  };

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft size={16} className="mr-1"/> Voltar
      </button>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-200 bg-gray-50">
            <h1 className="text-2xl font-bold text-gray-900">Anunciar Nova Vaga</h1>
            <p className="text-gray-500 mt-1">Preencha os detalhes para encontrar o melhor talento.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Título do Cargo</label>
                    <input 
                        type="text" 
                        required
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border"
                        placeholder="Ex: Desenvolvedor React Sênior"
                        value={formData.title}
                        onChange={e => setFormData({...formData, title: e.target.value})}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Contrato</label>
                    <select 
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border"
                        value={formData.type}
                        onChange={e => setFormData({...formData, type: e.target.value as JobType})}
                    >
                        {Object.values(JobType).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Modelo de Trabalho</label>
                    <select 
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border"
                        value={formData.model}
                        onChange={e => setFormData({...formData, model: e.target.value as WorkModel})}
                    >
                        {Object.values(WorkModel).map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Área da Vaga</label>
                    <select 
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border"
                        value={formData.area}
                        onChange={e => setFormData({...formData, area: e.target.value as JobArea})}
                    >
                        {Object.values(JobArea).map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Localização (Cidade/Estado)</label>
                    <input 
                        type="text" 
                        required
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border"
                        placeholder="Ex: São Paulo, SP"
                        value={formData.location}
                        onChange={e => setFormData({...formData, location: e.target.value})}
                    />
                </div>

                {/* Address Fields */}
                <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Endereço Detalhado (Opcional)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">CEP</label>
                            <input 
                                type="text" 
                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border text-sm"
                                placeholder="00000-000"
                                value={formData.cep}
                                onChange={e => setFormData({...formData, cep: e.target.value})}
                                onBlur={handleCepBlur}
                            />
                        </div>
                        <div className="md:col-span-3">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Logradouro (Rua/Av)</label>
                            <input 
                                type="text" 
                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border text-sm"
                                placeholder="Nome da rua"
                                value={formData.street}
                                onChange={e => setFormData({...formData, street: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Número</label>
                            <input 
                                type="text" 
                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border text-sm"
                                placeholder="123"
                                value={formData.number}
                                onChange={e => setFormData({...formData, number: e.target.value})}
                            />
                        </div>
                         <div className="md:col-span-3">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Complemento</label>
                            <input 
                                type="text" 
                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border text-sm"
                                placeholder="Apto 101, Bloco B"
                                value={formData.complement}
                                onChange={e => setFormData({...formData, complement: e.target.value})}
                            />
                        </div>
                    </div>
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Requisitos / Habilidades Obrigatórias</label>
                    <input 
                        type="text" 
                        required
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border"
                        placeholder="Ex: JavaScript, React, Inglês Avançado (separados por vírgula)"
                        value={formData.requirements}
                        onChange={e => setFormData({...formData, requirements: e.target.value})}
                    />
                    <p className="text-xs text-gray-500 mt-1">Estas habilidades serão usadas para calcular o match com candidatos.</p>
                </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
                <div className="flex justify-between items-center mb-4">
                    <label className="block text-sm font-medium text-gray-700">Descrição da Vaga</label>
                    <button 
                        type="button"
                        onClick={handleGenerateDescription}
                        disabled={loading}
                        className="flex items-center gap-2 text-xs font-bold text-white bg-gradient-to-r from-purple-500 to-blue-600 px-3 py-1.5 rounded-full hover:shadow-md transition disabled:opacity-50"
                    >
                        {loading ? 'Gerando...' : <><Sparkles size={14} /> Gerar com IA</>}
                    </button>
                </div>
                
                <div className="mb-4">
                     <label className="block text-xs text-gray-500 mb-1">Contexto extra para IA (Opcional)</label>
                     <input 
                        type="text" 
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border mb-3 text-sm"
                        placeholder="Ex: Cultura da empresa, benefícios específicos..."
                        value={formData.keywords}
                        onChange={e => setFormData({...formData, keywords: e.target.value})}
                    />
                </div>

                <textarea 
                    required
                    rows={10}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-3 border font-mono text-sm"
                    placeholder="Cole a descrição aqui ou use a IA para gerar..."
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                ></textarea>
            </div>

             <div className="grid grid-cols-2 gap-6">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Salário Mínimo</label>
                    <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">R$</span>
                        </div>
                        <input
                        type="number"
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md border p-2"
                        placeholder="0.00"
                        value={formData.salaryMin}
                        onChange={e => setFormData({...formData, salaryMin: e.target.value})}
                        />
                    </div>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Salário Máximo</label>
                    <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">R$</span>
                        </div>
                        <input
                        type="number"
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md border p-2"
                        placeholder="0.00"
                        value={formData.salaryMax}
                        onChange={e => setFormData({...formData, salaryMax: e.target.value})}
                        />
                    </div>
                 </div>
             </div>

            <div className="flex justify-end pt-4">
                <button type="submit" className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200">
                    <Save size={18} /> Publicar Vaga
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};