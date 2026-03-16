import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { useCreateProductCategory, useUpdateProductCategory } from '@/hooks/useProductCategories';
import { ProductCategory } from '@/types/productCategory';

const schema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(100),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color HEX inválido (ej: #1A6B8A)').optional().or(z.literal('')),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: ProductCategory | null;
}

export function ProductCategoryFormDialog({ open, onOpenChange, category }: Props) {
  const isEditing = !!category;
  const createCategory = useCreateProductCategory();
  const updateCategory = useUpdateProductCategory();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '', color: '', isActive: true },
  });

  useEffect(() => {
    if (open) {
      if (category) {
        form.reset({
          name: category.name,
          description: category.description || '',
          color: category.color || '',
          isActive: category.isActive,
        });
      } else {
        form.reset({ name: '', description: '', color: '', isActive: true });
      }
    }
  }, [open, category]);

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEditing) {
        await updateCategory.mutateAsync({
          id: category.id,
          data: {
            name: values.name,
            description: values.description || undefined,
            color: values.color || undefined,
            isActive: values.isActive,
          },
        });
      } else {
        await createCategory.mutateAsync({
          name: values.name,
          description: values.description || undefined,
          color: values.color || undefined,
        });
      }
      onOpenChange(false);
    } catch {
      // handled by hooks
    }
  };

  const isPending = createCategory.isPending || updateCategory.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Categoría' : 'Nueva Categoría'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Modifica los datos de la categoría' : 'Completa los datos para crear una categoría'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre *</FormLabel>
                <FormControl><Input {...field} placeholder="Ej: Higiene Oral" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción</FormLabel>
                <FormControl><Textarea {...field} rows={2} placeholder="Descripción opcional" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="color" render={({ field }) => (
              <FormItem>
                <FormLabel>Color</FormLabel>
                <div className="flex items-center gap-3">
                  <FormControl><Input {...field} placeholder="#1A6B8A" className="flex-1" /></FormControl>
                  {field.value && /^#[0-9A-Fa-f]{6}$/.test(field.value) && (
                    <div
                      className="w-10 h-10 rounded-lg border border-border shrink-0"
                      style={{ backgroundColor: field.value }}
                    />
                  )}
                  <input
                    type="color"
                    value={field.value || '#1A6B8A'}
                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    className="w-10 h-10 rounded cursor-pointer border-0 p-0 shrink-0"
                  />
                </div>
                <FormMessage />
              </FormItem>
            )} />

            {isEditing && (
              <FormField control={form.control} name="isActive" render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border border-border p-3">
                  <FormLabel className="!mt-0">Activa</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )} />
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isEditing ? 'Guardar' : 'Crear'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
