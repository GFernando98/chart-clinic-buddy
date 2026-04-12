import apiClient, { extractData } from './apiClient';
import { ApiResponse } from '@/types';
import {
  Periodontogram,
  PeriodontalMeasurement,
  CreatePeriodontogramData,
  SaveToothMeasurementsData,
  FinalizePeriodontogramData,
} from '@/types/periodontogram';

export const periodontogramService = {
  async getByPatient(patientId: string): Promise<Periodontogram[]> {
    const response = await apiClient.get<ApiResponse<Periodontogram[]>>(
      `/Periodontogram/GetByPatient/${patientId}`
    );
    return extractData(response.data);
  },

  async getById(id: string): Promise<Periodontogram> {
    const response = await apiClient.get<ApiResponse<Periodontogram>>(
      `/Periodontogram/GetById/${id}`
    );
    return extractData(response.data);
  },

  async create(data: CreatePeriodontogramData): Promise<Periodontogram> {
    const response = await apiClient.post<ApiResponse<Periodontogram>>(
      '/Periodontogram/Create',
      data
    );
    return extractData(response.data);
  },

  async saveToothMeasurements(data: SaveToothMeasurementsData): Promise<PeriodontalMeasurement[]> {
    const response = await apiClient.post<ApiResponse<PeriodontalMeasurement[]>>(
      '/Periodontogram/SaveToothMeasurements',
      data
    );
    return extractData(response.data);
  },

  async finalize(id: string, data: FinalizePeriodontogramData): Promise<Periodontogram> {
    const response = await apiClient.patch<ApiResponse<Periodontogram>>(
      `/Periodontogram/Finalize/${id}`,
      data
    );
    return extractData(response.data);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/Periodontogram/Delete/${id}`);
  },
};

export default periodontogramService;
