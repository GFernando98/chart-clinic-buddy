import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useRegisterExit } from '@/hooks/useInventory';
import { Product, EXIT_REASONS } from '@/types/product';

const schema = z.object({
  productId: z.string().min(1, 'Seleccione un producto'),
  quantity: z.coerce.number().min(1, 'Cantidad mínima: 1'),
  reason: z.string().min(1, 'Seleccione un motivo'),
  notes: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
}

export function InventoryExitDialog({ open, onOpenChange, products }: Props) {
  const registerExit = useRegisterExit();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { productId: '', quantity: 1, reason: '', notes: '' },
  });

  useEffect(() => {
    if (open) form.reset();
  }, [open]);

  const selectedProduct = products.find(p => p.id === form.watch('productId'));
  const quantity = form.watch('quantity');
  const insufficientStock = selectedProduct && quantity > selectedProduct.currentStock;

  const onSubmit = async (values: FormValues) => {
    if (insufficientStock) return;
    try {
      await registerExit.mutateAsync({
        productId: values.productId,
        quantity: values.quantity,
        reason: values.reason,
        notes: values.notes || undefined,
      });
      onOpenChange(false);
    } catch {}
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Salida</DialogTitle>
          <DialogDescription>Registra una salida de producto del inventario</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="productId" render={({ field }) => (
              <FormItem>
                <FormLabel>Producto *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar producto" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {products.map(p => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.code} — {p.name} (Stock: {p.currentStock})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedProduct && (
                  <FormDescription>Stock actual: {selectedProduct.currentStock} {selectedProduct.unit}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="quantity" render={({ field }) => (
              <FormItem>
                <FormLabel>Cantidad *</FormLabel>
                <FormControl><Input type="number" min="1" max={selectedProduct?.currentStock} {...field} /></FormControl>
                {insufficientStock && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Stock insuficiente
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="reason" render={({ field }) => (
              <FormItem>
                <FormLabel>Motivo *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar motivo" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {EXIT_REASONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="notes" render={({ field }) => (
              <FormItem>
                <FormLabel>Notas</FormLabel>
                <FormControl><Textarea {...field} rows={2} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit" disabled={registerExit.isPending || !!insufficientStock} variant="destructive">
                {registerExit.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Registrar Salida
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
