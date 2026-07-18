import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  ShieldAlert, 
  Globe, 
  BarChart3, 
  Cpu, 
  Bell, 
  Settings, 
  User as UserIcon, 
  LogOut, 
  Menu, 
  X, 
  Wifi, 
  ShieldCheck 
} from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Attack Detection', path: '/detection', icon: ShieldAlert },
    { name: 'Threat Intelligence', path: '/threat-intel', icon: Globe },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Model Performance', path: '/performance', icon: Cpu },
    { name: 'Alerts', path: '/alerts', icon: Bell },
    { name: 'Settings', path: '/settings', icon: Settings },
    { name: 'Profile', path: '/profile', icon: UserIcon },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getPageTitle = () => {
    const activeItem = navItems.find(item => item.path === location.pathname);
    return activeItem ? activeItem.name : 'SOC Console';
  };

  return (
    <div className="min-h-screen bg-cyber-bg text-cyber-text flex flex-col font-sans">
      {/* Top Header */}
      <header className="h-16 border-b border-cyber-border bg-cyber-card/85 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-3">
          <button 
            className="md:hidden text-cyber-muted hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="text-brand-glow w-7 h-7 drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]" />
            <span className="font-extrabold tracking-wider bg-gradient-to-r from-white via-brand-primary to-brand-glow bg-clip-text text-transparent uppercase text-lg hidden sm:inline-block">
              Aegis SOC
            </span>
            <span className="text-[10px] bg-brand-primary/25 border border-brand-primary/45 px-1.5 py-0.5 rounded text-brand-glow font-mono font-bold tracking-widest hidden md:inline-block animate-pulse">
              AI ENGINE V1.0
            </span>
          </div>
        </div>

        {/* Live Metrics and Time */}
        <div className="flex items-center space-x-6">
          <div className="hidden lg:flex items-center space-x-2 text-xs font-mono text-cyber-muted">
            <Wifi className="text-brand-success w-4 h-4 animate-pulse" />
            <span className="text-brand-success font-semibold uppercase">Engine Online</span>
          </div>

          <div className="text-xs font-mono bg-cyber-input border border-cyber-border px-3 py-1.5 rounded text-brand-glow hidden md:block">
            {time.toISOString().replace('T', ' ').substring(0, 19)} UTC
          </div>

          <div className="flex items-center space-x-3 border-l border-cyber-border pl-6">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold text-white">{user?.username || 'Security Analyst'}</div>
              <div className="text-[10px] text-brand-primary uppercase tracking-wider font-bold">
                {user?.role === 'admin' ? 'Super Administrator' : 'Tier 1 Analyst'}
              </div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-brand-primary/20 border border-brand-primary/50 flex items-center justify-center font-bold text-white shadow-glow-blue">
              {(user?.username || 'SA')[0].toUpperCase()}
            </div>
            <button 
              onClick={handleLogout}
              className="text-cyber-muted hover:text-brand-danger transition-colors p-1.5 rounded-lg hover:bg-brand-danger/10 border border-transparent hover:border-brand-danger/20"
              title="Logout System"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex relative">
        {/* Sidebar for Desktop */}
        <aside className="w-64 border-r border-cyber-border bg-cyber-card/40 hidden md:flex flex-col justify-between py-6">
          <div className="px-4 space-y-1">
            <div className="px-3 mb-4 text-[10px] font-bold text-cyber-muted tracking-widest uppercase">
              Operations Center
            </div>
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center space-x-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 border group
                  ${isActive 
                    ? 'bg-brand-primary/15 border-brand-primary/50 text-white shadow-glow-blue' 
                    : 'border-transparent text-cyber-muted hover:text-white hover:bg-cyber-input/60'
                  }
                `}
              >
                <item.icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </div>

          <div className="px-6 text-[10px] font-mono text-cyber-muted">
            <p>© 2026 Aegis Security Inc.</p>
            <p>System Security: SECURE</p>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <aside className="fixed inset-y-0 left-0 w-64 bg-cyber-card border-r border-cyber-border p-6 flex flex-col justify-between z-50 md:hidden animate-in slide-in-from-left duration-350">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="text-brand-glow w-6 h-6" />
                    <span className="font-bold text-white tracking-wider">AEGIS SOC</span>
                  </div>
                  <button 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-cyber-muted hover:text-white"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="space-y-1">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) => `
                        flex items-center space-x-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-all border
                        ${isActive 
                          ? 'bg-brand-primary/20 border-brand-primary/50 text-white shadow-glow-blue' 
                          : 'border-transparent text-cyber-muted hover:text-white hover:bg-cyber-input'
                        }
                      `}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </NavLink>
                  ))}
                </div>
              </div>
              <div className="text-[10px] font-mono text-cyber-muted">
                <p>© 2026 Aegis Security Inc.</p>
                <p>Engine status: ACTIVE</p>
              </div>
            </aside>
          </>
        )}

        {/* Content View Area */}
        <main className="flex-1 min-w-0 bg-cyber-bg cyber-grid p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyber-border/40 pb-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white uppercase font-mono">
                  {getPageTitle()}
                </h1>
                <p className="text-xs text-cyber-muted mt-1 font-mono">
                  Console Path: Aegis-SOC://{location.pathname.substring(1) || 'home'}
                </p>
              </div>
            </div>
            
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
