import apiClient, { extractData } from './apiClient';
import { ApiResponse, InvoicePreview } from '@/types';

export const invoiceService = {
  /**
   * Get invoice preview for an odontogram
   * Returns unpaid treatments grouped for invoicing
   * GET /api/Invoices/Preview/{odontogramId}
   */
  async getPreview(odontogramId: string): Promise<InvoicePreview> {
    const response = await apiClient.get<ApiResponse<InvoicePreview>>(
      `/Invoices/Preview/${odontogramId}`
    );
    return extractData(response.data);
  },
};

export default invoiceService;
