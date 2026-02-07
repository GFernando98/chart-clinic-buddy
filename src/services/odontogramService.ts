import apiClient, { extractData } from './apiClient';
import { 
  ApiResponse, 
  Odontogram, 
  ToothRecord, 
  ToothCondition, 
  ToothSurface,
  ToothTreatmentRecord 
} from '@/types';

export interface CreateOdontogramData {
  patientId: string;
  doctorId: string;
  examinationDate: string;
  notes?: string;
  isPediatric: boolean;
}

export interface UpdateToothData {
  condition: ToothCondition;
  isPresent: boolean;
  notes?: string;
}

export interface AddSurfaceData {
  surface: ToothSurface;
  condition: ToothCondition;
  notes?: string;
}

export interface AddToothTreatmentData {
  treatmentId: string;
  doctorId: string;
  appointmentId?: string;
  performedDate: string;
  price: number;
  notes?: string;
  surfacesAffected?: string;
  isCompleted: boolean;
}

export const odontogramService = {
  /**
   * Get all odontograms for a patient
   */
  async getByPatient(patientId: string): Promise<Odontogram[]> {
    const response = await apiClient.get<ApiResponse<Odontogram[]>>(`/Odontogram/GetByPatient/${patientId}`);
    return extractData(response.data);
  },

  /**
   * Get full odontogram by ID with all teeth records
   */
  async getById(id: string): Promise<Odontogram> {
    const response = await apiClient.get<ApiResponse<Odontogram>>(`/Odontogram/GetById/${id}`);
    return extractData(response.data);
  },

  /**
   * Create a new odontogram for a patient
   */
  async create(data: CreateOdontogramData): Promise<Odontogram> {
    const response = await apiClient.post<ApiResponse<Odontogram>>('/Odontogram/Create', data);
    return extractData(response.data);
  },

  /**
   * Update a tooth record's condition
   */
  async updateTooth(toothRecordId: string, data: UpdateToothData): Promise<ToothRecord> {
    const response = await apiClient.put<ApiResponse<ToothRecord>>(`/Odontogram/UpdateTooth/${toothRecordId}`, data);
    return extractData(response.data);
  },

  /**
   * Add or update a surface condition on a tooth
   */
  async addSurface(toothRecordId: string, data: AddSurfaceData): Promise<ToothRecord> {
    const response = await apiClient.post<ApiResponse<ToothRecord>>(`/Odontogram/AddSurface/${toothRecordId}/surface`, data);
    return extractData(response.data);
  },

  /**
   * Record a treatment on a tooth
   */
  async addTreatment(toothRecordId: string, data: AddToothTreatmentData): Promise<ToothTreatmentRecord> {
    const response = await apiClient.post<ApiResponse<ToothTreatmentRecord>>(`/Odontogram/AddTreatment/${toothRecordId}/treatment`, data);
    return extractData(response.data);
  },

  /**
   * Get treatment history for a specific tooth
   */
  async getToothTreatments(toothRecordId: string): Promise<ToothTreatmentRecord[]> {
    const response = await apiClient.get<ApiResponse<ToothTreatmentRecord[]>>(`/Odontogram/GetToothTreatments/${toothRecordId}/treatments`);
    return extractData(response.data);
  },
};

export default odontogramService;
