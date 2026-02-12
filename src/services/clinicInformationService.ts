import apiClient, { extractData } from './apiClient';
import { ApiResponse, ClinicInformation, ClinicInformationFormData } from '@/types';

export const clinicInformationService = {
  async get(): Promise<ClinicInformation> {
    const response = await apiClient.get<ApiResponse<ClinicInformation>>('/ClinicInformation');
    return extractData(response.data);
  },

  async update(data: ClinicInformationFormData): Promise<ClinicInformation> {
    const response = await apiClient.put<ApiResponse<ClinicInformation>>('/ClinicInformation', data);
    return extractData(response.data);
  },
};

export default clinicInformationService;
