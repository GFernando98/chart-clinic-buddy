import React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { TopBar } from './TopBar';
import { SessionWarningDialog } from '@/components/SessionWarningDialog';

export function MainLayout() {
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex flex-col flex-1">
          <TopBar />
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <Outlet />
          </main>
          <footer className="py-3 px-6 text-center text-xs text-muted-foreground/60 border-t">
            © {new Date().getFullYear()} SmileOS · Distribuido por <span className="font-medium">SysCore</span>
          </footer>
        </SidebarInset>
      </div>
      <SessionWarningDialog />
    </SidebarProvider>
  );
}
