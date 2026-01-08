import React, { useState } from 'react';
import { Terminal } from 'lucide-react';
import { api } from '../utils/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

interface Props {
  onRegister: () => void;
  onLogin: () => void;
}

export default function Register({ onRegister, onLogin }: Props) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.auth.register(formData);
      // Auto login after register logic typically happens here, 
      // but for simplicity we'll just redirect to login
      onRegister(); 
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <div className="flex justify-center mb-8">
          <div className="p-4 bg-emerald-500/10 rounded-xl">
            <Terminal className="w-10 h-10 text-emerald-500" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-white text-center mb-2">Create Account</h2>
        <p className="text-slate-400 text-center mb-8">Start deploying in seconds</p>

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
            minLength={8}
          />

          <Button type="submit" isLoading={loading} className="w-full">
            Create Account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <button onClick={onLogin} className="text-emerald-400 hover:text-emerald-300 font-medium">
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
