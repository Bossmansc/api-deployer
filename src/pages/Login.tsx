import React, { useState } from 'react';
import { Lock, Mail, Terminal, Settings, Save, Globe, AlertCircle } from 'lucide-react';
import { api } from '../utils/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

interface Props {
  onLogin: () => void;
  onRegister: () => void;
}

export default function Login({ onLogin, onRegister }: Props) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [showSettings, setShowSettings] = useState(false);
  const [customUrl, setCustomUrl] = useState(localStorage.getItem('API_URL_OVERRIDE') || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await api.auth.login(formData);
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      onLogin();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = () => {
    if (customUrl.trim()) {
        localStorage.setItem('API_URL_OVERRIDE', customUrl.trim());
    } else {
        localStorage.removeItem('API_URL_OVERRIDE');
    }
    window.location.reload(); 
  };

  if (showSettings) {
    const currentHref = typeof window !== 'undefined' ? window.location.href : 'unknown';
    const isBlobUrl = currentHref.startsWith('blob:');
    
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
                <div className="flex items-center space-x-2 mb-6 text-white">
                    <Settings className="w-6 h-6 text-emerald-500" />
                    <h2 className="text-xl font-bold">API Configuration</h2>
                </div>
                
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 mb-6 space-y-2">
                    <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Current Browser URL</div>
                    <div className={`text-xs font-mono break-all p-2 rounded border ${
                        isBlobUrl 
                            ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' 
                            : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                    }`}>
                        {currentHref}
                    </div>
                    <div className="text-xs text-slate-400 mt-2">
                        <AlertCircle className="w-3 h-3 inline mr-1" />
                        {isBlobUrl 
                            ? "You're in a sandboxed environment. Enter your backend URL manually below."
                            : "Copy this URL, paste it below, and change port 3000/5173 to 8000."}
                    </div>
                </div>
                
                <div className="space-y-4">
                    <Input 
                        label="Backend URL (Port 8000)"
                        placeholder="https://cloud-deploy-api-m77w.onrender.com"
                        value={customUrl}
                        onChange={(e) => setCustomUrl(e.target.value)}
                    />
                    <div className="flex space-x-3">
                        <Button onClick={saveSettings} className="flex-1">
                            <Save className="w-4 h-4 mr-2" /> Save & Reload
                        </Button>
                        <button 
                            onClick={() => setShowSettings(false)}
                            className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative">
        <button 
            onClick={() => setShowSettings(true)}
            className="absolute top-4 right-4 p-2 text-slate-500 hover:text-emerald-400 transition-colors"
            title="API Settings"
        >
            <Settings className="w-5 h-5" />
        </button>

        <div className="flex justify-center mb-8">
          <div className="p-4 bg-emerald-500/10 rounded-xl">
            <Terminal className="w-10 h-10 text-emerald-500" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-white text-center mb-2">Welcome Back</h2>
        <p className="text-slate-400 text-center mb-8">Sign in to your Cloud Deploy account</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input 
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <Input 
            label="Password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />

          <Button type="submit" isLoading={loading} className="w-full">
            Sign In
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Don't have an account?{' '}
          <button onClick={onRegister} className="text-emerald-400 hover:text-emerald-300 font-medium">
            Create one
          </button>
        </p>

        <div className="mt-8 pt-6 border-t border-slate-800 text-xs text-center text-slate-600">
           Connecting to: <span className="font-mono text-slate-400">{api.url}</span>
        </div>
      </div>
    </div>
  );
}
