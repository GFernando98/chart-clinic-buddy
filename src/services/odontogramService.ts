import apiClient, { extractData } from './apiClient';
import { 
  ApiResponse, 
  Odontogram, 
  ToothRecord, 
  ToothTreatmentRecord 
} from '@/types';

// Match API: POST /api/Odontogram/Create
export interface InitialSurfaceData {
  surface: 'Oclusal' | 'Mesial' | 'Distal' | 'Vestibular' | 'Lingual' | 'Palatal';
  condition: string;
  notes?: string;
}

export interface InitialToothData {
  toothNumber: number;
  condition: string;
  isPresent: boolean;
  notes?: string;
  surfaces?: InitialSurfaceData[];
}

export interface CreateOdontogramData {
  patientId: string;
  doctorId?: string;
  examinationDate?: string;
  isPediatric: boolean;
  notes?: string;
  initialTeethData?: InitialToothData[];
}

// Match API: PUT /api/Odontogram/UpdateTooth/{toothRecordId}
export interface UpdateToothData {
  condition: string;
  notes?: string;
}

// Match API: POST /api/Odontogram/AddSurface/{toothRecordId}
export interface AddSurfaceData {
  surfaceType: string;
  condition: string;
  notes?: string;
}

// Match API: POST /api/Odontogram/AddTreatment/{toothRecordId}
export interface AddToothTreatmentData {
  treatmentId: string;
  status: 'Planned' | 'InProgress' | 'Completed';
  performedDate?: string;
  notes?: string;
}

export const odontogramService = {
  /**
   * Get all odontograms for a patient
   * GET /api/Odontogram/GetByPatient/{patientId}
   */
  async getByPatient(patientId: string): Promise<Odontogram[]> {
    const response = await apiClient.get<ApiResponse<Odontogram[]>>(`/Odontogram/GetByPatient/${patientId}`);
    return extractData(response.data);
  },

  /**
   * Get odontogram by ID
   * GET /api/Odontogram/GetById/{id}
   */
  async getById(id: string): Promise<Odontogram> {
    const response = await apiClient.get<ApiResponse<Odontogram>>(`/Odontogram/GetById/${id}`);
    return extractData(response.data);
  },

  /**
   * Create a new odontogram for a patient
   * POST /api/Odontogram/Create
   */
  async create(data: CreateOdontogramData): Promise<Odontogram> {
    const response = await apiClient.post<ApiResponse<Odontogram>>('/Odontogram/Create', data);
    return extractData(response.data);
  },

  /**
   * Update a tooth record's condition
   * PUT /api/Odontogram/UpdateTooth/{toothRecordId}
   */
  async updateTooth(toothRecordId: string, data: UpdateToothData): Promise<ToothRecord> {
    const response = await apiClient.put<ApiResponse<ToothRecord>>(`/Odontogram/UpdateTooth/${toothRecordId}`, data);
    return extractData(response.data);
  },

  /**
   * Add a surface condition to a tooth
   * POST /api/Odontogram/AddSurface/{toothRecordId}
   */
  async addSurface(toothRecordId: string, data: AddSurfaceData): Promise<ToothRecord> {
    const response = await apiClient.post<ApiResponse<ToothRecord>>(`/Odontogram/AddSurface/${toothRecordId}`, data);
    return extractData(response.data);
  },

  /**
   * Add a treatment to a tooth
   * POST /api/Odontogram/AddTreatment/{toothRecordId}
   */
  async addTreatment(toothRecordId: string, data: AddToothTreatmentData): Promise<ToothTreatmentRecord> {
    const response = await apiClient.post<ApiResponse<ToothTreatmentRecord>>(`/Odontogram/AddTreatment/${toothRecordId}`, data);
    return extractData(response.data);
  },

  /**
   * Get treatment history for a specific tooth
   * GET /api/Odontogram/GetToothTreatments/{toothRecordId}
   */
  async getToothTreatments(toothRecordId: string): Promise<ToothTreatmentRecord[]> {
    const response = await apiClient.get<ApiResponse<ToothTreatmentRecord[]>>(`/Odontogram/GetToothTreatments/${toothRecordId}`);
    return extractData(response.data);
  },
};

export default odontogramService;
