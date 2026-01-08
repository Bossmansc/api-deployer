import React, { useState } from 'react';
import { ArrowLeft, Rocket, AlertCircle } from 'lucide-react';
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
  const [error, setError] = useState('');

  const formatError = (err: any) => {
    // Network errors (fetch failure) often result in TypeError: Failed to fetch
    if (err instanceof TypeError && err.message === 'Failed to fetch') {
      return "Unable to connect to backend. Please ensure the backend server is running on port 8000.";
    }

    if (typeof err === 'string') return err;
    
    if (err.detail) {
      if (typeof err.detail === 'string') return err.detail;
      if (Array.isArray(err.detail)) {
        return err.detail.map((e: any) => e.msg || 'Invalid field').join(', ');
      }
    }
    if (err.message) return err.message;
    return 'Failed to create project. Unexpected error.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.projects.create(formData);
      onCreated();
    } catch (err: any) {
      console.error("Create project error:", err);
      setError(formatError(err));
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
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mb-6 text-sm flex items-start">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <span className="break-words">{error}</span>
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
        </form>
      </div>
    </div>
  );
}
