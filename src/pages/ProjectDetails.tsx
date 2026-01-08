import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, Github, Terminal, CheckCircle2 } from 'lucide-react';
import { api } from '../utils/api';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';

interface Props {
  projectId: number;
  onBack: () => void;
}

export default function ProjectDetails({ projectId, onBack }: Props) {
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deploying, setDeploying] = useState(false);
  const [activeDeployment, setActiveDeployment] = useState<any>(null);

  const fetchProject = async () => {
    try {
      const data = await api.projects.get(projectId);
      setProject(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  // Poll for logs if there is an active deployment that isn't finished
  useEffect(() => {
    let interval: any;
    if (activeDeployment && !['success', 'failed', 'cancelled'].includes(activeDeployment.status)) {
      interval = setInterval(async () => {
        try {
          // Refresh deployment status
          const data = await api.projects.get(projectId);
          const updatedDeployment = data.deployments.find((d: any) => d.id === activeDeployment.id);
          if (updatedDeployment) {
             setActiveDeployment(updatedDeployment);
          }
        } catch (e) { console.error(e) }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [activeDeployment, projectId]);


  const handleDeploy = async () => {
    setDeploying(true);
    try {
      const deployment = await api.projects.deploy(projectId);
      setActiveDeployment(deployment);
      fetchProject(); // Refresh list
    } catch (err) {
      console.error(err);
      alert('Failed to trigger deployment');
    } finally {
      setDeploying(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-slate-400">Loading details...</div>;
  if (!project) return <div className="p-10 text-center text-red-400">Project not found</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <button 
        onClick={onBack}
        className="flex items-center text-slate-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{project.name}</h1>
                <div className="flex items-center text-slate-400 space-x-4">
                  <span className="flex items-center">
                    <Github className="w-4 h-4 mr-2" />
                    {project.github_url}
                  </span>
                  <StatusBadge status={project.status} />
                </div>
              </div>
              <Button onClick={handleDeploy} isLoading={deploying}>
                <Play className="w-4 h-4 mr-2" /> Deploy Now
              </Button>
            </div>
            
            <div className="bg-slate-950 rounded-lg p-4 font-mono text-sm text-slate-300 border border-slate-800">
              <div className="flex items-center text-slate-500 mb-2 pb-2 border-b border-slate-800">
                <Terminal className="w-4 h-4 mr-2" />
                Latest Logs
              </div>
              <div className="whitespace-pre-wrap h-64 overflow-y-auto">
                {activeDeployment 
                  ? activeDeployment.logs 
                  : project.deployments?.[0]?.logs || "No logs available"}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Deployment History</h3>
            <div className="space-y-4">
              {project.deployments?.slice().reverse().map((deploy: any) => (
                <div 
                  key={deploy.id}
                  onClick={() => setActiveDeployment(deploy)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    activeDeployment?.id === deploy.id 
                      ? 'bg-emerald-500/10 border-emerald-500/50' 
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <StatusBadge status={deploy.status} />
                    <span className="text-xs text-slate-500">
                      {new Date(deploy.started_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">
                    ID: {deploy.id}
                  </div>
                </div>
              ))}
              {(!project.deployments || project.deployments.length === 0) && (
                <p className="text-center text-slate-500 text-sm py-4">No deployments yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
