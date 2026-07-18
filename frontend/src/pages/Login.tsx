import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, User, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Mocking login for Step 2; will integrate with Backend in later steps
      // Simulating API latency
      await new Promise(resolve => setTimeout(resolve, 800));

      if (username.trim() && password.length >= 4) {
        const mockUser = {
          id: 1,
          username: username,
          email: `${username}@aegis.local`,
          role: username.toLowerCase() === 'admin' ? 'admin' as const : 'analyst' as const,
          created_at: new Date().toISOString()
        };
        const mockToken = 'mock_jwt_token_for_aegis_soc';
        login(mockToken, mockUser);
        navigate('/dashboard');
      } else {
        setError('Invalid credentials. Password must be at least 4 characters.');
      }
    } catch (err) {
      setError('Connection to security gateway failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-bg text-cyber-text flex items-center justify-center p-4 cyber-grid relative overflow-hidden">
      {/* Dynamic Background Gradients */}
      <div className="absolute w-[400px] h-[400px] rounded-full bg-brand-primary/10 blur-[100px] top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute w-[450px] h-[450px] rounded-full bg-brand-glow/10 blur-[120px] bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="w-full max-w-md z-10 animate-fade-in">
        {/* Logo and branding */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-brand-primary/20 border border-brand-primary/50 items-center justify-center text-brand-glow shadow-glow-cyan mb-3 animate-pulse">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold uppercase tracking-widest text-white font-mono">
            Aegis SOC Gate
          </h1>
          <p className="text-xs text-cyber-muted tracking-wider uppercase font-mono mt-1">
            Secure Analyst Authentication
          </p>
        </div>

        {/* Panel Form */}
        <div className="cyber-glass p-8 rounded-2xl border border-cyber-border glow-blue-hover transition-all">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center space-x-2 bg-brand-danger/10 border border-brand-danger/30 text-brand-danger p-3 rounded-lg text-xs font-mono">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-cyber-muted uppercase tracking-wider font-mono flex items-center">
                <User size={12} className="mr-1 text-brand-primary" /> Analyst Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. admin or analyst"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-cyber-input border border-cyber-border focus:border-brand-primary/80 focus:shadow-glow-blue outline-none text-sm text-white px-4 py-3 rounded-xl transition-all font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-cyber-muted uppercase tracking-wider font-mono flex items-center">
                <Lock size={12} className="mr-1 text-brand-primary" /> Security Key / Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-cyber-input border border-cyber-border focus:border-brand-primary/80 focus:shadow-glow-blue outline-none text-sm text-white pl-4 pr-10 py-3 rounded-xl transition-all font-mono"
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-glow-blue flex items-center justify-center space-x-2 font-mono text-sm group hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>INITIALIZE SESSION</span>
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-cyber-border/40 text-center">
            <span className="text-xs text-cyber-muted">New security analyst? </span>
            <Link to="/register" className="text-xs text-brand-glow hover:underline font-mono">
              Register Credentials
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
