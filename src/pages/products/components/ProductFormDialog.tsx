import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { useCreateProduct, useUpdateProduct } from '@/hooks/useProducts';
import { Product, PRODUCT_CATEGORIES, PRODUCT_UNITS } from '@/types/product';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const schema = z.object({
  code: z.string().min(1, 'Código requerido').max(50),
  name: z.string().min(1, 'Nombre requerido').max(200),
  description: z.string().max(500).optional(),
  category: z.string().min(1, 'Categoría requerida'),
  brand: z.string().max(100).optional(),
  purchasePrice: z.coerce.number().min(0, 'Debe ser >= 0'),
  salePrice: z.coerce.number().min(0, 'Debe ser >= 0'),
  initialStock: z.coerce.number().min(0).optional(),
  minimumStock: z.coerce.number().min(0, 'Debe ser >= 0'),
  maximumStock: z.coerce.number().min(0, 'Debe ser >= 0'),
  unit: z.string().min(1, 'Unidad requerida'),
  requiresPrescription: z.boolean(),
  expirationDate: z.date().optional().nullable(),
}).refine((d) => d.salePrice >= d.purchasePrice, {
  message: 'El precio de venta debe ser >= al precio de compra',
  path: ['salePrice'],
}).refine((d) => d.maximumStock >= d.minimumStock, {
  message: 'El stock máximo debe ser >= al stock mínimo',
  path: ['maximumStock'],
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
}

export function ProductFormDialog({ open, onOpenChange, product }: Props) {
  const isEditing = !!product;
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: '', name: '', description: '', category: '', brand: '',
      purchasePrice: 0, salePrice: 0, initialStock: 0,
      minimumStock: 0, maximumStock: 0, unit: 'pza',
      requiresPrescription: false, expirationDate: null,
    },
  });

  useEffect(() => {
    if (open) {
      if (product) {
        form.reset({
          code: product.code, name: product.name, description: product.description || '',
          category: product.category, brand: product.brand || '',
          purchasePrice: product.purchasePrice, salePrice: product.salePrice,
          initialStock: undefined, minimumStock: product.minimumStock,
          maximumStock: product.maximumStock, unit: product.unit,
          requiresPrescription: product.requiresPrescription,
          expirationDate: product.expirationDate ? new Date(product.expirationDate) : null,
        });
      } else {
        form.reset({
          code: '', name: '', description: '', category: '', brand: '',
          purchasePrice: 0, salePrice: 0, initialStock: 0,
          minimumStock: 0, maximumStock: 0, unit: 'pza',
          requiresPrescription: false, expirationDate: null,
        });
      }
    }
  }, [open, product]);

  const onSubmit = async (values: FormValues) => {
    const data = {
      ...values,
      description: values.description || undefined,
      brand: values.brand || undefined,
      expirationDate: values.expirationDate ? values.expirationDate.toISOString().split('T')[0] : undefined,
    };

    try {
      if (isEditing) {
        await updateProduct.mutateAsync({ id: product.id, data });
      } else {
        await createProduct.mutateAsync(data);
      }
      onOpenChange(false);
    } catch {
      // handled by hooks
    }
  };

  const isPending = createProduct.isPending || updateProduct.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Modifica los datos del producto' : 'Completa los datos para crear un producto'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="code" render={({ field }) => (
                <FormItem>
                  <FormLabel>Código *</FormLabel>
                  <FormControl><Input {...field} placeholder="PROD-001" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre *</FormLabel>
                  <FormControl><Input {...field} placeholder="Nombre del producto" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción</FormLabel>
                <FormControl><Textarea {...field} rows={2} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="category" render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {PRODUCT_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="brand" render={({ field }) => (
                <FormItem>
                  <FormLabel>Marca</FormLabel>
                  <FormControl><Input {...field} placeholder="Marca" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="purchasePrice" render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio Compra *</FormLabel>
                  <FormControl><Input type="number" step="0.01" min="0" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="salePrice" render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio Venta *</FormLabel>
                  <FormControl><Input type="number" step="0.01" min="0" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-3 gap-4">
              {!isEditing && (
                <FormField control={form.control} name="initialStock" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Inicial *</FormLabel>
                    <FormControl><Input type="number" min="0" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              )}
              <FormField control={form.control} name="minimumStock" render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock Mínimo *</FormLabel>
                  <FormControl><Input type="number" min="0" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="maximumStock" render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock Máximo *</FormLabel>
                  <FormControl><Input type="number" min="0" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="unit" render={({ field }) => (
                <FormItem>
                  <FormLabel>Unidad *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {PRODUCT_UNITS.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="expirationDate" render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Fecha Vencimiento</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant="outline" className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                          {field.value ? format(field.value, 'dd/MM/yyyy') : 'Seleccionar'}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value || undefined}
                        onSelect={field.onChange}
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="requiresPrescription" render={({ field }) => (
              <FormItem className="flex items-center gap-2">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="!mt-0">Requiere Prescripción</FormLabel>
              </FormItem>
            )} />

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
