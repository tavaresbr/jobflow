import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { JobDetails } from './pages/JobDetails';
import { PostJob } from './pages/PostJob';
// Login e Register removidos
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { MyApplications } from './pages/MyApplications';
import { ForCandidates, ForCompanies, Pricing, Terms, Privacy } from './pages/StaticPages';
import { AuthProvider } from './context/AuthContext';

const App = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/job/:id" element={<JobDetails />} />
            {/* Rotas de autenticação removidas para acesso direto */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/my-applications" element={<MyApplications />} />
            <Route path="/post-job" element={<PostJob />} />
            
            {/* Static Pages */}
            <Route path="/candidates" element={<ForCandidates />} />
            <Route path="/companies" element={<ForCompanies />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;