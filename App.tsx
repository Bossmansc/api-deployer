import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, Server, Shield, Database, Activity, Box, Lock, Zap, Cloud, Code, 
  LogOut, Plus, Play, RefreshCw, LayoutDashboard, Settings, Github, AlertCircle, 
  CheckCircle2, XCircle, Loader2, ChevronRight, ArrowLeft
} from 'lucide-react';

const DEFAULT_API_URL = "https://cloud-deploy-api.onrender.com";

interface User {
  id: number;
  email: string;
  is_admin: boolean;
}

interface Project {
  id: number;
  name: string;
  github_url: string;
  status: 'active' | 'inactive' | 'error';
  deployments?: Deployment[];
}

interface Deployment {
  id: number;
  status: 'pending' | 'building' | 'deploying' | 'success' | 'failed' | 'cancelled';
  started_at: string;
  completed_at?: string;
  logs?: string;
}

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('access_token'));
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'landing' | 'login' | 'register' | 'dashboard'>('landing');
  const [notification, setNotification] = useState<{msg: string, type: 'error' | 'success'} | null>(null);
  const [apiUrl, setApiUrl] = useState<string>(() => {
    const saved = localStorage.getItem('api_url');
    if (saved === "http://localhost:8000") return DEFAULT_API_URL;
    return saved || DEFAULT_API_URL;
  });

  useEffect(() => {
    if (token) {
      fetchUser();
      setView('dashboard');
    }
  }, [token, apiUrl]);

  const showNotification = (msg: string, type: 'error' | 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const updateApiUrl = (url: string) => {
    const cleanUrl = url.replace(/\/$/, "");
    localStorage.setItem('api_url', cleanUrl);
    setApiUrl(cleanUrl);
    showNotification("API URL updated", 'success');
  };

  const fetchUser = async () => {
    try {
      const res = await fetch(`${apiUrl}/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else {
        if (res.status === 401) logout();
      }
    } catch (e) {
      console.error("Auth check failed", e);
    }
  };

  const login = (newToken: string) => {
    localStorage.setItem('access_token', newToken);
    setToken(newToken);
    setView('dashboard');
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setToken(null);
    setUser(null);
    setView('landing');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-blue-500/30">
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg border shadow-xl flex items-center gap-2 animate-in slide-in-from-top-2 ${
          notification.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-200' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200'
        }`}>
          {notification.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          {notification.msg}
        </div>
      )}
      {view === 'landing' && (
        <LandingView 
          onLogin={() => setView('login')} 
          onRegister={() => setView('register')} 
          apiUrl={apiUrl}
          onUpdateApiUrl={updateApiUrl}
        />
      )}
      {view === 'login' && <AuthForm mode="login" apiUrl={apiUrl} onBack={() => setView('landing')} onSuccess={login} onError={(m: string) => showNotification(m, 'error')} />}
      {view === 'register' && <AuthForm mode="register" apiUrl={apiUrl} onBack={() => setView('landing')} onSuccess={login} onError={(m: string) => showNotification(m, 'error')} />}
      {view === 'dashboard' && token && (
        <Dashboard 
          token={token} 
          user={user} 
          apiUrl={apiUrl}
          onLogout={logout} 
          onError={(m: string) => showNotification(m, 'error')}
          onSuccess={(m: string) => showNotification(m, 'success')}
        />
      )}
    </div>
  );
}

function Dashboard({ token, user, apiUrl, onLogout, onError, onSuccess }: any) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    fetchProjects();
  }, [refreshTrigger]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/projects/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setProjects(await res.json());
      else {
          if (res.status === 401) onLogout();
          else onError("Failed to load projects");
      }
    } catch (e) {
      onError("Network error connecting to API");
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (name: string, github_url: string) => {
    try {
      const res = await fetch(`${apiUrl}/projects/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, github_url })
      });
      if (res.ok) {
        onSuccess("Project created successfully");
        setRefreshTrigger(prev => prev + 1);
      } else {
        const err = await res.json();
        onError(err.detail || "Failed to create project");
      }
    } catch (e) {
      onError("Network error");
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <Server className="w-5 h-5 text-blue-400" />
            </div>
            <span className="font-bold text-lg tracking-tight">Cloud Deploy</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-400 hidden sm:block">
              Logged in as <span className="text-slate-200">{user?.email}</span>
            </div>
            <button 
              onClick={onLogout}
              className="p-2 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-auto bg-slate-950 p-4 sm:p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <LayoutDashboard className="w-6 h-6 text-indigo-400" />
                Projects
              </h2>
              <NewProjectModal onCreate={createProject} />
            </div>
            {loading && projects.length === 0 ? (
              <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
            ) : projects.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map(project => (
                  <ProjectCard 
                    key={project.id} 
                    project={project} 
                    token={token}
                    apiUrl={apiUrl}
                    onError={onError}
                    onSuccess={onSuccess}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function ProjectCard({ project, token, apiUrl, onError, onSuccess }: { project: Project, token: string, apiUrl: string, onError: any, onSuccess: any }) {
  const [deploying, setDeploying] = useState(false);
  const [activeDeploymentId, setActiveDeploymentId] = useState<number | null>(null);
  const [logs, setLogs] = useState<string>("");
  const [status, setStatus] = useState<Deployment['status']>('pending');
  const pollInterval = useRef<any>(null);

  const triggerDeploy = async () => {
    setDeploying(true);
    setLogs("Initializing deployment...");
    try {
      const res = await fetch(`${apiUrl}/projects/${project.id}/deploy`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const dep = await res.json();
        setActiveDeploymentId(dep.id);
        setStatus('pending');
        onSuccess("Deployment triggered!");
      } else {
        onError("Failed to trigger deployment");
        setDeploying(false);
      }
    } catch (e) {
      onError("Network error");
      setDeploying(false);
    }
  };

  useEffect(() => {
    if (activeDeploymentId) {
      pollInterval.current = setInterval(async () => {
        try {
          const logRes = await fetch(`${apiUrl}/deployments/${activeDeploymentId}/logs`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (logRes.ok) {
            const data = await logRes.json();
            setLogs(data.logs || "");
          }

          const statusRes = await fetch(`${apiUrl}/deployments/${activeDeploymentId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (statusRes.ok) {
            const data = await statusRes.json();
            setStatus(data.status);
            if (['success', 'failed', 'cancelled'].includes(data.status)) {
              setDeploying(false);
              clearInterval(pollInterval.current);
            }
          }
        } catch (e) {
          console.error("Polling error", e);
        }
      }, 1000);
    }
    return () => clearInterval(pollInterval.current);
  }, [activeDeploymentId, apiUrl]);

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all flex flex-col gap-4 group">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20 text-indigo-400">
            <Box className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-medium text-lg text-slate-200">{project.name}</h3>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
              <Github className="w-3 h-3" />
              <span className="truncate max-w-[150px]">{project.github_url.replace('https://github.com/', '')}</span>
            </div>
          </div>
        </div>
        <div className={`px-2 py-0.5 rounded text-xs font-medium border capitalize ${
          project.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'
        }`}>
          {project.status}
        </div>
      </div>

      <div className="mt-auto border-t border-slate-800 pt-4 space-y-3">
        {activeDeploymentId ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                {status === 'pending' || status === 'building' || status === 'deploying' ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : status === 'success' ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                ) : (
                  <XCircle className="w-3 h-3 text-red-400" />
                )}
                <span className="capitalize">{status}...</span>
              </span>
              <span className="font-mono text-slate-600">#{activeDeploymentId}</span>
            </div>
            <div className="bg-slate-950 rounded border border-slate-800 p-2 h-24 overflow-y-auto font-mono text-[10px] text-slate-400 whitespace-pre-wrap scrollbar-thin scrollbar-thumb-slate-700">
              {logs || "Waiting for logs..."}
            </div>
          </div>
        ) : (
          <div className="h-24 flex items-center justify-center border border-dashed border-slate-800 rounded bg-slate-900/20 text-xs text-slate-600">
            No active deployment
          </div>
        )}

        <button 
          onClick={triggerDeploy}
          disabled={deploying}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 rounded-lg text-sm font-medium transition-colors"
        >
          {deploying ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Deploying...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" /> Trigger Deployment
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20 bg-slate-900/20 border border-slate-800 rounded-2xl border-dashed">
      <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-800">
        <Box className="w-8 h-8 text-slate-600" />
      </div>
      <h3 className="text-lg font-medium text-slate-300">No projects yet</h3>
      <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
        Create your first project to start deploying applications to the cloud.
      </p>
    </div>
  );
}

function NewProjectModal({ onCreate }: { onCreate: (name: string, url: string) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(name, url);
    setOpen(false);
    setName('');
    setUrl('');
  };

  if (!open) return (
    <button onClick={() => setOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors">
      <Plus className="w-4 h-4" /> New Project
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <h3 className="text-xl font-semibold mb-4">Create New Project</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Project Name</label>
            <input 
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
              placeholder="my-awesome-app"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">GitHub URL</label>
            <input 
              required
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
              placeholder="https://github.com/username/repo"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setOpen(false)} className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors">Cancel</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors">Create</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AuthForm({ mode, apiUrl, onBack, onSuccess, onError }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
    
    try {
      const res = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        if (mode === 'login') {
          onSuccess(data.access_token);
        } else {
          const loginRes = await fetch(`${apiUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });
          if (loginRes.ok) {
            const loginData = await loginRes.json();
            onSuccess(loginData.access_token);
          } else {
            onSuccess(null); 
          }
        }
      } else {
        onError(data.detail || "Authentication failed");
      }
    } catch (err) {
      onError("Network error. Is the backend running? check API settings.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-300 mb-6 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>
        
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 shadow-xl">
          <div className="mb-6">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl border border-blue-500/20 flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold">{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
            <p className="text-slate-400 text-sm mt-1">
              {mode === 'login' ? 'Enter your credentials to access your dashboard' : 'Get started with your free account'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Email</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
          
           <div className="mt-4 text-center">
            <span className="text-xs text-slate-500">API: <code className="bg-slate-950 px-1 py-0.5 rounded border border-slate-800">{apiUrl}</code></span>
           </div>
        </div>
      </div>
    </div>
  );
}

function LandingView({ onLogin, onRegister, apiUrl, onUpdateApiUrl }: { onLogin: () => void, onRegister: () => void, apiUrl: string, onUpdateApiUrl: (url: string) => void }) {
  const [showSettings, setShowSettings] = useState(false);
  const [tempUrl, setTempUrl] = useState(apiUrl);

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8 space-y-12">
      <nav className="flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <Server className="w-6 h-6 text-blue-400" />
          </div>
          <span className="font-bold text-xl">Cloud Deploy</span>
        </div>
        <div className="flex gap-4 items-center">
          <button onClick={() => setShowSettings(!showSettings)} className="p-2 text-slate-400 hover:text-white transition-colors" title="Settings">
            <Settings className="w-5 h-5" />
          </button>
          <button onClick={onLogin} className="text-slate-300 hover:text-white transition-colors font-medium">Log in</button>
          <button onClick={onRegister} className="px-4 py-2 bg-slate-100 text-slate-900 rounded-lg font-medium hover:bg-white transition-colors">
            Sign up
          </button>
        </div>
      </nav>

      {showSettings && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 animate-in slide-in-from-top-2">
            <h3 className="text-sm font-semibold mb-2 text-slate-300">API Configuration</h3>
            <div className="flex gap-2">
                <input 
                    value={tempUrl}
                    onChange={(e) => setTempUrl(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300"
                    placeholder="https://cloud-deploy-api.onrender.com"
                />
                <button 
                    onClick={() => { onUpdateApiUrl(tempUrl); setShowSettings(false); }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium"
                >
                    Save
                </button>
            </div>
            <p className="text-xs text-slate-500 mt-2">
                If you are running in a cloud workspace (like Codespaces or IDX), replace with the public URL of port 8000.
            </p>
        </div>
      )}

      <div className="text-center space-y-6 py-12 sm:py-20">
        <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent pb-2">
          Deploy Faster. Scale Better.
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Production-ready API Gateway featuring JWT Auth, Database migrations, and real-time deployment logs simulation.
        </p>
        <div className="flex items-center justify-center gap-4 pt-4">
          <button onClick={onRegister} className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold transition-all hover:scale-105 shadow-lg shadow-blue-500/20 flex items-center gap-2">
            Get Started <ChevronRight className="w-4 h-4" />
          </button>
          <button onClick={() => window.open(`${apiUrl}/docs`, '_blank')} className="px-8 py-3 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl font-semibold transition-all hover:bg-slate-800 flex items-center gap-2">
            <Code className="w-4 h-4" /> API Docs
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <FeatureCard icon={<Shield className="text-emerald-400" />} title="Enterprise Security" desc="JWT Authentication, Role-based access control, and secure password hashing." />
        <FeatureCard icon={<Database className="text-blue-400" />} title="SQLAlchemy ORM" desc="Full PostgreSQL integration with Alembic migrations and connection pooling." />
        <FeatureCard icon={<Activity className="text-purple-400" />} title="Real-time Logs" desc="Live deployment status tracking and simulated build logs via API polling." />
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: any) {
  return (
    <div className="p-6 bg-slate-900/30 border border-slate-800/50 rounded-2xl">
      <div className="mb-4 bg-slate-950 w-fit p-3 rounded-xl border border-slate-800">{icon}</div>
      <h3 className="font-semibold text-slate-200 mb-2 text-lg">{title}</h3>
      <p className="text-slate-500 leading-relaxed">{desc}</p>
    </div>
  );
}
