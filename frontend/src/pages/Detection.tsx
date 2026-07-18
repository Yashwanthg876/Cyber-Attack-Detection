import React from 'react';
import { UploadCloud, FileText, Play, AlertCircle } from 'lucide-react';

export const Detection: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="cyber-glass rounded-xl border border-cyber-border p-6 text-center max-w-2xl mx-auto space-y-6">
        <div className="w-16 h-16 rounded-full bg-brand-primary/10 border border-brand-primary/30 flex items-center justify-center mx-auto text-brand-glow shadow-glow-cyan animate-pulse">
          <UploadCloud size={28} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white uppercase tracking-wider font-mono">Upload Traffic Flow Log</h2>
          <p className="text-xs text-cyber-muted mt-2">
            Select a network packet flow dataset in CSV format (aligned with CICIDS2017 schema). The Aegis Ensemble AI engine will evaluate features and classify threats instantly.
          </p>
        </div>

        <div className="border-2 border-dashed border-cyber-border hover:border-brand-primary/50 transition-all rounded-xl p-8 cursor-pointer bg-cyber-input/40 group">
          <FileText size={40} className="text-cyber-muted group-hover:text-brand-glow mx-auto mb-4 transition-colors" />
          <span className="text-xs font-mono font-bold text-white group-hover:text-brand-glow">Drag and drop file here, or browse</span>
          <p className="text-[10px] text-cyber-muted/60 mt-1">CSV file up to 25MB (Flow Duration, Packets, Protocols, etc.)</p>
        </div>

        <button className="bg-brand-primary hover:bg-brand-primary/95 text-white font-mono font-bold py-3 px-6 rounded-xl transition-all shadow-glow-blue flex items-center justify-center space-x-2 mx-auto uppercase text-xs">
          <Play size={14} className="fill-white" />
          <span>Execute Ensemble Engine</span>
        </button>
      </div>

      <div className="cyber-glass rounded-xl border border-cyber-border p-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono mb-4 flex items-center">
          <AlertCircle className="w-4 h-4 text-brand-primary mr-2" /> Evaluation Results
        </h3>
        <div className="h-40 flex items-center justify-center text-xs font-mono text-cyber-muted border border-dashed border-cyber-border/40 rounded-lg">
          No active session. Please upload a network traffic file to initialize inspection.
        </div>
      </div>
    </div>
  );
};
