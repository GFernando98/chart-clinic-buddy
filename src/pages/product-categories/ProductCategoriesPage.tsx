import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Search, Tag, AlertTriangle } from 'lucide-react';
import { useProductCategories, useDeleteProductCategory } from '@/hooks/useProductCategories';
import { ProductCategory } from '@/types/productCategory';
import { ProductCategoryFormDialog } from './components/ProductCategoryFormDialog';
import { TablePagination } from '@/components/ui/table-pagination';
import { usePagination } from '@/hooks/usePagination';

export default function ProductCategoriesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  const [deleteCategory, setDeleteCategory] = useState<ProductCategory | null>(null);

  const { data: categories = [], isLoading } = useProductCategories();
  const deleteMutation = useDeleteProductCategory();

  const filtered = useMemo(() => {
    let result = categories;
    if (statusFilter === 'active') result = result.filter((c) => c.isActive);
    if (statusFilter === 'inactive') result = result.filter((c) => !c.isActive);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((c) => c.name.toLowerCase().includes(q));
    }
    return result;
  }, [categories, search, statusFilter]);

  const pagination = usePagination({ items: filtered });
  const paged = pagination.paginatedItems;

  const handleDelete = async () => {
    if (!deleteCategory) return;
    await deleteMutation.mutateAsync(deleteCategory.id);
    setDeleteCategory(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Categorías de Productos</h1>
          <p className="text-muted-foreground">Gestiona las categorías para organizar tus productos</p>
        </div>
        <Button onClick={() => { setEditingCategory(null); setFormOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Nueva Categoría
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as 'all' | 'active' | 'inactive')}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="inactive">Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {isLoading ? (
        <Card className="border-0 shadow-sm"><CardContent className="py-8 space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
        </CardContent></Card>
      ) : filtered.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Tag className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">No hay categorías</h3>
            <p className="text-muted-foreground">Agrega tu primera categoría para comenzar</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Nombre</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Descripción</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">Color</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">Productos</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">Estado</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((cat) => (
                    <tr key={cat.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium">{cat.name}</td>
                      <td className="px-4 py-3 text-muted-foreground max-w-[250px] truncate">
                        {cat.description || '—'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {cat.color ? (
                          <div className="inline-flex items-center gap-2">
                            <div
                              className="w-5 h-5 rounded border border-border"
                              style={{ backgroundColor: cat.color }}
                            />
                            <span className="text-xs font-mono text-muted-foreground">{cat.color}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant="secondary">{cat.productCount}</Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {cat.isActive ? (
                          <Badge className="bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30">
                            Activo
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Inactivo</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { setEditingCategory(cat); setFormOpen(true); }}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => setDeleteCategory(cat)}
                          >
                            Eliminar
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
              itemsPerPage={pagination.itemsPerPage}
              totalItems={pagination.totalItems}
              onPageChange={pagination.setCurrentPage}
              onItemsPerPageChange={pagination.setItemsPerPage}
            />
          </CardContent>
        </Card>
      )}

      <ProductCategoryFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        category={editingCategory}
      />

      <AlertDialog open={!!deleteCategory} onOpenChange={(o) => !o && setDeleteCategory(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteCategory && deleteCategory.productCount > 0 ? (
                <span className="flex items-start gap-2 text-yellow-600 dark:text-yellow-400">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                  Esta categoría tiene {deleteCategory.productCount} producto(s) asociado(s).
                  Eliminarla podría dejar esos productos sin categoría.
                </span>
              ) : (
                'Esta acción no se puede deshacer.'
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
