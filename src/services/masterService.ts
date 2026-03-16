import axios from 'axios';
import { ApiResponse, Tenant, CreateTenantData, MasterLoginRequest, MasterLoginResponse } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7820/api';

const MASTER_TOKEN_KEY = 'masterToken';

export const getMasterToken = (): string | null => localStorage.getItem(MASTER_TOKEN_KEY);
export const setMasterToken = (token: string) => localStorage.setItem(MASTER_TOKEN_KEY, token);
export const clearMasterToken = () => localStorage.removeItem(MASTER_TOKEN_KEY);

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
    const response = await masterClient.post<MasterLoginResponse>('/Master/login', credentials);
    return response.data;
  },

  async getTenants(): Promise<Tenant[]> {
    const response = await masterClient.get<ApiResponse<Tenant[]>>('/Master/tenants');
    return extractData(response.data);
  },

  async createTenant(data: CreateTenantData): Promise<Tenant> {
    const response = await masterClient.post<ApiResponse<Tenant>>('/Master/tenants', data);
    return extractData(response.data);
  },

  async toggleTenantStatus(id: string): Promise<Tenant> {
    const response = await masterClient.patch<ApiResponse<Tenant>>(`/Master/tenants/${id}/toggle-status`);
    return extractData(response.data);
  },

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<boolean> {
    const response = await masterClient.patch<ApiResponse<boolean>>('/Master/change-password', data);
    return extractData(response.data);
  },
};

export default masterService;
