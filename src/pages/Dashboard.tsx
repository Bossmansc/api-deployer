import React, { useState, useEffect } from 'react';
import { Plus, Github, ExternalLink, RefreshCw } from 'lucide-react';
import { api } from '../utils/api';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';

interface Project {
  id: number;
  name: string;
  github_url: string;
  status: string;
  created_at: string;
}

export default function Dashboard({ onSelectProject }: { onSelectProject: (id: number) => void }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      const data = await api.projects.list();
      setProjects(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Projects</h1>
          <p className="text-slate-400">Manage and deploy your applications</p>
        </div>
        <Button onClick={() => onSelectProject(-1)}>
          <Plus className="w-4 h-4 mr-2" /> New Project
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-500" />
          <p className="mt-4 text-slate-400">Loading projects...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/50 rounded-xl border border-slate-800 border-dashed">
          <Github className="w-12 h-12 mx-auto text-slate-600 mb-4" />
          <h3 className="text-xl font-medium text-white mb-2">No projects yet</h3>
          <p className="text-slate-400 mb-6">Connect a GitHub repository to get started</p>
          <Button onClick={() => onSelectProject(-1)}>Create Project</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div 
              key={project.id}
              onClick={() => onSelectProject(project.id)}
              className="group bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10 rounded-xl p-6 transition-all cursor-pointer"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-emerald-500/10 group-hover:text-emerald-400 transition-colors">
                  <Github className="w-6 h-6" />
                </div>
                <StatusBadge status={project.status} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">{project.name}</h3>
              <p className="text-sm text-slate-400 truncate mb-4">{project.github_url}</p>
              <div className="flex items-center text-xs text-slate-500 pt-4 border-t border-slate-800">
                <ClockIcon className="w-3 h-3 mr-1" />
                Created {new Date(project.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ClockIcon(props: any) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
