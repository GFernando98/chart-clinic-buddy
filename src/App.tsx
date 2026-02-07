import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { MainLayout } from "@/components/layout/MainLayout";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import OdontogramPage from "@/pages/OdontogramPage";
import { PatientsListPage, PatientDetailPage, PatientFormPage } from "@/pages/patients";
import { AppointmentsPage } from "@/pages/appointments";
import { UsersPage } from "@/pages/users";
import { DoctorsPage } from "@/pages/doctors";
import UnauthorizedPage from "@/pages/UnauthorizedPage";
import NotFound from "./pages/NotFound";
import "@/i18n/i18n";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              
              {/* Protected routes with layout */}
              <Route
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<DashboardPage />} />
                <Route path="/patients" element={<PatientsListPage />} />
                <Route path="/patients/new" element={<PatientFormPage />} />
                <Route path="/patients/:id" element={<PatientDetailPage />} />
                <Route path="/patients/:id/edit" element={<PatientFormPage />} />
                <Route
                  path="/odontogram"
                  element={
                    <ProtectedRoute allowedRoles={['Admin', 'Doctor']}>
                      <OdontogramPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/appointments" element={<AppointmentsPage />} />
                <Route
                  path="/doctors"
                  element={
                    <ProtectedRoute allowedRoles={['Admin']}>
                      <DoctorsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/treatments"
                  element={
                    <ProtectedRoute allowedRoles={['Admin']}>
                      <div className="p-4">Treatments Page (Coming Soon)</div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/users"
                  element={
                    <ProtectedRoute allowedRoles={['Admin']}>
                      <UsersPage />
                    </ProtectedRoute>
                  }
                />
              </Route>
              
              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
