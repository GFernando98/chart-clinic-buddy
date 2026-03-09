import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { useRegisterEntry } from '@/hooks/useInventory';
import { Product, ENTRY_REASONS } from '@/types/product';

const schema = z.object({
  productId: z.string().min(1, 'Seleccione un producto'),
  quantity: z.coerce.number().min(1, 'Cantidad mínima: 1'),
  unitCost: z.coerce.number().min(0, 'Debe ser >= 0'),
  reason: z.string().min(1, 'Seleccione un motivo'),
  referenceDocument: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
}

export function InventoryEntryDialog({ open, onOpenChange, products }: Props) {
  const registerEntry = useRegisterEntry();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { productId: '', quantity: 1, unitCost: 0, reason: '', referenceDocument: '', notes: '' },
  });

  useEffect(() => {
    if (open) form.reset();
  }, [open]);

  const onSubmit = async (values: FormValues) => {
    try {
      await registerEntry.mutateAsync({
        productId: values.productId,
        quantity: values.quantity,
        unitCost: values.unitCost,
        reason: values.reason,
        referenceDocument: values.referenceDocument || undefined,
        notes: values.notes || undefined,
      });
      onOpenChange(false);
    } catch {}
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Entrada</DialogTitle>
          <DialogDescription>Registra una entrada de producto al inventario</DialogDescription>
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
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="quantity" render={({ field }) => (
                <FormItem>
                  <FormLabel>Cantidad *</FormLabel>
                  <FormControl><Input type="number" min="1" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="unitCost" render={({ field }) => (
                <FormItem>
                  <FormLabel>Costo Unitario *</FormLabel>
                  <FormControl><Input type="number" step="0.01" min="0" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="reason" render={({ field }) => (
              <FormItem>
                <FormLabel>Motivo *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar motivo" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {ENTRY_REASONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="referenceDocument" render={({ field }) => (
              <FormItem>
                <FormLabel>Doc. Referencia</FormLabel>
                <FormControl><Input {...field} placeholder="FC-001-2026" /></FormControl>
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
              <Button type="submit" disabled={registerEntry.isPending} className="bg-green-600 hover:bg-green-700 text-white">
                {registerEntry.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Registrar Entrada
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
