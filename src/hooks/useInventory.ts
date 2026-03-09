import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryService } from '@/services/inventoryService';
import { InventoryEntryData, InventoryExitData } from '@/types/product';
import { useToast } from '@/hooks/use-toast';
import { productKeys } from './useProducts';

export const inventoryKeys = {
  all: ['inventory'] as const,
  transactions: (filters?: Record<string, unknown>) => [...inventoryKeys.all, 'transactions', filters] as const,
  byProduct: (productId: string) => [...inventoryKeys.all, 'product', productId] as const,
};

export function useInventoryTransactions(params?: { type?: 'Entry' | 'Exit'; fromDate?: string; toDate?: string }) {
  return useQuery({
    queryKey: inventoryKeys.transactions(params as Record<string, unknown>),
    queryFn: () => inventoryService.getTransactions(params),
  });
}

export function useInventoryByProduct(productId: string) {
  return useQuery({
    queryKey: inventoryKeys.byProduct(productId),
    queryFn: () => inventoryService.getByProduct(productId),
    enabled: !!productId,
  });
}

export function useRegisterEntry() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: InventoryEntryData) => inventoryService.registerEntry(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      toast({ title: 'Entrada registrada', description: 'El movimiento de entrada ha sido registrado', variant: 'success' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error al registrar entrada', description: error.message, variant: 'destructive' });
    },
  });
}

export function useRegisterExit() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: InventoryExitData) => inventoryService.registerExit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      toast({ title: 'Salida registrada', description: 'El movimiento de salida ha sido registrado', variant: 'success' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error al registrar salida', description: error.message, variant: 'destructive' });
    },
  });
}
