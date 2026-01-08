import React from 'react';
import { Terminal, Server, Shield, Database, Activity, Box, Lock, Zap, Cloud, Code } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <div className="space-y-6 border-b border-slate-800 pb-10">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 shadow-lg shadow-blue-500/5">
              <Server className="w-10 h-10 text-blue-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-300 bg-clip-text text-transparent">
                Cloud Deploy API Gateway
              </h1>
              <p className="text-slate-400 mt-2 text-lg">
                Production-ready FastAPI backend with JWT Auth, SQLAlchemy, and Redis
              </p>
            </div>
          </div>
        </div>

        {/* Quick Start Guide */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 shadow-xl">
              <h2 className="text-2xl font-semibold flex items-center gap-3 mb-6 text-emerald-400">
                <Terminal className="w-6 h-6" />
                Local & IDX Setup
              </h2>
              <div className="space-y-4">
                <div className="bg-slate-950 rounded-xl p-5 font-mono text-sm border border-slate-800 shadow-inner group">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-3 h-3 rounded-full bg-red-500/50"></span>
                    <span className="w-3 h-3 rounded-full bg-yellow-500/50"></span>
                    <span className="w-3 h-3 rounded-full bg-green-500/50"></span>
                  </div>
                  <div className="text-slate-500 select-none mb-1"># 1. Install dependencies</div>
                  <div className="text-emerald-300 mb-4">$ pip install -r requirements_preview.txt</div>
                  
                  <div className="text-slate-500 select-none mb-1"># 2. Run the server</div>
                  <div className="text-blue-300">$ python run_preview.py</div>
                </div>

                <div className="flex items-start gap-3 text-sm text-amber-400/90 bg-amber-500/10 p-4 rounded-lg border border-amber-500/20">
                  <Zap className="w-5 h-5 shrink-0" />
                  <p>
                    Server running at <code className="bg-amber-500/20 px-1.5 py-0.5 rounded">http://localhost:8000</code>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 shadow-xl">
              <h2 className="text-xl font-semibold flex items-center gap-3 mb-6 text-orange-400">
                <Cloud className="w-6 h-6" />
                Firebase & Render
              </h2>
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 bg-slate-950/50 rounded-lg border border-slate-800 hover:border-orange-500/50 transition-colors">
                    <div className="flex items-center gap-2 mb-2 text-orange-400 font-semibold">
                      <Code className="w-4 h-4" /> Project IDX
                    </div>
                    <p className="text-xs text-slate-500">
                      Files <code>.idx/dev.nix</code> and <code>firebase.json</code> are included for one-click setup in Project IDX.
                    </p>
                 </div>
                 <div className="p-4 bg-slate-950/50 rounded-lg border border-slate-800 hover:border-purple-500/50 transition-colors">
                    <div className="flex items-center gap-2 mb-2 text-purple-400 font-semibold">
                      <Cloud className="w-4 h-4" /> Render
                    </div>
                    <p className="text-xs text-slate-500">
                      Use <code>render.yaml</code> for auto-deployment of DB, Redis, and API.
                    </p>
                 </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
              <h2 className="text-xl font-semibold flex items-center gap-3 mb-6 text-blue-400">
                <Activity className="w-6 h-6" />
                API Endpoints
              </h2>
              <div className="space-y-3">
                <EndpointItem method="GET" path="/" desc="API Info & Health" />
                <EndpointItem method="POST" path="/auth/login" desc="Get Access Token" />
                <EndpointItem method="GET" path="/projects" desc="List User Projects" />
                <EndpointItem method="POST" path="/projects/{id}/deploy" desc="Trigger Deployment" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/20 rounded-2xl p-8">
              <h3 className="text-lg font-semibold text-indigo-300 mb-2">Interactive Documentation</h3>
              <p className="text-indigo-200/60 mb-4 text-sm">
                Once the server is running, access the auto-generated Swagger UI to test endpoints directly.
              </p>
              <a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                Open Swagger UI →
              </a>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="pt-8 border-t border-slate-800">
          <h2 className="text-xl font-semibold mb-8 text-slate-200">System Architecture</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <FeatureCard 
              icon={<Shield className="w-6 h-6 text-emerald-400" />}
              title="Security"
              desc="JWT Authentication, Rate Limiting & Input Validation"
            />
            <FeatureCard 
              icon={<Box className="w-6 h-6 text-pink-400" />}
              title="Projects"
              desc="Complete CRUD operations with GitHub integration"
            />
            <FeatureCard 
              icon={<Database className="w-6 h-6 text-amber-400" />}
              title="Storage"
              desc="SQLAlchemy ORM with Alembic migrations"
            />
            <FeatureCard 
              icon={<Lock className="w-6 h-6 text-cyan-400" />}
              title="Admin"
              desc="Role-based access control & Analytics dashboard"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function EndpointItem({ method, path, desc }: { method: string, path: string, desc: string }) {
  const methodColor = {
    GET: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    POST: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    PUT: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    DELETE: 'text-red-400 bg-red-400/10 border-red-400/20',
  }[method] || 'text-slate-400 bg-slate-400/10';

  return (
    <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800/60 hover:border-slate-700 transition-colors group">
      <div className="flex items-center gap-3">
        <span className={`px-2 py-0.5 rounded text-xs font-bold border ${methodColor} w-16 text-center`}>
          {method}
        </span>
        <span className="font-mono text-sm text-slate-300 group-hover:text-white transition-colors">{path}</span>
      </div>
      <span className="text-xs text-slate-500 hidden sm:block">{desc}</span>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-6 bg-slate-900/30 border border-slate-800/50 rounded-xl hover:bg-slate-800/50 transition-all hover:-translate-y-1 duration-300">
      <div className="mb-4 bg-slate-950 w-fit p-3 rounded-lg border border-slate-800">{icon}</div>
      <h3 className="font-semibold text-slate-200 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
    </div>
  );
}
