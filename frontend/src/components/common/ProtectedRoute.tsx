import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield } from 'lucide-react';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cyber-bg text-cyber-text flex flex-col items-center justify-center p-4 cyber-grid animate-pulse">
        <div className="cyber-glass p-8 rounded-xl max-w-sm w-full text-center border-brand-primary/50 shadow-glow-blue">
          <Shield className="w-12 h-12 text-brand-glow mx-auto mb-4 animate-spin" />
          <h2 className="text-lg font-bold font-mono tracking-wider text-white">AUTHENTICATING...</h2>
          <p className="text-xs text-cyber-muted mt-2">Checking credentials & loading SOC environment</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
