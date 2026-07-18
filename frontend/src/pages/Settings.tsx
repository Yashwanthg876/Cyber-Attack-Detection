import React from 'react';
import { Settings as SettingsIcon, Sliders, Bell } from 'lucide-react';

export const Settings: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="cyber-glass rounded-xl border border-cyber-border p-6 space-y-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center border-b border-cyber-border/40 pb-3">
          <SettingsIcon className="w-4 h-4 text-brand-primary mr-2" /> Global Configurations
        </h3>

        {/* Model Thresholds */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-xs font-bold text-cyber-muted font-mono uppercase">
            <Sliders size={14} className="text-brand-glow" />
            <span>AI Classifier Thresholds</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-6">
            <div className="space-y-2">
              <label className="text-xs text-cyber-muted font-mono flex justify-between">
                <span>Weighted Voting Strictness</span>
                <span className="text-brand-glow font-bold">75%</span>
              </label>
              <input type="range" min="50" max="95" defaultValue="75" className="w-full h-1 bg-cyber-input rounded-lg appearance-none cursor-pointer accent-brand-glow" />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-cyber-muted font-mono flex justify-between">
                <span>Minimum Alert Confidence</span>
                <span className="text-brand-glow font-bold">85%</span>
              </label>
              <input type="range" min="60" max="99" defaultValue="85" className="w-full h-1 bg-cyber-input rounded-lg appearance-none cursor-pointer accent-brand-glow" />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="space-y-4 border-t border-cyber-border/20 pt-6">
          <div className="flex items-center space-x-2 text-xs font-bold text-cyber-muted font-mono uppercase">
            <Bell size={14} className="text-brand-warning" />
            <span>Alert Dispatch Settings</span>
          </div>
          <div className="space-y-3 pl-6 font-mono text-xs text-white">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded border-cyber-border bg-cyber-input text-brand-primary focus:ring-0 w-4 h-4" />
              <span>Dispatch real-time UI banners on Critical level attacks</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded border-cyber-border bg-cyber-input text-brand-primary focus:ring-0 w-4 h-4" />
              <span>Log packet prediction histories to SQLite/PostgreSQL</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
