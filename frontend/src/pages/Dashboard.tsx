import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  RefreshCw, 
  Network,
  BellRing
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar 
} from 'recharts';
import { apiService } from '../services/api';

export const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const response = await apiService.getDashboardData();
      setData(response);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    if (!autoRefresh) return;
    const interval = setInterval(fetchDashboardData, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  if (loading || !data) {
    return (
      <div className="h-[70vh] flex flex-col justify-center items-center font-mono text-sm text-brand-primary">
        <Activity className="w-12 h-12 animate-spin mb-4 text-brand-glow drop-shadow-[0_0_8px_rgba(0,240,255,0.4)]" />
        <span>PULLING CYBER ANALYTICS LOGS...</span>
      </div>
    );
  }

  const { metrics, traffic_timeline, attack_distribution, protocol_distribution, recent_alerts } = data;

  // Colors mapping for charts
  const ATTACK_COLORS = ['#EF4444', '#F59E0B', '#8B5CF6', '#3B82F6', '#10B981', '#00F0FF', '#EC4899'];
  const PROTOCOL_COLORS = ['#3B82F6', '#00F0FF', '#8B5CF6'];

  const stats = [
    { 
      label: 'Scanned Packets', 
      value: metrics.total_packets.toLocaleString(), 
      change: '+18.4k/s', 
      trend: 'up', 
      icon: Activity, 
      color: 'text-brand-glow', 
      spark: [
        { v: 100 }, { v: 120 }, { v: 105 }, { v: 140 }, { v: 130 }, { v: 165 }, { v: 184 }
      ] 
    },
    { 
      label: 'Benign Flows', 
      value: metrics.normal_traffic.toLocaleString(), 
      change: '99.6%', 
      trend: 'neutral', 
      icon: ShieldCheck, 
      color: 'text-brand-success', 
      spark: [
        { v: 98 }, { v: 99 }, { v: 99 }, { v: 99 }, { v: 99.5 }, { v: 99.6 }, { v: 99.6 }
      ] 
    },
    { 
      label: 'Threats Blocked', 
      value: metrics.attacks_detected.toLocaleString(), 
      change: 'Active Protection', 
      trend: 'danger', 
      icon: ShieldAlert, 
      color: 'text-brand-danger', 
      spark: [
        { v: 5 }, { v: 12 }, { v: 8 }, { v: 19 }, { v: 22 }, { v: 15 }, { v: 34 }
      ] 
    },
    { 
      label: 'Critical Warnings', 
      value: metrics.critical_alerts.toString(), 
      change: 'Active Alerts', 
      trend: 'warning', 
      icon: AlertTriangle, 
      color: 'text-brand-warning', 
      spark: [
        { v: 1 }, { v: 3 }, { v: 2 }, { v: 4 }, { v: 5 }, { v: 3 }, { v: 8 }
      ] 
    },
  ];

  return (
    <div className="space-y-6">
      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, idx) => (
          <div key={idx} className="cyber-glass p-5 rounded-xl border border-cyber-border hover:border-brand-primary/30 transition-all duration-300 glow-blue-hover relative overflow-hidden flex flex-col justify-between h-36">
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-mono font-bold text-cyber-muted uppercase tracking-wider">{stat.label}</div>
              <div className="p-2 rounded-lg bg-cyber-input border border-cyber-border">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </div>
            
            <div className="flex items-end justify-between mt-3">
              <div>
                <div className="text-2xl font-bold font-mono text-white tracking-tight leading-none">{stat.value}</div>
                <div className="text-[10px] text-cyber-muted font-mono mt-1 flex items-center">
                  <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                    stat.trend === 'up' ? 'bg-brand-success' :
                    stat.trend === 'danger' ? 'bg-brand-danger animate-pulse' :
                    stat.trend === 'warning' ? 'bg-brand-warning animate-pulse' : 'bg-cyber-muted'
                  }`}></span>
                  {stat.change}
                </div>
              </div>

              {/* Sparkline */}
              <div className="w-20 h-10 shrink-0 opacity-75">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stat.spark}>
                    <Area 
                      type="monotone" 
                      dataKey="v" 
                      stroke={
                        stat.trend === 'up' ? '#00F0FF' : 
                        stat.trend === 'danger' ? '#EF4444' : 
                        stat.trend === 'warning' ? '#F59E0B' : '#10B981'
                      } 
                      fill="transparent" 
                      strokeWidth={1.5} 
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline Chart */}
        <div className="lg:col-span-2 cyber-glass rounded-xl border border-cyber-border p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-cyber-border/40 pb-4 mb-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center">
                <Network className="w-4 h-4 text-brand-glow mr-2" /> Traffic Volume Analysis
              </h3>
              <p className="text-[10px] text-cyber-muted font-mono mt-0.5">Packet ingestion history timeline</p>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`text-[10px] font-mono border px-2.5 py-1 rounded transition-colors flex items-center space-x-1.5 ${
                  autoRefresh 
                    ? 'bg-brand-primary/10 border-brand-primary text-brand-glow' 
                    : 'bg-cyber-input border-cyber-border text-cyber-muted'
                }`}
              >
                <RefreshCw size={10} className={autoRefresh ? 'animate-spin-slow' : ''} />
                <span>{autoRefresh ? 'AUTO' : 'MANUAL'}</span>
              </button>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={traffic_timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBenign" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorMalicious" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#94A3B8" fontSize={10} fontStyle="italic" />
                <YAxis stroke="#94A3B8" fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F1626', borderColor: '#1E293B', borderRadius: 8, color: '#F8FAFC' }}
                  labelStyle={{ fontWeight: 'bold', fontFamily: 'monospace' }}
                />
                <Area type="monotone" dataKey="benign" name="Benign Flows" stroke="#10B981" fillOpacity={1} fill="url(#colorBenign)" strokeWidth={1.5} />
                <Area type="monotone" dataKey="malicious" name="Blocked Threats" stroke="#EF4444" fillOpacity={1} fill="url(#colorMalicious)" strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attack Type Pie Chart */}
        <div className="cyber-glass rounded-xl border border-cyber-border p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center border-b border-cyber-border/40 pb-4 mb-4">
              <ShieldAlert className="w-4 h-4 text-brand-danger mr-2" /> Blocked Attack Types
            </h3>
          </div>
          <div className="h-60 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={attack_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {attack_distribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${entry.name}`} fill={ATTACK_COLORS[index % ATTACK_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F1626', borderColor: '#1E293B', borderRadius: 8, color: '#F8FAFC' }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Label */}
            <div className="absolute text-center">
              <div className="text-xs font-mono text-cyber-muted uppercase font-bold">Risk Level</div>
              <div className="text-2xl font-mono font-black text-brand-danger">CRITICAL</div>
            </div>
          </div>

          {/* Legend Grid */}
          <div className="grid grid-cols-2 gap-2 mt-4 text-[9px] font-mono text-cyber-muted">
            {attack_distribution.slice(0, 4).map((entry: any, index: number) => (
              <div key={entry.name} className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: ATTACK_COLORS[index] }}></span>
                <span className="truncate text-white">{entry.name} ({entry.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Protocols and Live Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Protocol breakdown */}
        <div className="cyber-glass rounded-xl border border-cyber-border p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center border-b border-cyber-border/40 pb-4 mb-4">
              <Network className="w-4 h-4 text-brand-purple mr-2" /> Protocol Metrics
            </h3>
          </div>
          <div className="h-56 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={protocol_distribution} layout="vertical" margin={{ left: -10, right: 10 }}>
                <XAxis type="number" stroke="#94A3B8" fontSize={9} />
                <YAxis dataKey="name" type="category" stroke="#94A3B8" fontSize={10} width={40} />
                <Tooltip contentStyle={{ backgroundColor: '#0F1626', borderColor: '#1E293B', borderRadius: 8 }} />
                <Bar dataKey="value" name="Percentage" radius={[0, 4, 4, 0]}>
                  {protocol_distribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${entry.name}`} fill={PROTOCOL_COLORS[index % PROTOCOL_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[10px] text-cyber-muted font-mono leading-relaxed mt-4">
            Most malicious activity leverages **TCP** sockets (command shells, SYN floods, web injections). DNS hijacking probes occupy **UDP** pathways.
          </div>
        </div>

        {/* Live log entries */}
        <div className="lg:col-span-2 cyber-glass rounded-xl border border-cyber-border p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center border-b border-cyber-border/40 pb-4 mb-4">
              <BellRing className="w-4 h-4 text-brand-warning mr-2 animate-swing" /> Recent Incidents Registry
            </h3>
          </div>

          <div className="overflow-x-auto min-h-60">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="text-cyber-muted border-b border-cyber-border pb-2">
                  <th className="pb-2 font-bold uppercase tracking-wider">Timestamp</th>
                  <th className="pb-2 font-bold uppercase tracking-wider">Threat Type</th>
                  <th className="pb-2 font-bold uppercase tracking-wider">Severity</th>
                  <th className="pb-2 font-bold uppercase tracking-wider">Signature / Payload</th>
                  <th className="pb-2 font-bold uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyber-border/30">
                {recent_alerts.map((alert: any) => (
                  <tr key={alert.id} className="text-white hover:bg-cyber-input/30 transition-colors">
                    <td className="py-2.5 text-cyber-muted">{alert.timestamp.substring(11, 19)}</td>
                    <td className="py-2.5 font-bold">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                        alert.attack_type === 'Benign' ? 'bg-brand-success/15 text-brand-success' : 'bg-brand-danger/15 text-brand-danger'
                      }`}>
                        {alert.attack_type}
                      </span>
                    </td>
                    <td className="py-2.5 font-semibold">
                      <span className={
                        alert.severity === 'Critical' ? 'text-brand-danger animate-pulse' :
                        alert.severity === 'High' ? 'text-brand-warning' :
                        alert.severity === 'Medium' ? 'text-brand-primary' : 'text-cyber-muted'
                      }>
                        {alert.severity}
                      </span>
                    </td>
                    <td className="py-2.5 text-cyber-muted truncate max-w-xs" title={alert.description}>
                      {alert.description}
                    </td>
                    <td className="py-2.5">
                      <span className="text-[10px] border border-cyber-border/80 bg-cyber-input px-1.5 py-0.5 rounded text-brand-glow font-bold tracking-wider">
                        {alert.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
