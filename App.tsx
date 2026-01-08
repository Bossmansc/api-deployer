import React, { useState, useEffect } from 'react';
import Dashboard from './src/pages/Dashboard';
import CreateProject from './src/pages/CreateProject';
import ProjectDetails from './src/pages/ProjectDetails';
import Login from './src/pages/Login';
import Register from './src/pages/Register';
import { api } from './src/utils/api';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [view, setView] = useState<'login' | 'register' | 'dashboard' | 'create' | 'details'>('login');
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('access_token');
    if (token) {
        try {
            await api.auth.me();
            setView('dashboard');
        } catch (e) {
            console.error("Auth check failed", e);
            localStorage.removeItem('access_token');
            setView('login');
        }
    } else {
        setView('login');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  const renderView = () => {
    switch (view) {
      case 'login':
        return <Login onLogin={() => {
          checkAuth(); // Re-verify to ensure state is synced
          setView('dashboard');
        }} onRegister={() => setView('register')} />;
      case 'register':
        return <Register onRegister={() => setView('login')} onLogin={() => setView('login')} />;
      case 'dashboard':
        return (
          <Dashboard 
            onSelectProject={(id) => {
              if (id === -1) {
                setView('create');
              } else {
                setSelectedProjectId(id);
                setView('details');
              }
            }} 
            onLogout={() => {
              localStorage.removeItem('access_token');
              setView('login');
            }}
          />
        );
      case 'create':
        return (
          <CreateProject 
            onBack={() => setView('dashboard')} 
            onCreated={() => setView('dashboard')} 
          />
        );
      case 'details':
        return (
          <ProjectDetails 
            projectId={selectedProjectId!} 
            onBack={() => setView('dashboard')} 
          />
        );
      default:
        return <Login onLogin={() => setView('dashboard')} onRegister={() => setView('register')} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-emerald-500/30">
      {renderView()}
    </div>
  );
}
