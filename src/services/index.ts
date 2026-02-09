// API Client
export { default as apiClient } from './apiClient';
export { 
  setTokens, 
  clearTokens, 
  getTokens,
  hasValidTokens,
  setOnTokenRefreshed,
  setOnAuthError,
  setOnActivityTracked,
  extractData,
  getErrorMessage 
} from './apiClient';

// Services
export { authService } from './authService';
export { patientService } from './patientService';
export { doctorService } from './doctorService';
export { treatmentService } from './treatmentService';
export { treatmentCategoryService } from './treatmentCategoryService';
export type { TreatmentCategoryDto, TreatmentCategoryFormData } from './treatmentCategoryService';
export { appointmentService } from './appointmentService';
export type { AppointmentFilters } from './appointmentService';
export { userService } from './userService';
export type { CreateUserData } from './userService';
export { odontogramService } from './odontogramService';
export { dashboardService } from './dashboardService';
export type { 
  DashboardStats, 
  AppointmentsByDay, 
  TreatmentsByCategory, 
  UpcomingAppointment 
} from './dashboardService';
export type { 
  CreateOdontogramData, 
  UpdateToothData, 
  AddSurfaceData, 
  AddToothTreatmentData,
  AddGlobalTreatmentData 
} from './odontogramService';
export { invoiceService } from './invoiceService';
