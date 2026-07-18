import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  CheckCircle,
  Eye,
  RefreshCw,
  FolderOpen,
  Search
} from 'lucide-react';
import { apiService } from '../services/api';

export const Alerts: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('ALL');

  const fetchAlerts = async () => {
    try {
      const response = await apiService.getDashboardData();
      setAlerts(response.recent_alerts);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleResolve = (id: number) => {
    setAlerts(prev => 
      prev.map(a => a.id === id ? { ...a, status: 'Resolved' } : a)
    );
  };

  const handleInvestigate = (id: number) => {
    setAlerts(prev => 
      prev.map(a => a.id === id ? { ...a, status: 'Investigating' } : a)
    );
  };

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col justify-center items-center font-mono text-sm text-brand-primary">
        <Bell className="w-12 h-12 animate-spin mb-4 text-brand-glow" />
        <span>LOADING ACTIVE INCIDENT STREAM...</span>
      </div>
    );
  }

  // Statistics counters
  const criticalCount = alerts.filter(a => a.severity === 'Critical').length;
  const highCount = alerts.filter(a => a.severity === 'High').length;
  const mediumCount = alerts.filter(a => a.severity === 'Medium').length;
  const lowCount = alerts.filter(a => a.severity === 'Low').length;

  // Search & Filter execution
  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.attack_type.toLowerCase().includes(search.toLowerCase()) || 
                          alert.description.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterLevel === 'ALL' || alert.severity === filterLevel;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Level counters grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div 
          onClick={() => setFilterLevel('Critical')}
          className={`border rounded-xl p-4 font-mono text-center cursor-pointer transition-all ${
            filterLevel === 'Critical' ? 'bg-brand-danger/25 border-brand-danger shadow-glow-red' : 'bg-brand-danger/10 border-brand-danger/30 hover:bg-brand-danger/20'
          }`}
        >
          <div className="text-2xl font-bold text-brand-danger">{criticalCount}</div>
          <div className="text-[10px] text-cyber-muted uppercase mt-1">Critical Severity</div>
        </div>

        <div 
          onClick={() => setFilterLevel('High')}
          className={`border rounded-xl p-4 font-mono text-center cursor-pointer transition-all ${
            filterLevel === 'High' ? 'bg-brand-warning/25 border-brand-warning shadow-glow-red' : 'bg-brand-warning/10 border-brand-warning/30 hover:bg-brand-warning/20'
          }`}
        >
          <div className="text-2xl font-bold text-brand-warning">{highCount}</div>
          <div className="text-[10px] text-cyber-muted uppercase mt-1">High Level</div>
        </div>

        <div 
          onClick={() => setFilterLevel('Medium')}
          className={`border rounded-xl p-4 font-mono text-center cursor-pointer transition-all ${
            filterLevel === 'Medium' ? 'bg-brand-primary/25 border-brand-primary shadow-glow-blue' : 'bg-brand-primary/10 border-brand-primary/30 hover:bg-brand-primary/20'
          }`}
        >
          <div className="text-2xl font-bold text-brand-glow">{mediumCount}</div>
          <div className="text-[10px] text-cyber-muted uppercase mt-1">Medium Risk</div>
        </div>

        <div 
          onClick={() => setFilterLevel('Low')}
          className={`border rounded-xl p-4 font-mono text-center cursor-pointer transition-all ${
            filterLevel === 'Low' ? 'bg-cyber-input/90 border-cyber-border shadow-glow-blue' : 'bg-cyber-input/40 border-cyber-border/40 hover:bg-cyber-input/60'
          }`}
        >
          <div className="text-2xl font-bold text-cyber-muted">{lowCount}</div>
          <div className="text-[10px] text-cyber-muted uppercase mt-1">Low Danger</div>
        </div>
      </div>

      {/* Filter and search operations bar */}
      <div className="cyber-glass rounded-xl border border-cyber-border p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-muted w-4 h-4" />
          <input
            type="text"
            placeholder="Search incident descriptions, signatures..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-cyber-input border border-cyber-border rounded-xl pl-9 pr-4 py-2 outline-none text-xs font-mono text-white focus:border-brand-primary focus:shadow-glow-blue transition-all"
          />
        </div>
        
        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <button 
            onClick={() => { setFilterLevel('ALL'); setSearch(''); }}
            className="flex items-center space-x-1.5 px-3 py-2 bg-cyber-input border border-cyber-border rounded-xl text-xs font-mono text-cyber-muted hover:text-white transition-colors"
          >
            <span>RESET FILTERS</span>
          </button>
        </div>
      </div>

      {/* Main Alerts Registry List */}
      <div className="cyber-glass rounded-xl border border-cyber-border p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-cyber-border/40 pb-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center">
            <Bell className="w-4 h-4 text-brand-primary mr-2" /> Active SOC Alerts Registry
          </h3>
          <button onClick={fetchAlerts} className="text-xs font-mono text-brand-primary hover:text-brand-glow flex items-center space-x-1">
            <RefreshCw className="w-3 h-3" />
            <span>SYNC DATA</span>
          </button>
        </div>

        {/* Warning Logs Grid */}
        {filteredAlerts.length === 0 ? (
          <div className="h-64 flex flex-col justify-center items-center font-mono text-xs text-cyber-muted">
            <FolderOpen className="w-12 h-12 text-cyber-muted/20 mb-3 animate-pulse" />
            <p>No incidents match query constraints.</p>
          </div>
        ) : (
          <div className="space-y-3 font-mono text-xs">
            {filteredAlerts.map((alert) => (
              <div key={alert.id} className="p-4 bg-cyber-input/20 border border-cyber-border/50 rounded-xl hover:border-brand-primary/30 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                
                {/* Information */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                      alert.severity === 'Critical' ? 'bg-brand-danger text-white animate-pulse' :
                      alert.severity === 'High' ? 'bg-brand-warning/20 text-brand-warning' :
                      alert.severity === 'Medium' ? 'bg-brand-primary/20 text-brand-glow' : 'bg-cyber-input text-cyber-muted'
                    }`}>
                      {alert.severity}
                    </span>
                    <span className="text-[10px] text-cyber-muted">{alert.timestamp}</span>
                  </div>
                  
                  <div className="text-white font-bold text-sm tracking-wider uppercase">
                    Signature: {alert.attack_type}
                  </div>
                  
                  <div className="text-cyber-muted text-[11px] leading-relaxed">
                    {alert.description}
                  </div>
                </div>

                {/* Operations triggers */}
                <div className="flex items-center space-x-3 w-full sm:w-auto shrink-0 justify-end">
                  <div className="text-right">
                    <span className="text-[10px] border border-cyber-border bg-cyber-input px-2 py-0.5 rounded text-brand-glow font-bold tracking-wider uppercase block">
                      {alert.status}
                    </span>
                  </div>

                  {alert.status === 'Active' && (
                    <button 
                      onClick={() => handleInvestigate(alert.id)}
                      className="p-1.5 rounded-lg border border-cyber-border text-cyber-muted hover:text-brand-glow hover:bg-brand-primary/10 transition-colors"
                      title="Mark Investigating"
                    >
                      <Eye size={14} />
                    </button>
                  )}

                  {alert.status !== 'Resolved' && (
                    <button 
                      onClick={() => handleResolve(alert.id)}
                      className="p-1.5 rounded-lg border border-cyber-border text-cyber-muted hover:text-brand-success hover:bg-brand-success/10 transition-colors"
                      title="Mark Resolved"
                    >
                      <CheckCircle size={14} />
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
