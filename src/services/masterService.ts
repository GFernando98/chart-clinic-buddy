import axios from 'axios';
import { ApiResponse, Tenant, CreateTenantData, UpdateTenantData, MasterLoginRequest, MasterLoginResponse } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://clinic-api.syscore.app';

// In-memory token storage (not localStorage)
let masterToken: string | null = null;

export const getMasterToken = (): string | null => masterToken;
export const setMasterToken = (token: string) => { masterToken = token; };
export const clearMasterToken = () => { masterToken = null; };

const masterClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

masterClient.interceptors.request.use((config) => {
  const token = getMasterToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const extractData = <T>(response: ApiResponse<T>): T => {
  if (!response.succeeded) {
    throw new Error(response.message || response.errors?.join(', ') || 'Error');
  }
  if (response.data === null) throw new Error('No data');
  return response.data;
};

export const masterService = {
  async login(credentials: MasterLoginRequest): Promise<MasterLoginResponse> {
    const response = await masterClient.post<MasterLoginResponse>('/api/master/login', credentials);
    return response.data;
  },

  async getTenants(): Promise<Tenant[]> {
    const response = await masterClient.get<ApiResponse<Tenant[]>>('/api/master/tenants');
    return extractData(response.data);
  },

  async getTenant(id: string): Promise<Tenant> {
    const response = await masterClient.get<ApiResponse<Tenant>>(`/api/master/tenants/${id}`);
    return extractData(response.data);
  },

  async createTenant(data: CreateTenantData): Promise<Tenant> {
    const response = await masterClient.post<ApiResponse<Tenant>>('/api/master/tenants', data);
    return extractData(response.data);
  },

  async updateTenant(id: string, data: UpdateTenantData): Promise<Tenant> {
    const response = await masterClient.put<ApiResponse<Tenant>>(`/api/master/tenants/${id}`, data);
    return extractData(response.data);
  },

  async deleteTenant(id: string): Promise<boolean> {
    const response = await masterClient.delete<ApiResponse<boolean>>(`/api/master/tenants/${id}`);
    return extractData(response.data);
  },

  async toggleTenantStatus(id: string): Promise<void> {
    await masterClient.patch(`/api/master/tenants/${id}/toggle-status`);
  },
};

export default masterService;
