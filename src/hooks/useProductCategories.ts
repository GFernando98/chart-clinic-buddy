import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productCategoryService } from '@/services/productCategoryService';
import { CreateProductCategoryData, UpdateProductCategoryData } from '@/types/productCategory';
import { useToast } from '@/hooks/use-toast';

export const productCategoryKeys = {
  all: ['productCategories'] as const,
  lists: () => [...productCategoryKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...productCategoryKeys.lists(), filters] as const,
};

export function useProductCategories(onlyActive = false) {
  return useQuery({
    queryKey: productCategoryKeys.list({ onlyActive }),
    queryFn: () => productCategoryService.getAll(onlyActive),
  });
}

export function useCreateProductCategory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateProductCategoryData) => productCategoryService.create(data),
    onSuccess: (cat) => {
      queryClient.invalidateQueries({ queryKey: productCategoryKeys.lists() });
      toast({ title: 'Categoría creada', description: `${cat.name} ha sido creada exitosamente`, variant: 'success' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error al crear categoría', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateProductCategory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductCategoryData }) =>
      productCategoryService.update(id, data),
    onSuccess: (cat) => {
      queryClient.invalidateQueries({ queryKey: productCategoryKeys.lists() });
      toast({ title: 'Categoría actualizada', description: `${cat.name} ha sido actualizada`, variant: 'success' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error al actualizar categoría', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteProductCategory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => productCategoryService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productCategoryKeys.lists() });
      toast({ title: 'Categoría eliminada', description: 'La categoría ha sido eliminada', variant: 'success' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error al eliminar categoría', description: error.message, variant: 'destructive' });
    },
  });
}
