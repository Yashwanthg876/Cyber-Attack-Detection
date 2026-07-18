import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, User, Mail, ArrowRight, Eye, EyeOff, AlertCircle, ShieldAlert } from 'lucide-react';

export const Register: React.FC = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'analyst'>('analyst');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Mock registration for Step 2; will interface with the API backend later
      await new Promise(resolve => setTimeout(resolve, 850));

      if (username.length < 3) {
        setError('Username must be at least 3 characters.');
        setIsLoading(false);
        return;
      }
      if (password.length < 6) {
        setError('Security password must be at least 6 characters.');
        setIsLoading(false);
        return;
      }
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      setError('Failed to write credentials. Database offline.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-bg text-cyber-text flex items-center justify-center p-4 cyber-grid relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute w-[400px] h-[400px] rounded-full bg-brand-primary/10 blur-[100px] top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute w-[450px] h-[450px] rounded-full bg-brand-glow/10 blur-[120px] bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="w-full max-w-md z-10 animate-fade-in">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-brand-primary/20 border border-brand-primary/50 items-center justify-center text-brand-glow shadow-glow-cyan mb-3 animate-pulse">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold uppercase tracking-widest text-white font-mono">
            Register Analyst
          </h1>
          <p className="text-xs text-cyber-muted tracking-wider uppercase font-mono mt-1">
            Enroll security analyst credentials
          </p>
        </div>

        {/* Panel Container */}
        <div className="cyber-glass p-8 rounded-2xl border border-cyber-border glow-blue-hover transition-all">
          {success ? (
            <div className="text-center py-6 space-y-4 font-mono">
              <div className="w-12 h-12 rounded-full bg-brand-success/20 border border-brand-success/50 flex items-center justify-center text-brand-success mx-auto shadow-glow-green">
                ✓
              </div>
              <h2 className="text-lg font-bold text-white uppercase">ENROLLMENT GRANTED</h2>
              <p className="text-xs text-cyber-muted">Analyst record saved. Routing to gate console...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center space-x-2 bg-brand-danger/10 border border-brand-danger/30 text-brand-danger p-3 rounded-lg text-xs font-mono">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-cyber-muted uppercase tracking-wider font-mono flex items-center">
                  <User size={12} className="mr-1 text-brand-primary" /> Username
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. j.doe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-cyber-input border border-cyber-border focus:border-brand-primary/80 focus:shadow-glow-blue outline-none text-sm text-white px-4 py-2.5 rounded-xl transition-all font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-cyber-muted uppercase tracking-wider font-mono flex items-center">
                  <Mail size={12} className="mr-1 text-brand-primary" /> Work Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="analyst@corp.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-cyber-input border border-cyber-border focus:border-brand-primary/80 focus:shadow-glow-blue outline-none text-sm text-white px-4 py-2.5 rounded-xl transition-all font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-cyber-muted uppercase tracking-wider font-mono flex items-center">
                  <Lock size={12} className="mr-1 text-brand-primary" /> Console Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-cyber-input border border-cyber-border focus:border-brand-primary/80 focus:shadow-glow-blue outline-none text-sm text-white pl-4 pr-10 py-2.5 rounded-xl transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-cyber-muted hover:text-white"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-cyber-muted uppercase tracking-wider font-mono flex items-center mb-1">
                  Security Clearance / Role
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setRole('analyst')}
                    className={`py-2 px-3 text-xs font-bold font-mono rounded-xl border transition-all ${
                      role === 'analyst'
                        ? 'bg-brand-primary/25 border-brand-primary text-white shadow-glow-blue'
                        : 'bg-cyber-input border-cyber-border text-cyber-muted hover:text-white'
                    }`}
                  >
                    TIER 1 ANALYST
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`py-2 px-3 text-xs font-bold font-mono rounded-xl border transition-all ${
                      role === 'admin'
                        ? 'bg-brand-purple/25 border-brand-purple text-white shadow-glow-blue'
                        : 'bg-cyber-input border-cyber-border text-cyber-muted hover:text-white'
                    }`}
                  >
                    SOC SUPERVISOR
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-glow-blue flex items-center justify-center space-x-2 font-mono text-sm group hover:scale-[1.02] active:scale-[0.98] mt-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>ENROLL ANALYST</span>
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-cyber-border/40 text-center">
            <span className="text-xs text-cyber-muted">Already enrolled? </span>
            <Link to="/login" className="text-xs text-brand-glow hover:underline font-mono">
              Login to Session
            </Link>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <Link to="/" className="text-xs text-cyber-muted hover:text-white font-mono transition-colors">
            ← Back to Aegis Main
          </Link>
        </div>
      </div>
    </div>
  );
};
