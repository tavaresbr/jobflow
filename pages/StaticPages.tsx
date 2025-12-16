import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';

export const ForCandidates = () => (
  <div className="max-w-4xl mx-auto space-y-8">
    <div className="text-center py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Para Candidatos</h1>
      <p className="text-lg text-gray-600">Encontre a oportunidade que vai transformar sua carreira.</p>
    </div>
    <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="font-bold text-xl mb-2">Crie seu Perfil</h3>
            <p className="text-gray-600">Cadastre suas habilidades, experiências e anexe seu currículo.</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="font-bold text-xl mb-2">Busque Vagas</h3>
            <p className="text-gray-600">Utilize nossos filtros avançados para encontrar o match perfeito.</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="font-bold text-xl mb-2">Candidate-se</h3>
            <p className="text-gray-600">Envie sua candidatura com um clique e acompanhe o status.</p>
        </div>
    </div>
     <div className="text-center mt-8">
        <Link to="/register" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition inline-flex items-center gap-2">
            Começar Agora <ArrowRight size={18} />
        </Link>
    </div>
  </div>
);

export const ForCompanies = () => (
  <div className="max-w-4xl mx-auto space-y-8">
    <div className="text-center py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Para Empresas</h1>
      <p className="text-lg text-gray-600">Contrate os melhores talentos do mercado com agilidade.</p>
    </div>
    <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
            <h3 className="font-bold text-xl mb-4 text-blue-600">Publicação Simples</h3>
            <p className="text-gray-600 mb-4">Crie vagas detalhadas em minutos com ajuda da nossa IA.</p>
            <ul className="space-y-2 text-gray-500">
                <li className="flex gap-2"><CheckCircle size={16} className="text-green-500"/> Descrições automáticas</li>
                <li className="flex gap-2"><CheckCircle size={16} className="text-green-500"/> Sugestão de títulos</li>
            </ul>
        </div>
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
            <h3 className="font-bold text-xl mb-4 text-purple-600">Gestão Eficiente</h3>
            <p className="text-gray-600 mb-4">Gerencie todos os candidatos em um único painel intuitivo.</p>
             <ul className="space-y-2 text-gray-500">
                <li className="flex gap-2"><CheckCircle size={16} className="text-green-500"/> Filtro de candidatos</li>
                <li className="flex gap-2"><CheckCircle size={16} className="text-green-500"/> Status do processo</li>
            </ul>
        </div>
    </div>
    <div className="text-center mt-8">
        <Link to="/register" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition inline-flex items-center gap-2">
            Cadastrar Empresa <ArrowRight size={18} />
        </Link>
    </div>
  </div>
);

export const Pricing = () => (
    <div className="max-w-5xl mx-auto py-12">
        <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Planos e Preços</h1>
            <p className="text-lg text-gray-600">Escolha o plano ideal para o seu negócio.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
            {/* Free */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 flex flex-col">
                <h3 className="font-bold text-xl mb-2">Gratuito</h3>
                <p className="text-gray-500 mb-6">Para quem está começando.</p>
                <div className="text-4xl font-bold mb-6">R$ 0<span className="text-sm font-normal text-gray-500">/mês</span></div>
                <ul className="space-y-3 mb-8 text-gray-600 flex-grow">
                    <li className="flex gap-2"><CheckCircle size={18} className="text-green-500 shrink-0"/> 3 Vagas ativas</li>
                    <li className="flex gap-2"><CheckCircle size={18} className="text-green-500 shrink-0"/> Candidatos limitados</li>
                    <li className="flex gap-2"><CheckCircle size={18} className="text-green-500 shrink-0"/> Suporte por email</li>
                </ul>
                <button className="w-full border border-blue-600 text-blue-600 font-bold py-2 rounded-lg hover:bg-blue-50 transition">Atual</button>
            </div>
            {/* Pro */}
            <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-blue-600 transform md:scale-105 relative flex flex-col">
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">POPULAR</div>
                <h3 className="font-bold text-xl mb-2">Profissional</h3>
                <p className="text-gray-500 mb-6">Para empresas em crescimento.</p>
                <div className="text-4xl font-bold mb-6">R$ 199<span className="text-sm font-normal text-gray-500">/mês</span></div>
                <ul className="space-y-3 mb-8 text-gray-600 flex-grow">
                    <li className="flex gap-2"><CheckCircle size={18} className="text-green-500 shrink-0"/> 20 Vagas ativas</li>
                    <li className="flex gap-2"><CheckCircle size={18} className="text-green-500 shrink-0"/> Candidatos ilimitados</li>
                    <li className="flex gap-2"><CheckCircle size={18} className="text-green-500 shrink-0"/> Destaque nas buscas</li>
                    <li className="flex gap-2"><CheckCircle size={18} className="text-green-500 shrink-0"/> IA Job Description</li>
                </ul>
                 <button className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition">Assinar Agora</button>
            </div>
             {/* Enterprise */}
             <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 flex flex-col">
                <h3 className="font-bold text-xl mb-2">Enterprise</h3>
                <p className="text-gray-500 mb-6">Para grandes operações.</p>
                <div className="text-4xl font-bold mb-6">Sob Consulta</div>
                <ul className="space-y-3 mb-8 text-gray-600 flex-grow">
                    <li className="flex gap-2"><CheckCircle size={18} className="text-green-500 shrink-0"/> Vagas ilimitadas</li>
                    <li className="flex gap-2"><CheckCircle size={18} className="text-green-500 shrink-0"/> API de integração</li>
                    <li className="flex gap-2"><CheckCircle size={18} className="text-green-500 shrink-0"/> Gerente de conta</li>
                </ul>
                 <button className="w-full border border-gray-300 text-gray-700 font-bold py-2 rounded-lg hover:bg-gray-50 transition">Fale Conosco</button>
            </div>
        </div>
    </div>
);

export const Terms = () => (
    <div className="max-w-3xl mx-auto py-12 bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
        <h1 className="text-2xl font-bold mb-6">Termos de Uso</h1>
        <div className="space-y-4 text-gray-600 text-sm">
            <p>Última atualização: Outubro 2023</p>
            <p>Bem-vindo ao JobFlow. Ao acessar nosso site, você concorda com estes termos de serviço, todas as leis e regulamentos aplicáveis ​​e concorda que é responsável pelo cumprimento de todas as leis locais aplicáveis.</p>
            <h3 className="font-bold text-gray-900 text-lg">1. Licença de Uso</h3>
            <p>É concedida permissão para baixar temporariamente uma cópia dos materiais (informações ou software) no site JobFlow, apenas para visualização transitória pessoal e não comercial.</p>
            <h3 className="font-bold text-gray-900 text-lg">2. Isenção de responsabilidade</h3>
            <p>Os materiais no site da JobFlow são fornecidos 'como estão'. JobFlow não oferece garantias, expressas ou implícitas, e, por este meio, isenta e nega todas as outras garantias, incluindo, sem limitação, garantias implícitas ou condições de comercialização.</p>
        </div>
    </div>
);

export const Privacy = () => (
    <div className="max-w-3xl mx-auto py-12 bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
        <h1 className="text-2xl font-bold mb-6">Política de Privacidade</h1>
        <div className="space-y-4 text-gray-600 text-sm">
            <p>A sua privacidade é importante para nós. É política do JobFlow respeitar a sua privacidade em relação a qualquer informação que possamos coletar no site JobFlow, e outros sites que possuímos e operamos.</p>
            <h3 className="font-bold text-gray-900 text-lg">Coleta de Informações</h3>
            <p>Solicitamos informações pessoais apenas quando realmente precisamos delas para lhe fornecer um serviço. Fazemo-lo por meios justos e legais, com o seu conhecimento e consentimento.</p>
            <h3 className="font-bold text-gray-900 text-lg">Uso de Dados</h3>
            <p>Apenas retemos as informações coletadas pelo tempo necessário para fornecer o serviço solicitado. Quando armazenamos dados, protegemos dentro de meios comercialmente aceitáveis ​​para evitar perdas e roubos.</p>
        </div>
    </div>
);