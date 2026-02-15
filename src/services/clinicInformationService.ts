import apiClient, { extractData } from './apiClient';
import { ApiResponse, ClinicInformation, ClinicInformationFormData } from '@/types';

export const clinicInformationService = {
  async get(): Promise<ClinicInformation> {
    const response = await apiClient.get<ApiResponse<ClinicInformation>>('/ClinicInformation');
    return extractData(response.data);
  },

  async update(data: ClinicInformationFormData): Promise<ClinicInformation> {
    const formData = new FormData();
    formData.append('clinicName', data.clinicName);
    formData.append('legalName', data.legalName);
    formData.append('rtn', data.rtn);
    formData.append('address', data.address);
    formData.append('city', data.city);
    formData.append('department', data.department);
    formData.append('country', data.country);
    formData.append('phone', data.phone);
    formData.append('email', data.email);
    if (data.website) formData.append('website', data.website);
    if (data.logoFile) formData.append('logo', data.logoFile);

    const response = await apiClient.put<ApiResponse<ClinicInformation>>('/ClinicInformation', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return extractData(response.data);
  },
};

export default clinicInformationService;
