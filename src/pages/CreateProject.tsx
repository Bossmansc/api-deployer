import React, { useState } from 'react';
import { ArrowLeft, Rocket, AlertCircle, Info, Wifi } from 'lucide-react';
import { api } from '../utils/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

interface Props {
  onBack: () => void;
  onCreated: () => void;
}

export default function CreateProject({ onBack, onCreated }: Props) {
  const [formData, setFormData] = useState({ name: '', github_url: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.projects.create(formData);
      onCreated();
    } catch (err: any) {
      console.error("Create project error:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <button 
        onClick={onBack}
        className="flex items-center text-slate-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back
      </button>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-500">
            <Rocket className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Create Project</h1>
            <p className="text-slate-400">Deploy a new application from GitHub</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mb-6 text-sm">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <div className="w-full">
                <p className="font-semibold break-words">
                  {error.message || "Failed to create project"}
                </p>
                <div className="mt-2 pt-2 border-t border-red-500/20 text-xs font-mono space-y-1 opacity-90">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span>{error.status || 'Network Error'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span>Target URL:</span>
                    <span className="break-all bg-red-950/50 p-1 rounded mt-1">
                      {error.url || api.url}
                    </span>
                  </div>
                  {error.isNetworkError && (
                    <p className="mt-2 text-red-300 italic">
                      Tip: Backend might be down or blocked. Check if port 8000 is active.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input 
            label="Project Name"
            placeholder="my-awesome-app"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            minLength={3}
          />
          
          <Input 
            label="GitHub URL"
            placeholder="https://github.com/username/repo"
            type="url"
            value={formData.github_url}
            onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
            required
          />

          <Button type="submit" isLoading={loading} className="w-full">
            Create Project
          </Button>

          <div className="mt-6 flex items-center justify-center space-x-2 text-xs text-slate-600 bg-slate-950/50 p-2 rounded-lg border border-slate-800">
            <Wifi className={`w-3 h-3 ${error ? 'text-red-500' : 'text-emerald-500'}`} />
            <span>API Target:</span>
            <span className="font-mono text-slate-400 max-w-[200px] truncate" title={api.url}>
              {api.url}
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
