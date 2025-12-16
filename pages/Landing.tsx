import React, { useState } from 'react';
import { MOCK_JOBS } from '../services/mockData';
import { Job, WorkModel, JobType, JobArea } from '../types';
import { Search, MapPin, Building2, Wallet, Clock, Filter, Briefcase, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Landing = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterArea, setFilterArea] = useState<string>('ALL');
  const [filterModel, setFilterModel] = useState<string>('ALL');
  const [filterLocation, setFilterLocation] = useState<string>('');

  const filteredJobs = MOCK_JOBS.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          job.companyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || job.type === filterType;
    const matchesArea = filterArea === 'ALL' || job.area === filterArea;
    const matchesModel = filterModel === 'ALL' || job.model === filterModel;
    const matchesLocation = filterLocation === '' || job.location.toLowerCase().includes(filterLocation.toLowerCase());
    
    return matchesSearch && matchesType && matchesArea && matchesModel && matchesLocation;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('ALL');
    setFilterArea('ALL');
    setFilterModel('ALL');
    setFilterLocation('');
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Encontre o emprego dos seus sonhos</h1>
            <p className="text-blue-100 text-lg mb-8">
            Conectamos os melhores talentos às empresas mais inovadoras do mercado.
            </p>
            
            <div className="bg-white p-2 rounded-lg shadow-lg flex flex-col md:flex-row gap-2">
                <div className="flex-grow flex items-center px-4 bg-gray-50 rounded-md">
                    <Search className="text-gray-400 mr-2" />
                    <input 
                        type="text" 
                        placeholder="Cargo, empresa ou palavra-chave..."
                        className="w-full bg-transparent py-3 focus:outline-none text-gray-800 placeholder-gray-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="bg-blue-600 text-white px-8 py-3 rounded-md font-semibold hover:bg-blue-700 transition">
                    Buscar
                </button>
            </div>
        </div>
        {/* Decorative circle */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
      </div>

      {/* Filters & Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 sticky top-24">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Filter className="text-blue-600" size={20} />
                        <h3 className="font-semibold text-gray-900">Filtros</h3>
                    </div>
                    {(filterType !== 'ALL' || filterArea !== 'ALL' || filterModel !== 'ALL' || filterLocation !== '') && (
                        <button onClick={clearFilters} className="text-xs text-blue-600 hover:underline">
                            Limpar
                        </button>
                    )}
                </div>
                
                <div className="space-y-5">
                    {/* Location Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Localização</label>
                        <div className="relative">
                            <input 
                                type="text" 
                                placeholder="Cidade ou Estado"
                                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 pl-9 border text-sm"
                                value={filterLocation}
                                onChange={(e) => setFilterLocation(e.target.value)}
                            />
                            <MapPin size={16} className="absolute left-3 top-2.5 text-gray-400" />
                        </div>
                    </div>

                    {/* Area Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Área de Atuação</label>
                        <div className="relative">
                            <select 
                                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 pl-9 border text-sm appearance-none bg-white"
                                value={filterArea}
                                onChange={(e) => setFilterArea(e.target.value)}
                            >
                                <option value="ALL">Todas as Áreas</option>
                                {Object.values(JobArea).map(area => (
                                    <option key={area} value={area}>{area}</option>
                                ))}
                            </select>
                            <Briefcase size={16} className="absolute left-3 top-2.5 text-gray-400" />
                        </div>
                    </div>

                    {/* Work Model Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Modelo de Trabalho</label>
                        <div className="relative">
                            <select 
                                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 pl-9 border text-sm appearance-none bg-white"
                                value={filterModel}
                                onChange={(e) => setFilterModel(e.target.value)}
                            >
                                <option value="ALL">Todos</option>
                                {Object.values(WorkModel).map(model => (
                                    <option key={model} value={model}>{model}</option>
                                ))}
                            </select>
                            <Globe size={16} className="absolute left-3 top-2.5 text-gray-400" />
                        </div>
                    </div>

                    {/* Contract Type Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Contrato</label>
                        <div className="relative">
                            <select 
                                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 pl-9 border text-sm appearance-none bg-white"
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                            >
                                <option value="ALL">Todos os Tipos</option>
                                {Object.values(JobType).map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                            <Clock size={16} className="absolute left-3 top-2.5 text-gray-400" />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Job List */}
        <div className="lg:col-span-3 space-y-4">
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-semibold text-gray-800">
                    {filteredJobs.length} {filteredJobs.length === 1 ? 'Vaga encontrada' : 'Vagas encontradas'}
                </h2>
            </div>

            {filteredJobs.map(job => (
                <Link to={`/job/${job.id}`} key={job.id} className="block group">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition duration-200">
                        <div className="flex justify-between items-start">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 font-bold text-lg">
                                    {job.companyName.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition">{job.title}</h3>
                                    <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                                        <Building2 size={14} /> {job.companyName}
                                    </p>
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                job.type === JobType.FULL_TIME ? 'bg-green-100 text-green-700' : 
                                job.type === JobType.CONTRACT ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                                {job.type}
                            </span>
                        </div>
                        
                        <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-600">
                            <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
                                <Briefcase size={14} /> {job.area}
                            </span>
                            <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
                                <MapPin size={14} /> {job.location} ({job.model})
                            </span>
                            <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
                                <Wallet size={14} /> R$ {job.salaryMin} - {job.salaryMax}
                            </span>
                            <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
                                <Clock size={14} /> Postado em {new Date(job.postedAt).toLocaleDateString('pt-BR')}
                            </span>
                        </div>
                    </div>
                </Link>
            ))}

            {filteredJobs.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                    <p className="text-gray-500">Nenhuma vaga encontrada para sua busca.</p>
                    <button onClick={clearFilters} className="mt-4 text-blue-600 font-medium hover:underline">
                        Limpar filtros
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};