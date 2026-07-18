import { Link } from 'react-router-dom';
import { 
  Activity, 
  Globe, 
  Brain, 
  ArrowRight,
  Lock
} from 'lucide-react';

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-cyber-bg text-cyber-text flex flex-col relative cyber-grid overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-glow/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <nav className="h-20 border-b border-cyber-border/40 px-6 sm:px-12 flex items-center justify-between backdrop-blur-md bg-cyber-bg/70 z-30 sticky top-0">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-lg bg-brand-primary/25 border border-brand-primary/50 flex items-center justify-center shadow-glow-blue">
            <Lock className="text-brand-glow w-5 h-5" />
          </div>
          <span className="font-extrabold tracking-widest bg-gradient-to-r from-white to-brand-primary bg-clip-text text-transparent uppercase text-xl font-mono">
            Aegis SOC
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/login" className="text-sm font-medium hover:text-brand-glow transition-colors px-3 py-1.5 font-mono">
            LOG IN
          </Link>
          <Link 
            to="/register" 
            className="text-sm font-medium bg-brand-primary hover:bg-brand-primary/80 text-white px-4 py-2 rounded-lg transition-all shadow-glow-blue hover:scale-[1.02] active:scale-[0.98] font-mono"
          >
            INITIALIZE ANALYST
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 max-w-5xl mx-auto z-10">
        <div className="inline-flex items-center space-x-2 bg-brand-primary/10 border border-brand-primary/30 rounded-full px-4 py-1.5 mb-8 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-brand-glow"></span>
          <span className="text-xs font-semibold tracking-wider text-brand-glow font-mono uppercase">
            AI-Powered Security Operations Center v1.0
          </span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 uppercase leading-tight font-sans">
          Next-Gen Autonomous <br />
          <span className="bg-gradient-to-r from-brand-primary via-brand-glow to-brand-purple bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(0,240,255,0.3)]">
            Cyber Threat Detection
          </span>
        </h1>

        <p className="text-base sm:text-lg text-cyber-muted max-w-2xl mb-12 leading-relaxed">
          Monitor, analyze, and mitigate advanced cyber attacks in real-time. Powering corporate threat intelligence with weighted ensemble classifiers (Random Forest, XGBoost, LSTM) and SHAP explainability.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link 
            to="/register" 
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-brand-primary hover:bg-brand-primary/95 text-white font-bold flex items-center justify-center space-x-2 shadow-glow-blue hover:translate-y-[-2px] transition-all font-mono"
          >
            <span>GET STARTED</span>
            <ArrowRight size={18} />
          </Link>
          <Link 
            to="/login" 
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-cyber-card/80 border border-cyber-border hover:border-brand-primary/50 text-white font-bold flex items-center justify-center space-x-2 transition-all hover:bg-cyber-input/40 font-mono"
          >
            <span>ACCESS SOC CONSOLE</span>
          </Link>
        </div>

        {/* Features Preview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 text-left w-full">
          <div className="cyber-glass p-6 rounded-xl border border-cyber-border hover:border-brand-primary/40 transition-all group">
            <div className="w-12 h-12 rounded-lg bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary mb-4 group-hover:bg-brand-primary/20 transition-all">
              <Brain size={24} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-wide">Ensemble AI Predictor</h3>
            <p className="text-sm text-cyber-muted leading-relaxed">
              Leverages a weighted decision framework of Random Forest, XGBoost, and sequence-based LSTM deep learning to detect packet irregularities.
            </p>
          </div>

          <div className="cyber-glass p-6 rounded-xl border border-cyber-border hover:border-brand-glow/40 transition-all group">
            <div className="w-12 h-12 rounded-lg bg-brand-glow/10 border border-brand-glow/20 flex items-center justify-center text-brand-glow mb-4 group-hover:bg-brand-glow/20 transition-all">
              <Globe size={24} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-wide">Threat Intelligence</h3>
            <p className="text-sm text-cyber-muted leading-relaxed">
              Instantly maps anomalies to standard MITRE ATT&CK techniques. Integrated mitigation flowsheets identify vectors and suggested remedies.
            </p>
          </div>

          <div className="cyber-glass p-6 rounded-xl border border-cyber-border hover:border-brand-purple/40 transition-all group">
            <div className="w-12 h-12 rounded-lg bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center text-brand-purple mb-4 group-hover:bg-brand-purple/20 transition-all">
              <Activity size={24} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-wide">Explainable AI (SHAP)</h3>
            <p className="text-sm text-cyber-muted leading-relaxed">
              Provides absolute transparency into prediction logic, visualizing exact feature weights to avoid security alert fatigue.
            </p>
          </div>
        </div>
      </section>

      {/* Platform Statistics Section */}
      <section className="border-t border-b border-cyber-border/40 bg-cyber-card/20 py-16 z-10">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center font-mono">
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-white">99.8%</div>
            <div className="text-xs text-cyber-muted uppercase tracking-wider mt-2">Ensemble Accuracy</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-brand-glow">&lt; 15ms</div>
            <div className="text-xs text-cyber-muted uppercase tracking-wider mt-2">Inference Latency</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-brand-purple">7+</div>
            <div className="text-xs text-cyber-muted uppercase tracking-wider mt-2">Attack Vector Classes</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-brand-success">100%</div>
            <div className="text-xs text-cyber-muted uppercase tracking-wider mt-2">MITRE ATT&CK Covered</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-cyber-border/30 bg-cyber-bg/95 py-8 text-center text-xs text-cyber-muted font-mono z-10">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Aegis Security Inc. All rights reserved. Portfolio Engineering Project.</p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-white transition-colors">Documentation</a>
            <a href="#" className="hover:text-white transition-colors">API Reference</a>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
