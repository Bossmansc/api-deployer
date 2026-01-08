import React, { useState, useEffect } from 'react';
import { LayoutDashboard, LogOut, User } from 'lucide-react';
import { api } from './src/utils/api';

// Components
import Button from './src/components/ui/Button';
import Input from './src/components/ui/Input';
import Dashboard from './src/pages/Dashboard';
import ProjectDetails from './src/pages/ProjectDetails';
import CreateProject from './src/pages/CreateProject';

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('access_token'));
  const [view, setView] = useState<'dashboard' | 'create' | 'project'>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  
  // Auth State
  const [isLogin, setIsLogin] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authData, setAuthData] = useState({ email: '', password: '' });

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
      if (isLogin) {
        const res = await api.auth.login(authData);
        localStorage.setItem('access_token', res.access_token);
        setToken(res.access_token);
      } else {
        await api.auth.register(authData);
        // Auto login after register
        const res = await api.auth.login(authData);
        localStorage.setItem('access_token', res.access_token);
        setToken(res.access_token);
      }
    } catch (err: any) {
      setAuthError(err.detail || 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setToken(null);
    setView('dashboard');
    setSelectedProjectId(null);
  };

  // Auth View
  if (!token) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Cloud Deploy</h1>
            <p className="text-slate-400">Enterprise Grade Deployment Platform</p>
          </div>

          {authError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg mb-6 text-sm">
              {authError}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            <Input 
              label="Email"
              type="email"
              value={authData.email}
              onChange={(e) => setAuthData({...authData, email: e.target.value})}
              required
            />
            <Input 
              label="Password"
              type="password"
              value={authData.password}
              onChange={(e) => setAuthData({...authData, password: e.target.value})}
              required
            />
            <Button type="submit" isLoading={authLoading} className="w-full">
              {isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // App Layout
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-emerald-500/30">
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div 
              className="flex items-center space-x-2 cursor-pointer" 
              onClick={() => { setView('dashboard'); setSelectedProjectId(null); }}
            >
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Cloud Deploy</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-slate-400 flex items-center hidden sm:flex">
                <User className="w-4 h-4 mr-2" />
                {authData.email || 'User'}
              </div>
              <button 
                onClick={logout}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="py-8">
        {selectedProjectId ? (
          <ProjectDetails 
            projectId={selectedProjectId} 
            onBack={() => {
              setSelectedProjectId(null);
              setView('dashboard');
            }}
          />
        ) : view === 'create' ? (
          <CreateProject 
            onBack={() => setView('dashboard')}
            onCreated={() => setView('dashboard')}
          />
        ) : (
          <Dashboard 
            onSelectProject={(id) => {
              if (id === -1) {
                setView('create');
              } else {
                setSelectedProjectId(id);
              }
            }} 
          />
        )}
      </main>
    </div>
  );
}
