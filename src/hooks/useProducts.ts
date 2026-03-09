import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '@/services/productService';
import { ProductFormData } from '@/types/product';
import { useToast } from '@/hooks/use-toast';

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
};

export function useProducts(onlyActive = false, onlyLowStock = false) {
  return useQuery({
    queryKey: productKeys.list({ onlyActive, onlyLowStock }),
    queryFn: () => productService.getAll(onlyActive, onlyLowStock),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productService.getById(id),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: ProductFormData) => productService.create(data),
    onSuccess: (product) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      toast({ title: 'Producto creado', description: `${product.name} ha sido creado exitosamente`, variant: 'success' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error al crear producto', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProductFormData }) => productService.update(id, data),
    onSuccess: (product) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(product.id) });
      toast({ title: 'Producto actualizado', description: `${product.name} ha sido actualizado`, variant: 'success' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error al actualizar producto', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => productService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      toast({ title: 'Producto eliminado', description: 'El producto ha sido eliminado', variant: 'success' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error al eliminar producto', description: error.message, variant: 'destructive' });
    },
  });
}
