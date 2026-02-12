import apiClient, { extractData } from './apiClient';
import {
  ApiResponse,
  InvoicePreview,
  Invoice,
  CreateInvoiceData,
  RegisterPaymentData,
  InvoicePayment,
  RevenueReport,
} from '@/types';

export const invoiceService = {
  async getPreview(odontogramId: string): Promise<InvoicePreview> {
    const response = await apiClient.get<ApiResponse<InvoicePreview>>(
      `/Invoices/Preview/${odontogramId}`
    );
    return extractData(response.data);
  },

  async create(data: CreateInvoiceData): Promise<Invoice> {
    const response = await apiClient.post<ApiResponse<Invoice>>('/Invoices/Create', data);
    return extractData(response.data);
  },

  async getById(invoiceId: string): Promise<Invoice> {
    const response = await apiClient.get<ApiResponse<Invoice>>(`/Invoices/GetById/${invoiceId}`);
    return extractData(response.data);
  },

  async getByPatient(patientId: string): Promise<Invoice[]> {
    const response = await apiClient.get<ApiResponse<Invoice[]>>(`/Invoices/GetByPatient/${patientId}`);
    return extractData(response.data);
  },

  async registerPayment(data: RegisterPaymentData): Promise<InvoicePayment> {
    const response = await apiClient.post<ApiResponse<InvoicePayment>>('/Invoices/RegisterPayment', data);
    return extractData(response.data);
  },

  async cancel(invoiceId: string, reason: string): Promise<boolean> {
    const response = await apiClient.put<ApiResponse<boolean>>(
      `/Invoices/Cancel/${invoiceId}`,
      JSON.stringify(reason),
      { headers: { 'Content-Type': 'application/json' } }
    );
    return extractData(response.data);
  },

  async getRevenue(startDate?: string, endDate?: string): Promise<RevenueReport> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await apiClient.get<ApiResponse<RevenueReport>>(`/Invoices/Revenue${query}`);
    return extractData(response.data);
  },
};

export default invoiceService;
