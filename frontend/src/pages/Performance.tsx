import React from 'react';
import { Cpu, Zap, BarChart2 } from 'lucide-react';

export const Performance: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="cyber-glass p-5 rounded-xl border border-cyber-border space-y-2">
          <div className="flex items-center space-x-2 text-brand-primary">
            <Cpu size={18} />
            <h4 className="text-xs font-bold uppercase font-mono tracking-wider">Random Forest</h4>
          </div>
          <p className="text-2xl font-bold font-mono text-white">98.4% Accuracy</p>
          <div className="text-[10px] text-cyber-muted font-mono">Training: 4.2s | Latency: ~1.2ms</div>
        </div>

        <div className="cyber-glass p-5 rounded-xl border border-cyber-border space-y-2">
          <div className="flex items-center space-x-2 text-brand-glow">
            <Zap size={18} />
            <h4 className="text-xs font-bold uppercase font-mono tracking-wider">XGBoost</h4>
          </div>
          <p className="text-2xl font-bold font-mono text-white">99.1% Accuracy</p>
          <div className="text-[10px] text-cyber-muted font-mono">Training: 7.8s | Latency: ~0.8ms</div>
        </div>

        <div className="cyber-glass p-5 rounded-xl border border-cyber-border space-y-2">
          <div className="flex items-center space-x-2 text-brand-purple">
            <Cpu size={18} />
            <h4 className="text-xs font-bold uppercase font-mono tracking-wider">LSTM (Deep Learning)</h4>
          </div>
          <p className="text-2xl font-bold font-mono text-white">99.5% Accuracy</p>
          <div className="text-[10px] text-cyber-muted font-mono">Training: 42.5s | Latency: ~5.4ms</div>
        </div>
      </div>

      <div className="cyber-glass rounded-xl border border-cyber-border p-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono mb-4 flex items-center">
          <BarChart2 className="w-4 h-4 text-brand-glow mr-2" /> Accuracy & Loss Curve Over Epochs
        </h3>
        <div className="h-64 flex items-center justify-center text-xs font-mono text-cyber-muted border border-dashed border-cyber-border/40 rounded-lg">
          Training epoch charts will render here.
        </div>
      </div>
    </div>
  );
};
