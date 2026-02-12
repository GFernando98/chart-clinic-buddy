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
  categoryId?: string;
  categoryName?: string;
  defaultPrice: number;
  estimatedDurationMinutes: number;
  isActive: boolean;
  isGlobalTreatment: boolean;
}

export interface TreatmentFormData {
  code: string;
  name: string;
  description?: string;
  categoryId: string;
  defaultPrice: number;
  estimatedDurationMinutes: number;
  isGlobalTreatment: boolean;
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
  toothRecordId?: string; // nullable for global treatments
  toothNumber?: number;
  odontogramId: string;
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
  isPaid: boolean;
  isGlobalTreatment: boolean;
  appointmentId?: string;
}

// ============= Clinic Information Types =============

export interface ClinicInformation {
  id: string;
  clinicName: string;
  legalName: string;
  rtn: string;
  address: string;
  city: string;
  department: string;
  country: string;
  phone: string;
  email: string;
  website?: string;
  logo?: string;
  isActive: boolean;
}

export interface ClinicInformationFormData {
  clinicName: string;
  legalName: string;
  rtn: string;
  address: string;
  city: string;
  department: string;
  country: string;
  phone: string;
  email: string;
  website?: string;
  logo?: string;
}

// ============= Tax Information (CAI) Types =============

export enum InvoiceType {
  Factura = 1,
  Recibo = 2,
  NotaCredito = 3,
  NotaDebito = 4,
}

export interface TaxInformation {
  id: string;
  cai: string;
  invoiceType: InvoiceType;
  rangeStart: number;
  rangeEnd: number;
  currentNumber: number;
  authorizationDate: string;
  expirationDate: string;
  isActive: boolean;
  isExpired: boolean;
  isExhausted: boolean;
  canGenerateInvoice: boolean;
  remainingInvoices: number;
}

export interface TaxInformationFormData {
  cai: string;
  invoiceType: InvoiceType;
  rangeStart: number;
  rangeEnd: number;
  authorizationDate: string;
  expirationDate: string;
}

// ============= Invoice Types =============

export enum InvoiceStatus {
  Pending = 1,
  PartiallyPaid = 2,
  Paid = 3,
  Cancelled = 4,
  Overdue = 5,
}

export enum PaymentMethod {
  Cash = 1,
  CreditCard = 2,
  DebitCard = 3,
  BankTransfer = 4,
  Check = 5,
  Other = 6,
}

export interface InvoiceTreatmentLine {
  treatmentRecordId?: string;
  treatmentRecordIds?: string[];
  treatmentName: string;
  treatmentCode: string;
  isGlobal: boolean;
  toothNumbers: number[] | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface InvoicePreview {
  odontogramId: string;
  patientId: string;
  patientName: string;
  globalTreatments: InvoiceTreatmentLine[];
  toothTreatments: InvoiceTreatmentLine[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  toothNumbers: string | null;
  isGlobalTreatment: boolean;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface InvoicePayment {
  id: string;
  paymentDate: string;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  notes?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceType: InvoiceType;
  patientId: string;
  patientName: string;
  odontogramId: string;
  invoiceDate: string;
  dueDate: string | null;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  amountPaid: number;
  balance: number;
  notes?: string;
  status: InvoiceStatus;
  cai?: string;
  lineItems: InvoiceLineItem[];
  payments: InvoicePayment[];
}

export interface CreateInvoiceData {
  odontogramId: string;
  treatmentRecordIds: string[];
  discountPercentage?: number;
  discountAmount?: number;
  notes?: string;
}

export interface RegisterPaymentData {
  invoiceId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  notes?: string;
}

// ============= Revenue Types =============

export interface PaymentMethodBreakdown {
  method: PaymentMethod;
  amount: number;
  count: number;
}

export interface DailyRevenue {
  date: string;
  amount: number;
  invoiceCount: number;
}

export interface RevenueReport {
  startDate: string;
  endDate: string;
  totalInvoices: number;
  totalRevenue: number;
  totalPaid: number;
  totalPending: number;
  totalCancelled: number;
  paymentMethodBreakdown: PaymentMethodBreakdown[];
  dailyRevenue: DailyRevenue[];
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
