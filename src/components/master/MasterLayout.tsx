import React from 'react';
import { Outlet, NavLink, useNavigate, Navigate } from 'react-router-dom';
import { useMasterAuth } from '@/contexts/MasterAuthContext';
import { LayoutDashboard, Building2, LogOut, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/master/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/master/tenants', label: 'Clinics', icon: Building2 },
];

export default function MasterLayout() {
  const { isAuthenticated, logout } = useMasterAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) return <Navigate to="/master/login" replace />;

  const handleLogout = () => {
    logout();
    navigate('/master/login');
  };

  return (
    <div className="min-h-screen flex bg-[hsl(var(--background))]">
      {/* Sidebar */}
      <aside className="w-64 bg-[hsl(222,47%,11%)] text-white flex flex-col shrink-0">
        <div className="h-16 flex items-center gap-3 px-5 border-b border-white/10">
          <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm leading-tight">SmileOS</p>
            <p className="text-[11px] text-white/50">Master Admin</p>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-indigo-500/20 text-indigo-300'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                )
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        <div className="px-5 py-3 text-[10px] text-white/30 text-center">
          © {new Date().getFullYear()} SmileOS · SysCore
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
