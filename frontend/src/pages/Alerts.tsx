import React from 'react';
import { Bell, Filter, Search } from 'lucide-react';

export const Alerts: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Alert Level Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-brand-danger/10 border border-brand-danger/30 rounded-xl p-4 font-mono text-center">
          <div className="text-2xl font-bold text-brand-danger">3</div>
          <div className="text-[10px] text-cyber-muted uppercase mt-1">Critical Events</div>
        </div>
        <div className="bg-brand-warning/10 border border-brand-warning/30 rounded-xl p-4 font-mono text-center">
          <div className="text-2xl font-bold text-brand-warning">5</div>
          <div className="text-[10px] text-cyber-muted uppercase mt-1">High Risk</div>
        </div>
        <div className="bg-brand-primary/10 border border-brand-primary/30 rounded-xl p-4 font-mono text-center">
          <div className="text-2xl font-bold text-brand-primary">12</div>
          <div className="text-[10px] text-cyber-muted uppercase mt-1">Medium Risk</div>
        </div>
        <div className="bg-cyber-input border border-cyber-border rounded-xl p-4 font-mono text-center">
          <div className="text-2xl font-bold text-cyber-muted">45</div>
          <div className="text-[10px] text-cyber-muted uppercase mt-1">Low Severity</div>
        </div>
      </div>

      {/* Filter and search bar */}
      <div className="cyber-glass rounded-xl border border-cyber-border p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-muted w-4 h-4" />
          <input
            type="text"
            placeholder="Search incident signatures..."
            className="w-full bg-cyber-input border border-cyber-border rounded-xl pl-9 pr-4 py-2 outline-none text-xs font-mono focus:border-brand-primary/80 focus:shadow-glow-blue transition-all"
          />
        </div>
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button className="flex items-center space-x-1.5 px-3 py-2 bg-cyber-input border border-cyber-border rounded-xl text-xs font-mono text-white hover:border-brand-primary/50 transition-colors">
            <Filter size={12} />
            <span>FILTER LEVEL</span>
          </button>
        </div>
      </div>

      {/* Alerts Table placeholder */}
      <div className="cyber-glass rounded-xl border border-cyber-border p-6">
        <div className="flex items-center justify-between border-b border-cyber-border/40 pb-3 mb-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center">
            <Bell className="w-4 h-4 text-brand-primary mr-2" /> Security Incidents Registry
          </h3>
        </div>
        <div className="h-64 flex items-center justify-center text-xs font-mono text-cyber-muted border border-dashed border-cyber-border/40 rounded-lg">
          No records currently trigger active warnings.
        </div>
      </div>
    </div>
  );
};
