import React from 'react';
import { Shield, ShieldAlert, ShieldCheck, Activity, AlertTriangle, RefreshCw } from 'lucide-react';

export const Dashboard: React.FC = () => {
  // Mock metrics for layout visualization
  const metrics = [
    { label: 'Total Scanned Packets', value: '1,245,892', change: '+12.4%', status: 'up', icon: Activity, color: 'text-brand-glow bg-brand-glow/10 border-brand-glow/30' },
    { label: 'Normal Traffic (Benign)', value: '1,241,120', change: '99.6%', status: 'neutral', icon: ShieldCheck, color: 'text-brand-success bg-brand-success/10 border-brand-success/30' },
    { label: 'Attacks Blocked', value: '4,772', change: '0.38%', status: 'danger', icon: ShieldAlert, color: 'text-brand-danger bg-brand-danger/10 border-brand-danger/30' },
    { label: 'Critical Alert Count', value: '8', change: '-25%', status: 'down', icon: AlertTriangle, color: 'text-brand-warning bg-brand-warning/10 border-brand-warning/30' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((card, idx) => (
          <div key={idx} className="cyber-glass p-5 rounded-xl border border-cyber-border hover:border-brand-primary/30 transition-all glow-blue-hover">
            <div className="flex items-center justify-between">
              <div className="text-xs font-mono text-cyber-muted uppercase tracking-wider">{card.label}</div>
              <div className={`p-2 rounded-lg border ${card.color}`}>
                <card.icon size={18} />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <div className="text-2xl font-bold tracking-tight text-white font-mono">{card.value}</div>
              <div className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                card.status === 'up' ? 'text-brand-success bg-brand-success/15' :
                card.status === 'down' ? 'text-brand-success bg-brand-success/15' : // reduction in alerts is good
                card.status === 'danger' ? 'text-brand-danger bg-brand-danger/15' :
                'text-cyber-muted bg-cyber-input'
              }`}>
                {card.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Grid for main dashboard charts placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Threat Logs */}
        <div className="lg:col-span-2 cyber-glass rounded-xl border border-cyber-border p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-cyber-border/40 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center">
              <Shield className="w-4 h-4 text-brand-glow mr-2" /> Live Detection Stream
            </h3>
            <button className="text-xs font-mono text-brand-primary hover:text-brand-glow flex items-center space-x-1">
              <RefreshCw className="w-3 h-3 animate-spin-slow" />
              <span>AUTO REFRESH</span>
            </button>
          </div>
          <div className="h-96 flex flex-col justify-center items-center text-cyber-muted font-mono text-xs">
            <ShieldAlert className="w-12 h-12 text-brand-primary/20 mb-3 animate-pulse" />
            <p>Ready to monitor network flow packets.</p>
            <p className="text-[10px] text-cyber-muted/60 mt-1">Predictions will stream here when API runs.</p>
          </div>
        </div>

        {/* Attack Vector Radar/Breakdown */}
        <div className="cyber-glass rounded-xl border border-cyber-border p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-cyber-border/40 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center">
              <AlertTriangle className="w-4 h-4 text-brand-warning mr-2" /> Attack Vectors
            </h3>
          </div>
          <div className="h-96 flex flex-col justify-center items-center text-cyber-muted font-mono text-xs">
            <div className="w-32 h-32 rounded-full border-4 border-dashed border-cyber-border flex items-center justify-center mb-4">
              <Activity className="w-8 h-8 text-cyber-muted/40 animate-pulse" />
            </div>
            <p>Attack vector distribution graph.</p>
            <p className="text-[10px] text-cyber-muted/60 mt-1">Awaiting flow prediction logs.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
