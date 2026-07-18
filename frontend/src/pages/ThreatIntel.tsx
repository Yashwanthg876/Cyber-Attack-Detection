import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Search, 
  ShieldAlert, 
  MapPin, 
  ExternalLink, 
  Database
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { apiService } from '../services/api';

// Fix leaflet icon paths in react builds
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export const ThreatIntel: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [intel, setIntel] = useState<any>(null);
  
  // IP reputation lookup state
  const [ipQuery, setIpQuery] = useState('');
  const [reputationResult, setReputationResult] = useState<any>(null);
  const [searching, setSearching] = useState(false);

  const fetchIntelData = async () => {
    try {
      const res = await apiService.getThreatIntel();
      setIntel(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntelData();
  }, []);

  const handleIpSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ipQuery.trim()) return;
    setSearching(true);
    setReputationResult(null);

    // Simulate Threat intelligence API delays (VT, AbuseIPDB, GeoIP)
    setTimeout(() => {
      const isThreat = ipQuery.startsWith('185.') || ipQuery.startsWith('80.') || ipQuery.startsWith('91.');
      setReputationResult({
        ip: ipQuery,
        reputation: isThreat ? 'Malicious' : 'Clean',
        score: isThreat ? 92 : 0,
        country: isThreat ? 'Russia' : 'United States',
        asn: isThreat ? 'AS12345 JSC Communications' : 'AS15169 Google LLC',
        isp: isThreat ? 'GlobalTransit' : 'Google Fiber',
        whois: `NetRange:       ${ipQuery.substring(0, 4)}0.0.0 - ${ipQuery.substring(0, 4)}255.255.255\nCIDR:           ${ipQuery.substring(0, 4)}0.0.0/16\nNetName:        AEGIS-SIM-NET\nRegDate:        2012-04-18`,
        vt_score: isThreat ? '14 / 85 engines flag' : '0 / 89 engines flag'
      });
      setSearching(false);
    }, 800);
  };

  if (loading || !intel) {
    return (
      <div className="h-[70vh] flex flex-col justify-center items-center font-mono text-sm text-brand-primary">
        <Globe className="w-12 h-12 animate-spin mb-4 text-brand-glow" />
        <span>PARSING THREAT FEED FEEDS...</span>
      </div>
    );
  }

  // Latitudes and Longitudes of simulated global attack centers for Leaflet map
  const globalThreatCenters = [
    { name: "Shenyang C2 Center", lat: 41.7922, lng: 123.4328, threat: "Mirai Botnet C2", severity: "Critical" },
    { name: "Moscow Proxy Relay", lat: 55.7558, lng: 37.6173, threat: "Hulk DoS Host", severity: "High" },
    { name: "Amsterdam Ingress Node", lat: 52.3676, lng: 4.9041, threat: "SSH Scanner Pool", severity: "Medium" },
    { name: "Frankfurt SQL Scanner", lat: 50.1109, lng: 8.6821, threat: "Web Injection Probe", severity: "High" },
    { name: "Sao Paulo Infiltration IP", lat: -23.5505, lng: -46.6333, threat: "Buffer Overflow Source", severity: "Critical" }
  ];

  return (
    <div className="space-y-6">
      {/* Search Bar for IP Rep check */}
      <div className="cyber-glass rounded-xl border border-cyber-border p-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center border-b border-cyber-border/40 pb-3 mb-4">
          <Search className="w-4 h-4 text-brand-glow mr-2" /> Unified Threat Intelligence Gateway
        </h3>
        
        <form onSubmit={handleIpSearch} className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            required
            placeholder="Search IP, domain or MD5 Hash (e.g. 185.112.42.5)"
            value={ipQuery}
            onChange={(e) => setIpQuery(e.target.value)}
            className="flex-1 bg-cyber-input border border-cyber-border rounded-xl px-4 py-3 outline-none text-xs font-mono text-white focus:border-brand-primary focus:shadow-glow-blue transition-all"
          />
          <button
            type="submit"
            disabled={searching}
            className="bg-brand-primary hover:bg-brand-primary/95 text-white font-mono font-bold px-6 py-3 rounded-xl transition-all shadow-glow-blue text-xs uppercase"
          >
            {searching ? 'Querying feeds...' : 'Inspect Reputation'}
          </button>
        </form>

        {/* IP Query Result Panel */}
        {reputationResult && (
          <div className="mt-6 border border-cyber-border/60 bg-cyber-input/10 rounded-xl p-5 grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs animate-in fade-in duration-300">
            {/* Reputation status */}
            <div className="space-y-4">
              <div className="text-[10px] text-cyber-muted uppercase font-bold">Reputation Class</div>
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  reputationResult.reputation === 'Clean' ? 'bg-brand-success/20 text-brand-success' : 'bg-brand-danger/20 text-brand-danger animate-pulse'
                }`}>
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <div className="text-white font-bold text-sm">{reputationResult.ip}</div>
                  <div className={`text-[10px] font-bold ${reputationResult.reputation === 'Clean' ? 'text-brand-success' : 'text-brand-danger'}`}>
                    {reputationResult.reputation.toUpperCase()} (SCORE: {reputationResult.score})
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-cyber-border/20 space-y-2">
                <div>
                  <span className="text-[9px] text-cyber-muted uppercase">VirusTotal Score</span>
                  <div className="text-white font-semibold mt-0.5">{reputationResult.vt_score}</div>
                </div>
              </div>
            </div>

            {/* Geo Info */}
            <div className="space-y-4 md:border-l md:border-r md:border-cyber-border/20 md:px-6">
              <div className="text-[10px] text-cyber-muted uppercase font-bold">Geographic Intelligence</div>
              <div className="space-y-2.5">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-brand-glow shrink-0" />
                  <span className="text-white">Country: {reputationResult.country}</span>
                </div>
                <div>
                  <span className="text-[9px] text-cyber-muted uppercase">ASN Network ID</span>
                  <div className="text-white mt-0.5">{reputationResult.asn}</div>
                </div>
              </div>
            </div>

            {/* WHOIS records */}
            <div className="space-y-3">
              <div className="text-[10px] text-cyber-muted uppercase font-bold">WHOIS Registry Extract</div>
              <pre className="bg-cyber-card p-3 rounded border border-cyber-border text-[9px] text-cyber-muted leading-relaxed overflow-x-auto whitespace-pre">
                {reputationResult.whois}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Global Map and IOC grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Leaflet map panel */}
        <div className="lg:col-span-2 cyber-glass rounded-xl border border-cyber-border p-6 flex flex-col justify-between">
          <div className="border-b border-cyber-border/40 pb-4 mb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center">
              <Globe className="w-4 h-4 text-brand-glow mr-2 animate-spin-slow" /> Threat Center Live Map
            </h3>
            <p className="text-[10px] text-cyber-muted font-mono mt-0.5">Geolocation of verified command and control nodes</p>
          </div>

          {/* Leaflet Container */}
          <div className="h-80 w-full rounded-xl overflow-hidden border border-cyber-border z-10">
            <MapContainer center={[20, 0]} zoom={2} style={{ height: '100%', width: '100%', background: '#080C14' }}>
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
              />
              {globalThreatCenters.map((marker, idx) => (
                <Marker key={idx} position={[marker.lat, marker.lng]}>
                  <Popup>
                    <div className="font-mono text-xs text-cyber-bg p-1">
                      <div className="font-bold border-b border-cyber-bg/25 pb-1 mb-1">{marker.name}</div>
                      <div>Threat: <span className="text-brand-danger font-semibold">{marker.threat}</span></div>
                      <div>Severity: <span className="font-semibold text-brand-danger">{marker.severity}</span></div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* IOC Feed */}
        <div className="cyber-glass rounded-xl border border-cyber-border p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center border-b border-cyber-border/40 pb-4 mb-4">
              <Database className="w-4 h-4 text-brand-purple mr-2" /> Threat Intelligence Cache
            </h3>
          </div>

          <div className="space-y-4 overflow-y-auto max-h-[300px] pr-2">
            {intel.feed.map((feedItem: any, idx: number) => (
              <div key={idx} className="p-3 bg-cyber-input/40 border border-cyber-border rounded-lg flex items-center justify-between text-xs font-mono">
                <div className="space-y-1">
                  <div className="text-white font-bold tracking-wider">{feedItem.ioc}</div>
                  <div className="text-[9px] text-cyber-muted uppercase">{feedItem.type} • {feedItem.threat}</div>
                </div>
                <div className="text-right space-y-1">
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-brand-danger/10 border border-brand-danger/30 text-brand-danger">
                    {feedItem.reputation.toUpperCase()}
                  </span>
                  <div className="text-[9px] text-cyber-muted mt-1">{feedItem.country}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-cyber-border/20 pt-4 flex items-center justify-between text-[9px] font-mono text-cyber-muted mt-4">
            <span>Refreshed: 15m ago</span>
            <span className="flex items-center text-brand-glow"><ExternalLink size={10} className="mr-1" />AlienVault OTX Connected</span>
          </div>
        </div>

      </div>
    </div>
  );
};
