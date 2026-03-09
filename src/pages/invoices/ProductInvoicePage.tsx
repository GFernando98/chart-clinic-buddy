import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, Plus, Trash2, ShoppingCart, User, AlertTriangle } from 'lucide-react';
import { usePatients } from '@/hooks/usePatients';
import { useProducts } from '@/hooks/useProducts';
import { invoiceService } from '@/services/invoiceService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { invoiceKeys } from '@/hooks/useInvoice';
import { productKeys } from '@/hooks/useProducts';
import { Product } from '@/types/product';

interface InvoiceLine {
  id: string;
  productId: string;
  product?: Product;
  quantity: number;
  customPrice: number;
}

export default function ProductInvoicePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: patients = [] } = usePatients();
  const { data: products = [] } = useProducts(true);

  const [patientId, setPatientId] = useState('');
  const [lines, setLines] = useState<InvoiceLine[]>([]);
  const [discountPct, setDiscountPct] = useState('');
  const [notes, setNotes] = useState('');

  const addLine = () => {
    setLines(prev => [...prev, {
      id: crypto.randomUUID(),
      productId: '',
      quantity: 1,
      customPrice: 0,
    }]);
  };

  const updateLine = (id: string, updates: Partial<InvoiceLine>) => {
    setLines(prev => prev.map(l => {
      if (l.id !== id) return l;
      const updated = { ...l, ...updates };
      if (updates.productId) {
        const product = products.find(p => p.id === updates.productId);
        updated.product = product;
        updated.customPrice = product?.salePrice || 0;
      }
      return updated;
    }));
  };

  const removeLine = (id: string) => setLines(prev => prev.filter(l => l.id !== id));

  const subtotal = lines.reduce((sum, l) => sum + l.customPrice * l.quantity, 0);
  const discountAmount = discountPct ? (subtotal * parseFloat(discountPct || '0')) / 100 : 0;
  const total = subtotal - discountAmount;

  const hasStockIssues = lines.some(l => l.product && l.quantity > l.product.currentStock);
  const isValid = patientId && lines.length > 0 && lines.every(l => l.productId && l.quantity > 0 && l.customPrice > 0) && !hasStockIssues;

  const createInvoice = useMutation({
    mutationFn: async () => {
      const data: any = {
        patientId,
        products: lines.map(l => ({
          productId: l.productId,
          quantity: l.quantity,
          ...(l.customPrice !== l.product?.salePrice ? { customPrice: l.customPrice } : {}),
        })),
        discountPercentage: discountPct ? parseFloat(discountPct) : undefined,
        notes: notes || undefined,
      };
      const response = await invoiceService.create(data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      toast({ title: 'Factura creada', description: 'La factura de productos ha sido generada exitosamente', variant: 'success' });
      navigate('/invoices');
    },
    onError: (error: Error) => {
      toast({ title: 'Error al crear factura', description: error.message, variant: 'destructive' });
    },
  });

  const formatCurrency = (n: number) => `L ${n.toLocaleString('es-HN', { minimumFractionDigits: 2 })}`;
  const selectedPatient = patients.find(p => p.id === patientId);

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Nueva Factura de Productos</h1>
        <p className="text-muted-foreground">Genera una factura de venta de productos</p>
      </div>

      {/* Patient */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><User className="w-4 h-4" /> Paciente</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={patientId} onValueChange={setPatientId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar paciente" />
            </SelectTrigger>
            <SelectContent>
              {patients.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.fullName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedPatient && (
            <div className="mt-2 text-sm text-muted-foreground">
              {selectedPatient.identityNumber && <span>RTN: {selectedPatient.identityNumber} · </span>}
              {selectedPatient.phone && <span>Tel: {selectedPatient.phone}</span>}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Products */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2"><ShoppingCart className="w-4 h-4" /> Productos</CardTitle>
          <Button variant="outline" size="sm" onClick={addLine}>
            <Plus className="w-4 h-4 mr-1" /> Agregar Producto
          </Button>
        </CardHeader>
        <CardContent>
          {lines.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">Agrega productos a la factura</p>
          ) : (
            <div className="space-y-3">
              {lines.map((line, idx) => (
                <div key={line.id} className="grid grid-cols-12 gap-2 items-end p-3 rounded-lg bg-muted/30">
                  <div className="col-span-5">
                    <Label className="text-xs">Producto</Label>
                    <Select value={line.productId} onValueChange={(v) => updateLine(line.id, { productId: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map(p => (
                          <SelectItem key={p.id} value={p.id}>
                            <span className={p.currentStock <= 0 ? 'text-destructive' : ''}>
                              {p.code} — {p.name} | Stock: {p.currentStock} | {formatCurrency(p.salePrice)}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">Cantidad</Label>
                    <Input
                      type="number"
                      min="1"
                      max={line.product?.currentStock}
                      value={line.quantity}
                      onChange={(e) => updateLine(line.id, { quantity: parseInt(e.target.value) || 1 })}
                    />
                    {line.product && line.quantity > line.product.currentStock && (
                      <p className="text-[10px] text-destructive flex items-center gap-0.5 mt-0.5">
                        <AlertTriangle className="w-3 h-3" /> Sin stock
                      </p>
                    )}
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">Precio Unit.</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={line.customPrice}
                      onChange={(e) => updateLine(line.id, { customPrice: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="col-span-2 text-right">
                    <Label className="text-xs">Subtotal</Label>
                    <p className="text-sm font-medium mt-2">{formatCurrency(line.customPrice * line.quantity)}</p>
                  </div>
                  <div className="col-span-1 text-right">
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeLine(line.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Totals & Notes */}
      {lines.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs">Descuento (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={discountPct}
                  onChange={(e) => setDiscountPct(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Notas</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Notas opcionales..." />
              </div>
            </div>
            <Separator />
            <div className="space-y-1 text-right">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Descuento ({discountPct}%)</span>
                  <span className="text-destructive">-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
        <Button onClick={() => createInvoice.mutate()} disabled={!isValid || createInvoice.isPending}>
          {createInvoice.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Generar Factura
        </Button>
      </div>
    </div>
  );
}
