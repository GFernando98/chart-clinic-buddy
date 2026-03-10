import apiClient, { extractData } from './apiClient';
import { ApiResponse } from '@/types';
import { InventoryTransaction, InventoryEntryData, InventoryExitData } from '@/types/product';

export const inventoryService = {
  async getTransactions(params?: {
    type?: 'Entry' | 'Exit';
    fromDate?: string;
    toDate?: string;
  }): Promise<InventoryTransaction[]> {
    const searchParams = new URLSearchParams();
    if (params?.type) searchParams.append('type', params.type);
    if (params?.fromDate) searchParams.append('fromDate', params.fromDate);
    if (params?.toDate) searchParams.append('toDate', params.toDate);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    const response = await apiClient.get<ApiResponse<any[]>>(`/Inventory/Transactions${query}`);
    const raw = extractData(response.data);
    return raw.map(mapTransaction);
  },

  async getByProduct(productId: string, lastDays = 30): Promise<InventoryTransaction[]> {
    const response = await apiClient.get<ApiResponse<InventoryTransaction[]>>(
      `/Inventory/Product/${productId}?lastDays=${lastDays}`
    );
    return extractData(response.data);
  },

  async registerEntry(data: InventoryEntryData): Promise<InventoryTransaction> {
    const response = await apiClient.post<ApiResponse<InventoryTransaction>>('/Inventory/Entry', data);
    return extractData(response.data);
  },

  async registerExit(data: InventoryExitData): Promise<InventoryTransaction> {
    const response = await apiClient.post<ApiResponse<InventoryTransaction>>('/Inventory/Exit', data);
    return extractData(response.data);
  },
};
