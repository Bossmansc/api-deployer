import React from 'react';
import { CheckCircle2, XCircle, Clock, Loader2, AlertCircle } from 'lucide-react';

const statusConfig: Record<string, { color: string; icon: any }> = {
  active: { color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle2 },
  success: { color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle2 },
  failed: { color: 'text-red-400 bg-red-500/10 border-red-500/20', icon: XCircle },
  error: { color: 'text-red-400 bg-red-500/10 border-red-500/20', icon: AlertCircle },
  building: { color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', icon: Loader2 },
  deploying: { color: 'text-purple-400 bg-purple-500/10 border-purple-500/20', icon: Loader2 },
  pending: { color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20', icon: Clock },
  inactive: { color: 'text-slate-400 bg-slate-500/10 border-slate-500/20', icon: XCircle },
};

export default function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status.toLowerCase()] || statusConfig.pending;
  const Icon = config.icon;
  const isAnimating = ['building', 'deploying'].includes(status.toLowerCase());

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
      <Icon className={`w-3 h-3 mr-1.5 ${isAnimating ? 'animate-spin' : ''}`} />
      {status.toUpperCase()}
    </span>
  );
}
