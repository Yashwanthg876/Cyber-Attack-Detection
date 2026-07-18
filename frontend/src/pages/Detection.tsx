import React, { useState } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Play, 
  ShieldAlert, 
  ShieldCheck, 
  Award,
  Sparkles,
  Info
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell,
  ReferenceLine
} from 'recharts';
import { apiService } from '../services/api';

export const Detection: React.FC = () => {
  // Manual Input Form State
  const [form, setForm] = useState({
    flow_duration: '450000',
    packet_count: '15',
    packet_length_mean: '320',
    src_port: '49152',
    dest_port: '80',
    protocol: 'TCP',
    flow_bytes_s: '12000',
    flow_packets_s: '33.3',
    active_mean: '450000',
    idle_mean: '0'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [shapData, setShapData] = useState<any>(null);
  const [batchResult, setBatchResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'report' | 'mitre' | 'shap'>('report');
  const [csvFile, setCsvFile] = useState<File | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSinglePrediction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);
    setShapData(null);
    setBatchResult(null);

    try {
      // Map input to schema types
      const payload = {
        flow_duration: parseFloat(form.flow_duration),
        packet_count: parseInt(form.packet_count),
        packet_length_mean: parseFloat(form.packet_length_mean),
        src_port: parseInt(form.src_port),
        dest_port: parseInt(form.dest_port),
        protocol: form.protocol,
        flow_bytes_s: parseFloat(form.flow_bytes_s),
        flow_packets_s: parseFloat(form.flow_packets_s),
        active_mean: parseFloat(form.active_mean),
        idle_mean: parseFloat(form.idle_mean),
      };

      const res = await apiService.predictSingle(payload);
      setResult(res);
      
      // Fetch SHAP data for prediction
      const shap = await apiService.getShapExplanation(res.prediction);
      setShapData(shap);
      setActiveTab('report');
    } catch (err: any) {
      alert(err.message || 'Single flow evaluation failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // CSV Drag-and-Drop and File parser
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCsvFile(e.target.files[0]);
    }
  };

  const handleBatchPrediction = async () => {
    if (!csvFile) return;
    setIsLoading(true);
    setResult(null);
    setShapData(null);
    setBatchResult(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
        if (lines.length < 2) throw new Error('CSV file is empty or missing data rows.');

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        // Map headers to CSV index
        const indexMap: Record<string, number> = {};
        headers.forEach((header, idx) => {
          indexMap[header] = idx;
        });

        // Parse rows
        const parsedFlows: any[] = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.trim());
          if (cols.length < headers.length) continue;

          const getVal = (field: string, defaultVal: string) => {
            const idx = indexMap[field];
            return idx !== undefined ? cols[idx] : defaultVal;
          };

          parsedFlows.push({
            flow_duration: parseFloat(getVal('flow_duration', '0')),
            packet_count: parseInt(getVal('packet_count', '0')),
            packet_length_mean: parseFloat(getVal('packet_length_mean', '0')),
            src_port: parseInt(getVal('src_port', '0')),
            dest_port: parseInt(getVal('dest_port', '0')),
            protocol: getVal('protocol', 'TCP').toUpperCase(),
            flow_bytes_s: parseFloat(getVal('flow_bytes_s', '0')),
            flow_packets_s: parseFloat(getVal('flow_packets_s', '0')),
            active_mean: parseFloat(getVal('active_mean', '0') || getVal('active_time', '0')),
            idle_mean: parseFloat(getVal('idle_mean', '0') || getVal('idle_time', '0')),
          });
        }

        if (parsedFlows.length === 0) throw new Error('No valid rows could be parsed.');
        
        // Execute batch API
        const res = await apiService.predictBatch(parsedFlows.slice(0, 100)); // Cap batch run size
        setBatchResult(res);
      } catch (err: any) {
        alert(err.message || 'Batch evaluation failed.');
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsText(csvFile);
  };

  // MITRE helper descriptions
  const getMitreCard = (attackType: string) => {
    const defaultMitre = {
      id: 'T1046',
      tech: 'Network Service Discovery',
      mitigation: 'Restricting firewall access and deploying dynamic IPS blocks.',
      desc: 'Active port probing to map endpoints.'
    };
    const details: Record<string, typeof defaultMitre> = {
      'DoS': { id: 'T1498', tech: 'Network Service Denial of Service', mitigation: 'Activating syn cookies and applying rate limit firewalls.', desc: 'Server resource exhaustion attempts.' },
      'DDoS': { id: 'T1498.001', tech: 'Direct Flood DoS', mitigation: 'Leveraging ISP routing scrubbers and WAF cloud blocks.', desc: 'Distributed ingress bandwidth saturation.' },
      'Brute Force': { id: 'T1110', tech: 'Credential Guessing', mitigation: 'Enforcing MFA, locking profiles, locking login trials.', desc: 'High frequency SSH/FTP access tests.' },
      'Port Scan': { id: 'T1046', tech: 'Reconnaissance Discovery', mitigation: 'Enabling port knocking and blocking scanning networks.', desc: 'Target network enumeration.' },
      'Botnet': { id: 'T1071', tech: 'C2 Command Protocol', mitigation: 'Isolating contaminated assets, scrubbing malicious processes.', desc: 'Periodic compromised beaconing activity.' },
      'Web Attack': { id: 'T1190', tech: 'Public Application Exploitation', mitigation: 'Applying sanitizers and deploying active WAF shields.', desc: 'Web request shell injection injections.' },
      'Infiltration': { id: 'T1210', tech: 'Remote Vulnerability Exploitation', mitigation: 'Patching software directories and splitting host segments.', desc: 'Host service compromise execution.' },
    };
    return details[attackType] || defaultMitre;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left Form: Manual Evaluation */}
        <div className="lg:col-span-2 space-y-6">
          <div className="cyber-glass rounded-xl border border-cyber-border p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center border-b border-cyber-border/40 pb-3">
              <Play size={14} className="text-brand-glow mr-2" /> Manual Ingestion
            </h3>
            
            <form onSubmit={handleSinglePrediction} className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-cyber-muted text-[10px] uppercase font-bold">Duration (µs)</label>
                <input type="number" name="flow_duration" value={form.flow_duration} onChange={handleInputChange} className="w-full bg-cyber-input border border-cyber-border px-3 py-2 rounded text-white outline-none focus:border-brand-primary" />
              </div>
              <div className="space-y-1">
                <label className="text-cyber-muted text-[10px] uppercase font-bold">Packet Count</label>
                <input type="number" name="packet_count" value={form.packet_count} onChange={handleInputChange} className="w-full bg-cyber-input border border-cyber-border px-3 py-2 rounded text-white outline-none focus:border-brand-primary" />
              </div>
              <div className="space-y-1">
                <label className="text-cyber-muted text-[10px] uppercase font-bold">Avg Packet Length</label>
                <input type="number" name="packet_length_mean" value={form.packet_length_mean} onChange={handleInputChange} className="w-full bg-cyber-input border border-cyber-border px-3 py-2 rounded text-white outline-none focus:border-brand-primary" />
              </div>
              <div className="space-y-1">
                <label className="text-cyber-muted text-[10px] uppercase font-bold">Protocol</label>
                <select name="protocol" value={form.protocol} onChange={handleInputChange} className="w-full bg-cyber-input border border-cyber-border px-3 py-2 rounded text-white outline-none focus:border-brand-primary">
                  <option value="TCP">TCP</option>
                  <option value="UDP">UDP</option>
                  <option value="ICMP">ICMP</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-cyber-muted text-[10px] uppercase font-bold">Source Port</label>
                <input type="number" name="src_port" value={form.src_port} onChange={handleInputChange} className="w-full bg-cyber-input border border-cyber-border px-3 py-2 rounded text-white outline-none focus:border-brand-primary" />
              </div>
              <div className="space-y-1">
                <label className="text-cyber-muted text-[10px] uppercase font-bold">Dest Port</label>
                <input type="number" name="dest_port" value={form.dest_port} onChange={handleInputChange} className="w-full bg-cyber-input border border-cyber-border px-3 py-2 rounded text-white outline-none focus:border-brand-primary" />
              </div>
              <div className="space-y-1">
                <label className="text-cyber-muted text-[10px] uppercase font-bold">Flow Bytes/s</label>
                <input type="number" name="flow_bytes_s" value={form.flow_bytes_s} onChange={handleInputChange} className="w-full bg-cyber-input border border-cyber-border px-3 py-2 rounded text-white outline-none focus:border-brand-primary" />
              </div>
              <div className="space-y-1">
                <label className="text-cyber-muted text-[10px] uppercase font-bold">Flow Packets/s</label>
                <input type="number" name="flow_packets_s" value={form.flow_packets_s} onChange={handleInputChange} className="w-full bg-cyber-input border border-cyber-border px-3 py-2 rounded text-white outline-none focus:border-brand-primary" />
              </div>
              <div className="col-span-2 pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-2.5 rounded transition-all shadow-glow-blue flex items-center justify-center space-x-2 text-xs uppercase"
                >
                  {isLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <span>Scan Flow Header</span>}
                </button>
              </div>
            </form>
          </div>

          {/* Right Input: CSV File uploader */}
          <div className="cyber-glass rounded-xl border border-cyber-border p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center border-b border-cyber-border/40 pb-3">
              <UploadCloud size={14} className="text-brand-purple mr-2" /> CSV Bulk Scanner
            </h3>
            <div className="border border-dashed border-cyber-border rounded-lg p-6 text-center cursor-pointer bg-cyber-input/20 hover:border-brand-purple/50 transition-all relative">
              <input type="file" accept=".csv" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
              <FileText size={32} className="text-cyber-muted mx-auto mb-2" />
              <span className="text-[10px] font-mono text-white block truncate">{csvFile ? csvFile.name : 'Select network_traffic_sample.csv'}</span>
            </div>
            {csvFile && (
              <button
                onClick={handleBatchPrediction}
                disabled={isLoading}
                className="w-full bg-brand-purple hover:bg-brand-purple/90 text-white font-bold py-2.5 rounded transition-all shadow-glow-blue flex items-center justify-center space-x-2 text-xs uppercase font-mono"
              >
                <span>Process CSV Logs</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Panel: Results Display */}
        <div className="lg:col-span-3">
          {/* Default Empty State */}
          {!result && !batchResult && (
            <div className="h-full min-h-[480px] cyber-glass rounded-xl border border-cyber-border flex flex-col justify-center items-center text-center p-8 font-mono text-xs text-cyber-muted">
              <ShieldAlert className="w-16 h-16 text-brand-primary/10 mb-4 animate-pulse" />
              <h3 className="text-white font-bold uppercase tracking-wider text-sm">Ensemble Engine Status: Idle</h3>
              <p className="max-w-xs mt-2 leading-relaxed">
                Ingest threat flow inputs manually on the left panel or drop a network flow log sheet (.csv) to initialize security checks.
              </p>
            </div>
          )}

          {/* Single prediction result details */}
          {result && (
            <div className="cyber-glass rounded-xl border border-cyber-border p-6 space-y-6 min-h-[480px] flex flex-col justify-between">
              <div>
                {/* Headers */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-cyber-border/40 pb-4 gap-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      result.prediction === 'Benign' ? 'bg-brand-success/20 text-brand-success' : 'bg-brand-danger/20 text-brand-danger'
                    }`}>
                      {result.prediction === 'Benign' ? <ShieldCheck size={22} /> : <ShieldAlert size={22} />}
                    </div>
                    <div>
                      <div className="text-[10px] font-mono text-cyber-muted uppercase font-bold">Threat Evaluation</div>
                      <h4 className="text-lg font-bold font-mono text-white tracking-wider uppercase">{result.prediction}</h4>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 font-mono text-xs">
                    <span className="text-cyber-muted uppercase font-bold">Severity:</span>
                    <span className={`px-2 py-0.5 rounded font-black tracking-wider uppercase ${
                      result.severity === 'Critical' ? 'bg-brand-danger text-white animate-pulse' :
                      result.severity === 'High' ? 'bg-brand-warning/20 text-brand-warning' :
                      result.severity === 'Medium' ? 'bg-brand-primary/20 text-brand-glow' : 'bg-cyber-input text-cyber-muted'
                    }`}>
                      {result.severity}
                    </span>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 border-b border-cyber-border/20 mt-4 text-[10px] font-mono font-bold tracking-wider uppercase">
                  <button onClick={() => setActiveTab('report')} className={`px-3 py-2 border-b-2 transition-colors ${activeTab === 'report' ? 'border-brand-glow text-white' : 'border-transparent text-cyber-muted'}`}>Report Summary</button>
                  {result.prediction !== 'Benign' && (
                    <>
                      <button onClick={() => setActiveTab('mitre')} className={`px-3 py-2 border-b-2 transition-colors ${activeTab === 'mitre' ? 'border-brand-glow text-white' : 'border-transparent text-cyber-muted'}`}>MITRE ATT&CK</button>
                      <button onClick={() => setActiveTab('shap')} className={`px-3 py-2 border-b-2 transition-colors ${activeTab === 'shap' ? 'border-brand-glow text-white' : 'border-transparent text-cyber-muted'}`}>XAI (SHAP Weights)</button>
                    </>
                  )}
                </div>

                {/* Tab 1: General Report */}
                {activeTab === 'report' && (
                  <div className="space-y-6 mt-6 font-mono text-xs">
                    {/* Gauges */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-cyber-input/40 border border-cyber-border p-4 rounded-lg text-center">
                        <div className="text-[10px] text-cyber-muted uppercase font-bold mb-1">Classifier Confidence</div>
                        <div className="text-2xl font-bold text-white">{(result.confidence * 100).toFixed(1)}%</div>
                      </div>
                      <div className="bg-cyber-input/40 border border-cyber-border p-4 rounded-lg text-center">
                        <div className="text-[10px] text-cyber-muted uppercase font-bold mb-1">Risk Score</div>
                        <div className="text-2xl font-bold text-brand-danger">{result.risk_score}<span className="text-xs text-cyber-muted">/100</span></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-white font-bold uppercase tracking-wider flex items-center">
                        <Info size={13} className="text-brand-glow mr-1" /> Threat Intelligence Context
                      </div>
                      <p className="text-cyber-muted leading-relaxed text-[11px] bg-cyber-input/20 border border-cyber-border/40 p-3 rounded">
                        {getMitreCard(result.prediction).desc}
                      </p>
                    </div>
                  </div>
                )}

                {/* Tab 2: MITRE MAPPING */}
                {activeTab === 'mitre' && (
                  <div className="space-y-4 mt-6 font-mono text-xs">
                    <div className="flex items-center space-x-2 text-white font-bold uppercase tracking-wider">
                      <Award size={14} className="text-brand-purple" />
                      <span>MITRE ATT&CK Vector Alignment</span>
                    </div>

                    <div className="p-4 bg-cyber-input/30 border border-cyber-border/55 rounded-xl space-y-3">
                      <div>
                        <span className="text-[10px] text-cyber-muted uppercase font-bold block">Technique ID</span>
                        <span className="text-brand-glow font-bold">{getMitreCard(result.prediction).id}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-cyber-muted uppercase font-bold block">Technique Name</span>
                        <span className="text-white font-bold">{getMitreCard(result.prediction).tech}</span>
                      </div>
                      <div className="pt-2 border-t border-cyber-border/20">
                        <span className="text-[10px] text-brand-warning uppercase font-bold block">Recommended Mitigation Action</span>
                        <span className="text-cyber-muted mt-1 block leading-relaxed">{getMitreCard(result.prediction).mitigation}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 3: SHAP explainability */}
                {activeTab === 'shap' && shapData && (
                  <div className="space-y-4 mt-6">
                    <div className="flex items-center space-x-2 text-white font-bold uppercase tracking-wider font-mono text-xs">
                      <Sparkles size={14} className="text-brand-glow" />
                      <span>SHAP Explainability Vectors (XAI)</span>
                    </div>
                    
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={shapData.top_features}
                          layout="vertical"
                          margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                        >
                          <XAxis type="number" stroke="#94A3B8" fontSize={9} />
                          <YAxis dataKey="feature" type="category" stroke="#94A3B8" fontSize={10} width={100} />
                          <Tooltip contentStyle={{ backgroundColor: '#0F1626', borderColor: '#1E293B', borderRadius: 8 }} />
                          <ReferenceLine x={0} stroke="#1E293B" />
                          <Bar dataKey="weight">
                            {shapData.top_features.map((entry: any, index: number) => {
                              const isPositive = entry.weight > 0;
                              return (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={isPositive ? '#EF4444' : '#10B981'} 
                                />
                              );
                            })}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="bg-cyber-input/20 border border-cyber-border/40 p-3 rounded text-[10px] font-mono text-cyber-muted">
                      <p className="font-bold text-white uppercase mb-1">Interpretation Note</p>
                      * Red bars (Positive SHAP) indicate features that directly pushed the AI to flag the flow as an attack.
                      * Green bars (Negative SHAP) indicate features that suppressed the alarm.
                    </div>
                  </div>
                )}

              </div>
              <div className="border-t border-cyber-border/20 pt-4 flex items-center justify-between text-[10px] font-mono text-cyber-muted">
                <span>Ingestion Model: XGB + RF + LSTM</span>
                <span className="flex items-center text-brand-success"><span className="w-1.5 h-1.5 rounded-full bg-brand-success mr-1 animate-ping"></span>Logged to database history</span>
              </div>
            </div>
          )}

          {/* Batch csv prediction result details */}
          {batchResult && (
            <div className="cyber-glass rounded-xl border border-cyber-border p-6 space-y-6 min-h-[480px]">
              <div>
                <div className="flex items-center justify-between border-b border-cyber-border/40 pb-4 mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center">
                      <FileText size={16} className="text-brand-purple mr-2" /> Bulk Scan Report
                    </h3>
                    <p className="text-[10px] text-cyber-muted font-mono mt-0.5">Parsed CSV prediction results summary</p>
                  </div>
                  <span className="text-xs font-mono bg-brand-purple/20 border border-brand-purple/50 px-2 py-0.5 rounded text-white font-bold">
                    BATCH COMPLETE
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 font-mono text-xs text-center mb-6">
                  <div className="bg-cyber-input/40 border border-cyber-border p-3 rounded-lg">
                    <div className="text-[9px] text-cyber-muted uppercase font-bold">Processed</div>
                    <div className="text-lg font-bold text-white mt-1">{batchResult.total_processed}</div>
                  </div>
                  <div className="bg-brand-danger/10 border border-brand-danger/30 p-3 rounded-lg">
                    <div className="text-[9px] text-brand-danger uppercase font-bold">Malicious</div>
                    <div className="text-lg font-bold text-brand-danger mt-1">{batchResult.attacks_detected}</div>
                  </div>
                  <div className="bg-cyber-input/40 border border-cyber-border p-3 rounded-lg">
                    <div className="text-[9px] text-cyber-muted uppercase font-bold">Avg Risk</div>
                    <div className="text-lg font-bold text-brand-warning mt-1">{batchResult.risk_average}<span className="text-[9px] text-cyber-muted">/100</span></div>
                  </div>
                </div>

                {/* Table of batch elements */}
                <div className="overflow-y-auto max-h-72 border border-cyber-border/50 rounded-lg">
                  <table className="w-full text-left font-mono text-[11px] divide-y divide-cyber-border/30">
                    <thead className="bg-cyber-input/50 sticky top-0">
                      <tr className="text-cyber-muted">
                        <th className="p-2.5 font-bold uppercase">#</th>
                        <th className="p-2.5 font-bold uppercase">Classification</th>
                        <th className="p-2.5 font-bold uppercase">Confidence</th>
                        <th className="p-2.5 font-bold uppercase">Risk</th>
                        <th className="p-2.5 font-bold uppercase">Severity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cyber-border/20 text-white">
                      {batchResult.predictions.map((pred: any, idx: number) => (
                        <tr key={idx} className="hover:bg-cyber-input/20 transition-colors">
                          <td className="p-2.5 text-cyber-muted">{idx + 1}</td>
                          <td className="p-2.5 font-bold">
                            <span className={pred.prediction === 'Benign' ? 'text-brand-success' : 'text-brand-danger'}>
                              {pred.prediction}
                            </span>
                          </td>
                          <td className="p-2.5">{(pred.confidence * 100).toFixed(0)}%</td>
                          <td className="p-2.5">{pred.risk_score}</td>
                          <td className="p-2.5 font-semibold">
                            <span className={
                              pred.severity === 'Critical' ? 'text-brand-danger' :
                              pred.severity === 'High' ? 'text-brand-warning' :
                              pred.severity === 'Medium' ? 'text-brand-glow' : 'text-cyber-muted'
                            }>
                              {pred.severity}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>
              <div className="text-[10px] font-mono text-cyber-muted border-t border-cyber-border/20 pt-4 text-center">
                All malicious flows triggered active alerts in the incident stream.
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
