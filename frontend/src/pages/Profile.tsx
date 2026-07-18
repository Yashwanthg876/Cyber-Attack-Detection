import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Shield } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="cyber-glass rounded-xl border border-cyber-border p-6 space-y-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center border-b border-cyber-border/40 pb-3">
          <User className="w-4 h-4 text-brand-primary mr-2" /> Analyst Profile
        </h3>

        <div className="flex items-center space-x-6">
          <div className="w-16 h-16 rounded-xl bg-brand-primary/20 border border-brand-primary/45 flex items-center justify-center font-bold text-white text-2xl shadow-glow-blue">
            {(user?.username || 'SA')[0].toUpperCase()}
          </div>
          <div className="space-y-1">
            <h4 className="text-lg font-bold text-white font-mono">{user?.username || 'Security Analyst'}</h4>
            <div className="flex items-center space-x-2 text-xs font-mono">
              <Shield size={12} className="text-brand-glow" />
              <span className="text-brand-glow font-bold uppercase">
                {user?.role === 'admin' ? 'Super Administrator' : 'Tier 1 Analyst'}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4 border-t border-cyber-border/20 pt-6 font-mono text-xs">
          <div className="grid grid-cols-3 py-2 border-b border-cyber-border/20">
            <span className="text-cyber-muted uppercase font-bold">Clearance Email:</span>
            <span className="col-span-2 text-white">{user?.email || 'analyst@aegis.local'}</span>
          </div>
          <div className="grid grid-cols-3 py-2 border-b border-cyber-border/20">
            <span className="text-cyber-muted uppercase font-bold">Clearance Level:</span>
            <span className="col-span-2 text-white">{user?.role === 'admin' ? 'Level 5 (Admin)' : 'Level 2 (Read-Write)'}</span>
          </div>
          <div className="grid grid-cols-3 py-2">
            <span className="text-cyber-muted uppercase font-bold">Enrollment Date:</span>
            <span className="col-span-2 text-white">2026-07-18 UTC</span>
          </div>
        </div>
      </div>
    </div>
  );
};
