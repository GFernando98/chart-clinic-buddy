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
import { DoctorsPage, DoctorFormPage } from "@/pages/doctors";
import { TreatmentsPage } from "@/pages/treatments";
import { InvoicesPage } from "@/pages/invoices";
import ProductInvoicePage from "@/pages/invoices/ProductInvoicePage";
import { ProductsPage } from "@/pages/products";
import { ProductCategoriesPage } from "@/pages/product-categories";
import { InventoryPage } from "@/pages/inventory";
import { SettingsPage } from "@/pages/settings";
import UnauthorizedPage from "@/pages/UnauthorizedPage";
import AppointmentConfirmationPage from "@/pages/AppointmentConfirmationPage";
import NotFound from "./pages/NotFound";
import "@/i18n/i18n";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

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
              <Route path="/confirmar-cita" element={<AppointmentConfirmationPage />} />
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
                  path="/doctors/new"
                  element={
                    <ProtectedRoute allowedRoles={['Admin']}>
                      <DoctorFormPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/doctors/:id/edit"
                  element={
                    <ProtectedRoute allowedRoles={['Admin']}>
                      <DoctorFormPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/treatments"
                  element={
                    <ProtectedRoute allowedRoles={['Admin']}>
                      <TreatmentsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/products"
                  element={
                    <ProtectedRoute allowedRoles={['Admin']}>
                      <ProductsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/inventory"
                  element={
                    <ProtectedRoute allowedRoles={['Admin']}>
                      <InventoryPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/invoices"
                  element={
                    <ProtectedRoute allowedRoles={['Admin', 'Doctor']}>
                      <InvoicesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/nueva-factura-productos"
                  element={
                    <ProtectedRoute allowedRoles={['Admin', 'Doctor']}>
                      <ProductInvoicePage />
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
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute allowedRoles={['Admin']}>
                      <SettingsPage />
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
