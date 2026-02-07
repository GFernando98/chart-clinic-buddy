// API Client
export { default as apiClient } from './apiClient';
export { 
  setTokens, 
  clearTokens, 
  getTokens,
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
export { appointmentService } from './appointmentService';
export type { AppointmentFilters } from './appointmentService';
export { userService } from './userService';
export { odontogramService } from './odontogramService';
export type { 
  CreateOdontogramData, 
  UpdateToothData, 
  AddSurfaceData, 
  AddToothTreatmentData 
} from './odontogramService';
