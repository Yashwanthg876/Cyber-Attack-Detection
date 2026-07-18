import React from 'react';
import { Globe, Cpu, Award } from 'lucide-react';

export const ThreatIntel: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 cyber-glass rounded-xl border border-cyber-border p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center border-b border-cyber-border/40 pb-3">
            <Globe className="w-4 h-4 text-brand-glow mr-2" /> Global Indicators of Compromise (IOC)
          </h3>
          <div className="h-96 flex flex-col justify-center items-center text-cyber-muted font-mono text-xs border border-dashed border-cyber-border/40 rounded-lg">
            <Cpu className="w-12 h-12 text-brand-glow/20 mb-3 animate-pulse" />
            <p>Threat intel indicators feeds loaded.</p>
            <p className="text-[10px] text-cyber-muted/60 mt-1">Connecting to AlienVault OTX, AbuseIPDB...</p>
          </div>
        </div>

        <div className="cyber-glass rounded-xl border border-cyber-border p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center border-b border-cyber-border/40 pb-3">
            <Award className="w-4 h-4 text-brand-purple mr-2" /> MITRE ATT&CK Matrix Mapping
          </h3>
          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 bg-cyber-input rounded-lg border border-cyber-border">
              <div className="text-brand-glow font-bold">T1071.001 - Application Layer Protocol</div>
              <div className="text-[10px] text-cyber-muted mt-1">Used by Command and Control (C2) servers to bypass ingress firewalls.</div>
            </div>
            <div className="p-3 bg-cyber-input rounded-lg border border-cyber-border">
              <div className="text-brand-danger font-bold">T1498 - Network Service Denial of Service</div>
              <div className="text-[10px] text-cyber-muted mt-1">Used to exhaust victim server ports, making application systems unreachable.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
