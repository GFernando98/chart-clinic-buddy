import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useInventoryByProduct } from '@/hooks/useInventory';
import { Product } from '@/types/product';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowDown, ArrowUp, Package } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
}

export function ProductMovementsDialog({ open, onOpenChange, product }: Props) {
  const { data: transactions = [], isLoading } = useInventoryByProduct(product.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" /> Movimientos: {product.name}
          </DialogTitle>
          <DialogDescription>
            Stock actual: {product.currentStock} {product.unit} — Últimos 30 días
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12" />)}</div>
        ) : transactions.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">No hay movimientos registrados</p>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Fecha</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-muted-foreground">Tipo</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Cantidad</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Stock Ant.</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Stock Nuevo</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Motivo</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-t border-border/50">
                    <td className="px-3 py-2 text-muted-foreground">
                      {format(new Date(tx.createdAt), 'dd/MM/yy HH:mm', { locale: es })}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {tx.type === 'Entry' ? (
                        <Badge className="bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30">
                          <ArrowDown className="w-3 h-3 mr-1" /> Entrada
                        </Badge>
                      ) : (
                        <Badge className="bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30">
                          <ArrowUp className="w-3 h-3 mr-1" /> Salida
                        </Badge>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right font-medium">{tx.quantity}</td>
                    <td className="px-3 py-2 text-right text-muted-foreground">{tx.previousStock}</td>
                    <td className="px-3 py-2 text-right font-medium">{tx.newStock}</td>
                    <td className="px-3 py-2 text-muted-foreground">{tx.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
