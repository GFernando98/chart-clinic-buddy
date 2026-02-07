// ============= API Response Types =============

export interface ApiResponse<T> {
  succeeded: boolean;
  data: T | null;
  message: string | null;
  errors: string[];
}

// ============= Auth Types =============

export interface UserInfo {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  roles: UserRole[];
}

export type UserRole = 'Admin' | 'Doctor' | 'Receptionist' | 'Assistant';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  succeeded: boolean;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiration: string;
  user: UserInfo;
}

export interface RefreshTokenRequest {
  accessToken: string;
  refreshToken: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface RegisterUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
}

// ============= Patient Types =============

export enum Gender {
  Male = 1,
  Female = 2,
  Other = 3,
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  identityNumber: string;
  dateOfBirth: string;
  age: number;
  gender: Gender;
  phone: string;
  whatsAppNumber?: string;
  email?: string;
  address?: string;
  city?: string;
  occupation?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  allergies?: string;
  medicalConditions?: string;
  currentMedications?: string;
  notes?: string;
  profilePhotoUrl?: string;
  createdAt: string;
}

export interface PatientFormData {
  firstName: string;
  lastName: string;
  identityNumber: string;
  dateOfBirth: string;
  gender: Gender;
  phone: string;
  whatsAppNumber?: string;
  email?: string;
  address?: string;
  city?: string;
  occupation?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  allergies?: string;
  medicalConditions?: string;
  currentMedications?: string;
  notes?: string;
}

// ============= Doctor Types =============

export interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  licenseNumber: string;
  specialty: string;
  phone: string;
  email: string;
  isActive: boolean;
  userId?: string;
}

export interface DoctorFormData {
  firstName: string;
  lastName: string;
  licenseNumber: string;
  specialty: string;
  phone: string;
  email: string;
  userId?: string;
}

// ============= Treatment Types =============

export enum TreatmentCategory {
  Preventive = 1,
  Restorative = 2,
  Endodontics = 3,
  Periodontics = 4,
  Orthodontics = 5,
  Prosthodontics = 6,
  OralSurgery = 7,
  Pediatric = 8,
  Cosmetic = 9,
  Diagnostic = 10,
}

export interface Treatment {
  id: string;
  code: string;
  name: string;
  description?: string;
  category: TreatmentCategory;
  defaultPrice: number;
  estimatedDurationMinutes: number;
  isActive: boolean;
}

export interface TreatmentFormData {
  code: string;
  name: string;
  description?: string;
  category: TreatmentCategory;
  defaultPrice: number;
  estimatedDurationMinutes: number;
}

// ============= Appointment Types =============

export enum AppointmentStatus {
  Scheduled = 1,
  Confirmed = 2,
  InProgress = 3,
  Completed = 4,
  Cancelled = 5,
  NoShow = 6,
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  scheduledDate: string;
  scheduledEndDate: string;
  status: AppointmentStatus;
  reason: string;
  notes?: string;
  reminderSent: boolean;
  cancellationReason?: string;
}

export interface AppointmentFormData {
  patientId: string;
  doctorId: string;
  scheduledDate: string;
  scheduledEndDate: string;
  reason: string;
  notes?: string;
}

// ============= Odontogram Types =============

export enum ToothType {
  Permanent = 1,
  Deciduous = 2,
}

export enum ToothCondition {
  Healthy = 1,
  Decayed = 2,
  Filled = 3,
  Missing = 4,
  Extracted = 5,
  Crown = 6,
  Bridge = 7,
  Implant = 8,
  RootCanal = 9,
  Fracture = 10,
  Sealant = 11,
  Prosthesis = 12,
}

export enum ToothSurface {
  Mesial = 1,
  Distal = 2,
  Buccal = 3,
  Lingual = 4,
  Occlusal = 5,
  Incisal = 6,
}

export interface ToothSurfaceRecord {
  id: string;
  surface: ToothSurface;
  condition: ToothCondition;
  notes?: string;
}

export interface ToothRecord {
  id: string;
  toothNumber: number;
  toothType: ToothType;
  condition: ToothCondition;
  isPresent: boolean;
  notes?: string;
  surfaces: ToothSurfaceRecord[];
}

export interface Odontogram {
  id: string;
  patientId: string;
  patientName?: string;
  examinationDate: string;
  notes?: string;
  doctorId: string;
  doctorName?: string;
  teethRecords?: ToothRecord[];
}

export interface ToothTreatmentRecord {
  id: string;
  toothRecordId: string;
  toothNumber: number;
  treatmentId: string;
  treatmentName: string;
  treatmentCode: string;
  doctorId: string;
  doctorName: string;
  performedDate: string;
  price: number;
  notes?: string;
  surfacesAffected?: string;
  isCompleted: boolean;
  appointmentId?: string;
}

// ============= User Management Types =============

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  roles: UserRole[];
  isActive?: boolean;
}
