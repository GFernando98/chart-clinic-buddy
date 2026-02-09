import {
  Patient,
  Doctor,
  Treatment,
  Appointment,
  Odontogram,
  ToothRecord,
  User,
  Gender,
  TreatmentCategory,
  AppointmentStatus,
  ToothType,
  ToothCondition,
  ToothSurface,
  ToothTreatmentRecord,
} from '@/types';
import { addDays, subDays, format, setHours, setMinutes } from 'date-fns';

// ============= Helper Functions =============

const generateId = () => crypto.randomUUID();

const today = new Date();

// ============= Users =============

export const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'admin@dentalclinic.com',
    firstName: 'Admin',
    lastName: 'Sistema',
    fullName: 'Admin Sistema',
    roles: ['Admin'],
    isActive: true,
  },
  {
    id: 'user-2',
    email: 'carlos.mejia@dentalclinic.com',
    firstName: 'Carlos',
    lastName: 'Mejía',
    fullName: 'Carlos Mejía',
    roles: ['Doctor'],
    isActive: true,
  },
  {
    id: 'user-3',
    email: 'ana.rodriguez@dentalclinic.com',
    firstName: 'Ana',
    lastName: 'Rodríguez',
    fullName: 'Ana Rodríguez',
    roles: ['Doctor'],
    isActive: true,
  },
  {
    id: 'user-4',
    email: 'maria.lopez@dentalclinic.com',
    firstName: 'María',
    lastName: 'López',
    fullName: 'María López',
    roles: ['Receptionist'],
    isActive: true,
  },
  {
    id: 'user-5',
    email: 'jose.garcia@dentalclinic.com',
    firstName: 'José',
    lastName: 'García',
    fullName: 'José García',
    roles: ['Assistant'],
    isActive: true,
  },
];

// ============= Doctors =============

export const mockDoctors: Doctor[] = [
  {
    id: 'doctor-1',
    firstName: 'Carlos',
    lastName: 'Mejía',
    fullName: 'Dr. Carlos Mejía',
    licenseNumber: 'COL-12345',
    specialty: 'Ortodoncia',
    phone: '9888-7777',
    email: 'carlos.mejia@dentalclinic.com',
    isActive: true,
    userId: 'user-2',
  },
  {
    id: 'doctor-2',
    firstName: 'Ana',
    lastName: 'Rodríguez',
    fullName: 'Dra. Ana Rodríguez',
    licenseNumber: 'COL-23456',
    specialty: 'Endodoncia',
    phone: '9777-6666',
    email: 'ana.rodriguez@dentalclinic.com',
    isActive: true,
    userId: 'user-3',
  },
  {
    id: 'doctor-3',
    firstName: 'Roberto',
    lastName: 'Hernández',
    fullName: 'Dr. Roberto Hernández',
    licenseNumber: 'COL-34567',
    specialty: 'Cirugía Oral',
    phone: '9666-5555',
    email: 'roberto.hernandez@dentalclinic.com',
    isActive: true,
  },
];

// ============= Patients =============

export const mockPatients: Patient[] = [
  {
    id: 'patient-1',
    firstName: 'Juan',
    lastName: 'Pérez',
    fullName: 'Juan Pérez',
    identityNumber: '0801199912345',
    dateOfBirth: '1999-05-15',
    age: 25,
    gender: Gender.Male,
    phone: '9999-8888',
    whatsAppNumber: '50499998888',
    email: 'juan.perez@email.com',
    address: 'Col. Kennedy, Bloque A, Casa 15',
    city: 'San Pedro Sula',
    occupation: 'Ingeniero',
    emergencyContactName: 'María Pérez',
    emergencyContactPhone: '9999-7777',
    allergies: 'Penicilina',
    medicalConditions: 'Ninguna',
    currentMedications: 'Ninguno',
    notes: 'Paciente regular desde 2023',
    createdAt: '2023-01-10T08:00:00Z',
  },
  {
    id: 'patient-2',
    firstName: 'María',
    lastName: 'González',
    fullName: 'María González',
    identityNumber: '0801198567890',
    dateOfBirth: '1985-08-22',
    age: 39,
    gender: Gender.Female,
    phone: '9888-7766',
    whatsAppNumber: '50498887766',
    email: 'maria.gonzalez@email.com',
    address: 'Res. Los Castaños, Casa 8',
    city: 'Tegucigalpa',
    occupation: 'Abogada',
    emergencyContactName: 'Pedro González',
    emergencyContactPhone: '9888-6655',
    allergies: 'Ninguna conocida',
    medicalConditions: 'Hipertensión controlada',
    currentMedications: 'Losartán 50mg',
    createdAt: '2023-03-15T10:00:00Z',
  },
  {
    id: 'patient-3',
    firstName: 'Carlos',
    lastName: 'Martínez',
    fullName: 'Carlos Martínez',
    identityNumber: '0801200012345',
    dateOfBirth: '2000-12-01',
    age: 24,
    gender: Gender.Male,
    phone: '9777-6655',
    whatsAppNumber: '50497776655',
    email: 'carlos.martinez@email.com',
    address: 'Col. Alameda, Bloque 5',
    city: 'San Pedro Sula',
    occupation: 'Estudiante',
    emergencyContactName: 'Rosa Martínez',
    emergencyContactPhone: '9777-5544',
    createdAt: '2024-01-20T14:00:00Z',
  },
  {
    id: 'patient-4',
    firstName: 'Ana',
    lastName: 'López',
    fullName: 'Ana López',
    identityNumber: '0801199234567',
    dateOfBirth: '1992-03-10',
    age: 32,
    gender: Gender.Female,
    phone: '9666-5544',
    email: 'ana.lopez@email.com',
    address: 'Barrio El Centro, Ave Principal',
    city: 'La Ceiba',
    occupation: 'Médico',
    allergies: 'Látex',
    medicalConditions: 'Ninguna',
    currentMedications: 'Ninguno',
    createdAt: '2024-06-05T09:00:00Z',
  },
  {
    id: 'patient-5',
    firstName: 'Roberto',
    lastName: 'Fernández',
    fullName: 'Roberto Fernández',
    identityNumber: '0801197812345',
    dateOfBirth: '1978-07-25',
    age: 46,
    gender: Gender.Male,
    phone: '9555-4433',
    whatsAppNumber: '50495554433',
    email: 'roberto.fernandez@email.com',
    address: 'Col. Lomas del Mayab',
    city: 'Tegucigalpa',
    occupation: 'Empresario',
    emergencyContactName: 'Laura Fernández',
    emergencyContactPhone: '9555-3322',
    allergies: 'Aspirina',
    medicalConditions: 'Diabetes Tipo 2',
    currentMedications: 'Metformina 850mg',
    notes: 'Requiere control de glucosa antes de procedimientos',
    createdAt: '2022-11-08T11:00:00Z',
  },
];

// ============= Treatments Catalog =============

export const mockTreatments: Treatment[] = [
  {
    id: 'treatment-1',
    code: 'PREV-001',
    name: 'Limpieza Dental Profesional',
    description: 'Limpieza profunda con ultrasonido',
    category: TreatmentCategory.Preventive,
    defaultPrice: 500,
    estimatedDurationMinutes: 45,
    isActive: true,
    isGlobalTreatment: true,
  },
  {
    id: 'treatment-2',
    code: 'REST-001',
    name: 'Restauración con Resina',
    description: 'Obturación con resina compuesta',
    category: TreatmentCategory.Restorative,
    defaultPrice: 800,
    estimatedDurationMinutes: 45,
    isActive: true,
    isGlobalTreatment: false,
  },
  {
    id: 'treatment-3',
    code: 'REST-002',
    name: 'Restauración con Amalgama',
    description: 'Obturación con amalgama de plata',
    category: TreatmentCategory.Restorative,
    defaultPrice: 600,
    estimatedDurationMinutes: 40,
    isActive: true,
    isGlobalTreatment: false,
  },
  {
    id: 'treatment-4',
    code: 'ENDO-001',
    name: 'Tratamiento de Conducto',
    description: 'Endodoncia unirradicular',
    category: TreatmentCategory.Endodontics,
    defaultPrice: 3500,
    estimatedDurationMinutes: 90,
    isActive: true,
    isGlobalTreatment: false,
  },
  {
    id: 'treatment-5',
    code: 'ENDO-002',
    name: 'Tratamiento de Conducto Multirradicular',
    description: 'Endodoncia multirradicular',
    category: TreatmentCategory.Endodontics,
    defaultPrice: 4500,
    estimatedDurationMinutes: 120,
    isActive: true,
    isGlobalTreatment: false,
  },
  {
    id: 'treatment-6',
    code: 'PERI-001',
    name: 'Raspado y Alisado Radicular',
    description: 'Tratamiento periodontal profundo',
    category: TreatmentCategory.Periodontics,
    defaultPrice: 1200,
    estimatedDurationMinutes: 60,
    isActive: true,
    isGlobalTreatment: true,
  },
  {
    id: 'treatment-7',
    code: 'ORTO-001',
    name: 'Brackets Metálicos',
    description: 'Instalación de brackets metálicos',
    category: TreatmentCategory.Orthodontics,
    defaultPrice: 25000,
    estimatedDurationMinutes: 120,
    isActive: true,
    isGlobalTreatment: true,
  },
  {
    id: 'treatment-8',
    code: 'PROST-001',
    name: 'Corona de Porcelana',
    description: 'Corona dental en porcelana',
    category: TreatmentCategory.Prosthodontics,
    defaultPrice: 5000,
    estimatedDurationMinutes: 90,
    isActive: true,
    isGlobalTreatment: false,
  },
  {
    id: 'treatment-9',
    code: 'CIRUG-001',
    name: 'Extracción Simple',
    description: 'Extracción dental simple',
    category: TreatmentCategory.OralSurgery,
    defaultPrice: 800,
    estimatedDurationMinutes: 30,
    isActive: true,
    isGlobalTreatment: false,
  },
  {
    id: 'treatment-10',
    code: 'CIRUG-002',
    name: 'Extracción de Tercer Molar',
    description: 'Extracción quirúrgica de muela del juicio',
    category: TreatmentCategory.OralSurgery,
    defaultPrice: 2500,
    estimatedDurationMinutes: 60,
    isActive: true,
    isGlobalTreatment: false,
  },
  {
    id: 'treatment-11',
    code: 'PREV-002',
    name: 'Sellante de Fosas y Fisuras',
    description: 'Aplicación de sellante preventivo',
    category: TreatmentCategory.Preventive,
    defaultPrice: 350,
    estimatedDurationMinutes: 20,
    isActive: true,
    isGlobalTreatment: false,
  },
  {
    id: 'treatment-12',
    code: 'COSM-001',
    name: 'Blanqueamiento Dental',
    description: 'Blanqueamiento en consultorio',
    category: TreatmentCategory.Cosmetic,
    defaultPrice: 3000,
    estimatedDurationMinutes: 90,
    isActive: true,
    isGlobalTreatment: true,
  },
];

// ============= Appointments =============

const createAppointmentTime = (daysFromNow: number, hour: number, minute: number = 0) => {
  const date = addDays(today, daysFromNow);
  return setMinutes(setHours(date, hour), minute);
};

export const mockAppointments: Appointment[] = [
  {
    id: 'apt-1',
    patientId: 'patient-1',
    patientName: 'Juan Pérez',
    doctorId: 'doctor-1',
    doctorName: 'Dr. Carlos Mejía',
    scheduledDate: createAppointmentTime(0, 9, 0).toISOString(),
    scheduledEndDate: createAppointmentTime(0, 9, 45).toISOString(),
    status: AppointmentStatus.Confirmed,
    reason: 'Limpieza dental',
    reminderSent: true,
  },
  {
    id: 'apt-2',
    patientId: 'patient-2',
    patientName: 'María González',
    doctorId: 'doctor-2',
    doctorName: 'Dra. Ana Rodríguez',
    scheduledDate: createAppointmentTime(0, 10, 30).toISOString(),
    scheduledEndDate: createAppointmentTime(0, 11, 30).toISOString(),
    status: AppointmentStatus.Scheduled,
    reason: 'Tratamiento de conducto',
    reminderSent: true,
  },
  {
    id: 'apt-3',
    patientId: 'patient-3',
    patientName: 'Carlos Martínez',
    doctorId: 'doctor-1',
    doctorName: 'Dr. Carlos Mejía',
    scheduledDate: createAppointmentTime(0, 14, 0).toISOString(),
    scheduledEndDate: createAppointmentTime(0, 14, 45).toISOString(),
    status: AppointmentStatus.Scheduled,
    reason: 'Revisión de ortodoncia',
    reminderSent: false,
  },
  {
    id: 'apt-4',
    patientId: 'patient-4',
    patientName: 'Ana López',
    doctorId: 'doctor-3',
    doctorName: 'Dr. Roberto Hernández',
    scheduledDate: createAppointmentTime(1, 9, 0).toISOString(),
    scheduledEndDate: createAppointmentTime(1, 10, 0).toISOString(),
    status: AppointmentStatus.Scheduled,
    reason: 'Extracción de muela del juicio',
    reminderSent: false,
  },
  {
    id: 'apt-5',
    patientId: 'patient-5',
    patientName: 'Roberto Fernández',
    doctorId: 'doctor-2',
    doctorName: 'Dra. Ana Rodríguez',
    scheduledDate: createAppointmentTime(1, 11, 0).toISOString(),
    scheduledEndDate: createAppointmentTime(1, 12, 0).toISOString(),
    status: AppointmentStatus.Confirmed,
    reason: 'Endodoncia molar',
    reminderSent: true,
  },
  {
    id: 'apt-6',
    patientId: 'patient-1',
    patientName: 'Juan Pérez',
    doctorId: 'doctor-1',
    doctorName: 'Dr. Carlos Mejía',
    scheduledDate: createAppointmentTime(2, 15, 0).toISOString(),
    scheduledEndDate: createAppointmentTime(2, 16, 0).toISOString(),
    status: AppointmentStatus.Scheduled,
    reason: 'Seguimiento ortodoncia',
    reminderSent: false,
  },
  {
    id: 'apt-7',
    patientId: 'patient-2',
    patientName: 'María González',
    doctorId: 'doctor-1',
    doctorName: 'Dr. Carlos Mejía',
    scheduledDate: subDays(today, 1).toISOString(),
    scheduledEndDate: subDays(today, 1).toISOString(),
    status: AppointmentStatus.Completed,
    reason: 'Limpieza dental',
    notes: 'Paciente satisfecha con el resultado',
    reminderSent: true,
  },
  {
    id: 'apt-8',
    patientId: 'patient-3',
    patientName: 'Carlos Martínez',
    doctorId: 'doctor-2',
    doctorName: 'Dra. Ana Rodríguez',
    scheduledDate: subDays(today, 2).toISOString(),
    scheduledEndDate: subDays(today, 2).toISOString(),
    status: AppointmentStatus.Cancelled,
    reason: 'Revisión general',
    cancellationReason: 'Paciente solicitó reagendar',
    reminderSent: true,
  },
];

// ============= Odontograms =============

const generateTeethRecords = (isPediatric: boolean = false): ToothRecord[] => {
  const permanentTeeth = [
    18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28,
    48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38,
  ];
  
  const deciduousTeeth = [
    55, 54, 53, 52, 51, 61, 62, 63, 64, 65,
    85, 84, 83, 82, 81, 71, 72, 73, 74, 75,
  ];
  
  const teeth = isPediatric ? deciduousTeeth : permanentTeeth;
  
  return teeth.map((toothNumber, index) => ({
    id: `tooth-${toothNumber}`,
    toothNumber,
    toothType: isPediatric ? ToothType.Deciduous : ToothType.Permanent,
    condition: ToothCondition.Healthy,
    isPresent: true,
    surfaces: [],
  }));
};

// Create sample odontogram with some conditions
const createSampleOdontogram = (patientId: string, patientName: string, doctorId: string, doctorName: string): Odontogram => {
  const teeth = generateTeethRecords(false);
  
  // Add some sample conditions
  const tooth16 = teeth.find(t => t.toothNumber === 16);
  if (tooth16) {
    tooth16.condition = ToothCondition.Filled;
    tooth16.surfaces = [
      { id: 's1', surface: ToothSurface.Occlusal, condition: ToothCondition.Filled, notes: 'Resina' },
    ];
  }
  
  const tooth26 = teeth.find(t => t.toothNumber === 26);
  if (tooth26) {
    tooth26.condition = ToothCondition.Decayed;
    tooth26.surfaces = [
      { id: 's2', surface: ToothSurface.Mesial, condition: ToothCondition.Decayed, notes: 'Caries mesial' },
    ];
  }
  
  const tooth36 = teeth.find(t => t.toothNumber === 36);
  if (tooth36) {
    tooth36.condition = ToothCondition.RootCanal;
    tooth36.notes = 'Endodoncia realizada 2024';
  }
  
  const tooth18 = teeth.find(t => t.toothNumber === 18);
  if (tooth18) {
    tooth18.condition = ToothCondition.Extracted;
    tooth18.isPresent = false;
  }
  
  return {
    id: generateId(),
    patientId,
    patientName,
    examinationDate: subDays(today, 30).toISOString(),
    notes: 'Evaluación inicial. Paciente presenta buena higiene oral.',
    doctorId,
    doctorName,
    teethRecords: teeth,
  };
};

export const mockOdontograms: Odontogram[] = [
  createSampleOdontogram('patient-1', 'Juan Pérez', 'doctor-1', 'Dr. Carlos Mejía'),
  {
    id: generateId(),
    patientId: 'patient-1',
    patientName: 'Juan Pérez',
    examinationDate: subDays(today, 90).toISOString(),
    notes: 'Control de seguimiento',
    doctorId: 'doctor-1',
    doctorName: 'Dr. Carlos Mejía',
    teethRecords: generateTeethRecords(false),
  },
  createSampleOdontogram('patient-2', 'María González', 'doctor-2', 'Dra. Ana Rodríguez'),
];

// ============= Tooth Treatments =============

export const mockToothTreatments: ToothTreatmentRecord[] = [
  {
    id: 'tt-1',
    toothRecordId: 'tooth-16',
    toothNumber: 16,
    odontogramId: 'odontogram-1',
    treatmentId: 'treatment-2',
    treatmentName: 'Restauración con Resina',
    treatmentCode: 'REST-001',
    doctorId: 'doctor-1',
    doctorName: 'Dr. Carlos Mejía',
    performedDate: subDays(today, 60).toISOString(),
    price: 800,
    notes: 'Cara oclusal',
    surfacesAffected: 'O',
    isCompleted: true,
    isPaid: false,
    isGlobalTreatment: false,
  },
  {
    id: 'tt-2',
    toothRecordId: 'tooth-36',
    toothNumber: 36,
    odontogramId: 'odontogram-1',
    treatmentId: 'treatment-4',
    treatmentName: 'Tratamiento de Conducto',
    treatmentCode: 'ENDO-001',
    doctorId: 'doctor-2',
    doctorName: 'Dra. Ana Rodríguez',
    performedDate: subDays(today, 45).toISOString(),
    price: 3500,
    notes: 'Endodoncia completada sin complicaciones',
    isCompleted: true,
    isPaid: false,
    isGlobalTreatment: false,
  },
];

// ============= Dashboard Stats =============

export const getDashboardStats = () => {
  const todayStr = format(today, 'yyyy-MM-dd');
  const todayAppointments = mockAppointments.filter(apt => 
    format(new Date(apt.scheduledDate), 'yyyy-MM-dd') === todayStr
  );
  
  const pendingAppointments = mockAppointments.filter(apt =>
    apt.status === AppointmentStatus.Scheduled || apt.status === AppointmentStatus.Confirmed
  );
  
  return {
    todayAppointments: todayAppointments.length,
    totalPatients: mockPatients.length,
    pendingAppointments: pendingAppointments.length,
    monthTreatments: mockToothTreatments.length,
  };
};

export const getAppointmentsByDay = () => {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const date = subDays(today, i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const count = mockAppointments.filter(apt =>
      format(new Date(apt.scheduledDate), 'yyyy-MM-dd') === dateStr
    ).length;
    days.push({
      date: format(date, 'dd/MM'),
      count,
    });
  }
  return days;
};

export const getTreatmentsByCategory = () => {
  const categories = [
    { name: 'Preventivo', value: 3 },
    { name: 'Restaurativo', value: 5 },
    { name: 'Endodoncia', value: 2 },
    { name: 'Cirugía', value: 1 },
    { name: 'Ortodoncia', value: 2 },
  ];
  return categories;
};
