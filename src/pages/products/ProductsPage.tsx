import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Search, Package, ArrowUpDown, Eye } from 'lucide-react';
import { useProducts, useDeleteProduct } from '@/hooks/useProducts';
import { Product } from '@/types/product';
import { ProductFormDialog } from './components/ProductFormDialog';
import { ProductMovementsDialog } from './components/ProductMovementsDialog';
import { TablePagination } from '@/components/ui/table-pagination';
import { usePagination } from '@/hooks/usePagination';
import { differenceInDays } from 'date-fns';

export default function ProductsPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [onlyActive, setOnlyActive] = useState(true);
  const [onlyLowStock, setOnlyLowStock] = useState(searchParams.get('onlyLowStock') === 'true');
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [movementsProduct, setMovementsProduct] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: products = [], isLoading } = useProducts(onlyActive, onlyLowStock);
  const deleteProduct = useDeleteProduct();

  const filtered = useMemo(() => {
    if (!search) return products;
    const q = search.toLowerCase();
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q)
    );
  }, [products, search]);

  const pagination = usePagination({ items: filtered });
  const paged = pagination.paginatedItems;

  const isLowStock = (p: Product) => p.currentStock <= p.minimumStock;
  const isExpiringSoon = (p: Product) => {
    if (!p.expirationDate) return false;
    return differenceInDays(new Date(p.expirationDate), new Date()) < 90;
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteProduct.mutateAsync(deleteId);
    setDeleteId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Productos</h1>
          <p className="text-muted-foreground">Gestiona el catálogo de productos</p>
        </div>
        <Button onClick={() => { setEditingProduct(null); setFormOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Nuevo Producto
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o código..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch id="active" checked={onlyActive} onCheckedChange={setOnlyActive} />
              <Label htmlFor="active" className="text-sm">Solo activos</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="lowstock" checked={onlyLowStock} onCheckedChange={setOnlyLowStock} />
              <Label htmlFor="lowstock" className="text-sm">Solo stock bajo</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {isLoading ? (
        <Card className="border-0 shadow-sm"><CardContent className="py-8 space-y-3">
          {[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
        </CardContent></Card>
      ) : filtered.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Package className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">No hay productos</h3>
            <p className="text-muted-foreground">Agrega tu primer producto para comenzar</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Código</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Nombre</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Categoría</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Marca</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Stock</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Precio Venta</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">Estado</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((product) => (
                    <tr key={product.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="px-4 py-3 font-mono text-xs">{product.code}</td>
                      <td className="px-4 py-3 font-medium">{product.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{product.category}</td>
                      <td className="px-4 py-3 text-muted-foreground">{product.brand || '—'}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={isLowStock(product) ? 'text-destructive font-bold' : ''}>
                          {product.currentStock}
                        </span>
                        {isLowStock(product) && (
                          <Badge variant="destructive" className="ml-2 text-[10px]">Bajo</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        L {product.salePrice.toLocaleString('es-HN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {!product.isActive ? (
                          <Badge variant="secondary">Inactivo</Badge>
                        ) : isExpiringSoon(product) ? (
                          <Badge className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30">
                            Por vencer
                          </Badge>
                        ) : (
                          <Badge className="bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30">
                            Activo
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => { setEditingProduct(product); setFormOpen(true); }}>
                            {t('common.edit')}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setMovementsProduct(product)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setDeleteId(product.id)}>
                            {t('common.delete')}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <TablePagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              pageSize={pagination.pageSize}
              totalItems={filtered.length}
              onPageChange={pagination.setCurrentPage}
              onPageSizeChange={pagination.setPageSize}
            />
          </CardContent>
        </Card>
      )}

      <ProductFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        product={editingProduct}
      />

      {movementsProduct && (
        <ProductMovementsDialog
          open={!!movementsProduct}
          onOpenChange={(o) => !o && setMovementsProduct(null)}
          product={movementsProduct}
        />
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
