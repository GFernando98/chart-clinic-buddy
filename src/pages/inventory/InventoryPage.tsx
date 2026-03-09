import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowDown, ArrowUp, Plus, Package } from 'lucide-react';
import { useInventoryTransactions } from '@/hooks/useInventory';
import { useProducts } from '@/hooks/useProducts';
import { InventoryEntryDialog } from './components/InventoryEntryDialog';
import { InventoryExitDialog } from './components/InventoryExitDialog';
import { TablePagination } from '@/components/ui/table-pagination';
import { usePagination } from '@/hooks/usePagination';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function InventoryPage() {
  const [tab, setTab] = useState<string>('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [entryOpen, setEntryOpen] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);

  const typeFilter = tab === 'entries' ? 'Entry' : tab === 'exits' ? 'Exit' : undefined;

  const { data: transactions = [], isLoading } = useInventoryTransactions({
    type: typeFilter,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
  });

  const { data: products = [] } = useProducts(true);

  const pagination = usePagination({ items: transactions });
  const paged = pagination.paginatedItems;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Movimientos de Inventario</h1>
          <p className="text-muted-foreground">Registro de entradas y salidas de productos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="text-green-700 border-green-300 hover:bg-green-50 dark:text-green-400 dark:border-green-700 dark:hover:bg-green-950" onClick={() => setEntryOpen(true)}>
            <ArrowDown className="w-4 h-4 mr-2" /> Registrar Entrada
          </Button>
          <Button variant="outline" className="text-red-700 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-950" onClick={() => setExitOpen(true)}>
            <ArrowUp className="w-4 h-4 mr-2" /> Registrar Salida
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1">
              <Label className="text-xs">Desde</Label>
              <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-auto" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Hasta</Label>
              <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-auto" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="entries">Entradas</TabsTrigger>
          <TabsTrigger value="exits">Salidas</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          {isLoading ? (
            <Card className="border-0 shadow-sm"><CardContent className="py-8 space-y-3">
              {[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
            </CardContent></Card>
          ) : transactions.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Package className="w-16 h-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium mb-2">No hay movimientos</h3>
                <p className="text-muted-foreground">Los movimientos de inventario aparecerán aquí</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Fecha</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Producto</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">Tipo</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Cantidad</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Stock Ant.</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Stock Nuevo</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Motivo</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Referencia</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Notas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paged.map((tx) => (
                        <tr key={tx.id} className="border-b border-border/50 hover:bg-muted/30">
                          <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                            {format(new Date(tx.createdAt), 'dd/MM/yy HH:mm', { locale: es })}
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <span className="font-medium">{tx.productName}</span>
                              <span className="block text-xs text-muted-foreground">{tx.productCode}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
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
                          <td className="px-4 py-3 text-right font-medium">{tx.quantity}</td>
                          <td className="px-4 py-3 text-right text-muted-foreground">{tx.previousStock}</td>
                          <td className="px-4 py-3 text-right font-medium">{tx.newStock}</td>
                          <td className="px-4 py-3 text-muted-foreground">{tx.reason}</td>
                          <td className="px-4 py-3 text-muted-foreground text-xs">{tx.referenceDocument || '—'}</td>
                          <td className="px-4 py-3 text-muted-foreground text-xs max-w-[150px] truncate">{tx.notes || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <TablePagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  pageSize={pagination.pageSize}
                  totalItems={transactions.length}
                  onPageChange={pagination.setCurrentPage}
                  onPageSizeChange={pagination.setPageSize}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <InventoryEntryDialog open={entryOpen} onOpenChange={setEntryOpen} products={products} />
      <InventoryExitDialog open={exitOpen} onOpenChange={setExitOpen} products={products} />
    </div>
  );
}
