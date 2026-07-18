import React from 'react';
import { BarChart3, Cpu } from 'lucide-react';

export const Analytics: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="cyber-glass rounded-xl border border-cyber-border p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center border-b border-cyber-border/40 pb-3">
            <BarChart3 className="w-4 h-4 text-brand-primary mr-2" /> Traffic Timeline
          </h3>
          <div className="h-80 flex items-center justify-center text-xs font-mono text-cyber-muted border border-dashed border-cyber-border/40 rounded-lg">
            Daily/Weekly packet volumes will render here via Recharts.
          </div>
        </div>

        <div className="cyber-glass rounded-xl border border-cyber-border p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center border-b border-cyber-border/40 pb-3">
            <Cpu className="w-4 h-4 text-brand-purple mr-2" /> Classifier Performance Metrics
          </h3>
          <div className="h-80 flex items-center justify-center text-xs font-mono text-cyber-muted border border-dashed border-cyber-border/40 rounded-lg">
            Model confusion matrix and ROC curves comparison.
          </div>
        </div>
      </div>
    </div>
  );
};
