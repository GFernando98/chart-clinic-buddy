import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Stethoscope,
  ClipboardList,
  UserCog,
  Scan,
  LogOut,
  Settings,
  FileText,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  roles?: string[];
}

export function AppSidebar() {
  const { t } = useTranslation();
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  const navItems: NavItem[] = [
    { title: t('nav.dashboard'), icon: LayoutDashboard, path: '/' },
    { title: t('nav.patients'), icon: Users, path: '/patients' },
    { title: t('nav.odontogram'), icon: Scan, path: '/odontogram', roles: ['Admin', 'Doctor'] },
    { title: t('nav.appointments'), icon: Calendar, path: '/appointments' },
    { title: t('nav.doctors'), icon: Stethoscope, path: '/doctors', roles: ['Admin'] },
    { title: t('nav.treatments'), icon: ClipboardList, path: '/treatments', roles: ['Admin'] },
    { title: t('nav.invoices'), icon: FileText, path: '/invoices', roles: ['Admin', 'Doctor'] },
    { title: t('nav.users'), icon: UserCog, path: '/users', roles: ['Admin'] },
    { title: t('nav.settings'), icon: Settings, path: '/settings', roles: ['Admin'] },
  ];

  const filteredNavItems = navItems.filter(item => {
    if (!item.roles) return true;
    return hasRole(item.roles);
  });

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="h-16 flex items-center justify-center border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="font-semibold text-sidebar-foreground whitespace-nowrap">
              Clínica Dental
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredNavItems.map((item) => {
                const isActive = location.pathname === item.path || 
                  (item.path !== '/' && location.pathname.startsWith(item.path));
                
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={collapsed ? item.title : undefined}
                    >
                      <button
                        onClick={() => navigate(item.path)}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                          isActive
                            ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                            : 'hover:bg-sidebar-accent text-sidebar-foreground'
                        )}
                      >
                        <item.icon className="w-5 h-5 shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2 border-t border-sidebar-border">
        {user && (
          <div className={cn(
            'flex items-center gap-3 p-2 rounded-lg',
            collapsed ? 'justify-center' : ''
          )}>
            <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center shrink-0">
              <span className="text-sm font-medium text-sidebar-accent-foreground">
                {user.firstName[0]}{user.lastName[0]}
              </span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user.fullName}
                </p>
                <p className="text-xs text-sidebar-foreground/70 truncate">
                  {user.roles[0]}
                </p>
              </div>
            )}
          </div>
        )}
        <Button
          variant="ghost"
          size={collapsed ? 'icon' : 'default'}
          onClick={handleLogout}
          className={cn(
            'w-full text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
            collapsed ? 'justify-center' : 'justify-start gap-3'
          )}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>{t('auth.logout')}</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
