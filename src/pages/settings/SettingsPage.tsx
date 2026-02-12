import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  Search,
  Edit,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  Loader2,
  Settings,
  FolderOpen,
  Building2,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  useTreatmentCategories,
  useCreateTreatmentCategory,
  useUpdateTreatmentCategory,
  useToggleTreatmentCategoryActive,
} from '@/hooks/useTreatmentCategories';
import { TreatmentCategoryFormDialog } from './components/TreatmentCategoryFormDialog';
import { ClinicInformationTab } from './components/ClinicInformationTab';
import { TaxInformationTab } from './components/TaxInformationTab';
import { TreatmentCategoryDto, TreatmentCategoryFormData } from '@/services/treatmentCategoryService';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePagination } from '@/hooks/usePagination';
import { TablePagination, MobilePagination } from '@/components/ui/table-pagination';

export const SettingsPage = () => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  // State
  const [activeSection, setActiveSection] = useState('categories');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<TreatmentCategoryDto | null>(null);

  // Fetch categories from API
  const { data: categories = [], isLoading, error } = useTreatmentCategories();
  const createCategory = useCreateTreatmentCategory();
  const updateCategory = useUpdateTreatmentCategory();
  const toggleActive = useToggleTreatmentCategoryActive();

  // Filtered categories
  const filteredCategories = useMemo(() => {
    return categories.filter((category) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        !searchQuery ||
        category.name.toLowerCase().includes(searchLower) ||
        (category.description?.toLowerCase().includes(searchLower) ?? false)
      );
    });
  }, [categories, searchQuery]);

  // Pagination
  const {
    paginatedItems,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    setCurrentPage,
    setItemsPerPage,
  } = usePagination({ items: filteredCategories });

  // Handlers
  const handleNewCategory = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  const handleEditCategory = (category: TreatmentCategoryDto) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleSaveCategory = async (data: TreatmentCategoryFormData) => {
    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({ id: editingCategory.id, data });
      } else {
        await createCategory.mutateAsync(data);
      }
      setIsFormOpen(false);
      setEditingCategory(null);
    } catch {
      // Error is handled by the mutation's onError callback
    }
  };

  const handleToggleActive = (category: TreatmentCategoryDto) => {
    toggleActive.mutate(category.id);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <Settings className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold">{t('common.error')}</h3>
        <p className="text-muted-foreground">{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('settings.title')}</h1>
        <p className="text-muted-foreground">{t('settings.description')}</p>
      </div>

      {/* Section Selector */}
      <Select value={activeSection} onValueChange={setActiveSection}>
        <SelectTrigger className="w-[280px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="categories">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              {t('settings.treatmentCategories')}
            </div>
          </SelectItem>
          <SelectItem value="clinic">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              {t('clinic.title')}
            </div>
          </SelectItem>
          <SelectItem value="tax">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              {t('tax.title')}
            </div>
          </SelectItem>
        </SelectContent>
      </Select>

      {/* Categories Section */}
      {activeSection === 'categories' && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-lg">{t('settings.treatmentCategories')}</CardTitle>
                <CardDescription>
                  {t('common.showing')} {filteredCategories.length} {t('common.of')} {categories.length} {t('common.results')}
                </CardDescription>
              </div>
              <Button onClick={handleNewCategory}>
                <Plus className="h-4 w-4 mr-2" />
                {t('settings.newCategory')}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* Search */}
            <div className="relative px-6 pb-4">
              <Search className="absolute left-9 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('common.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Content */}
            {filteredCategories.length === 0 ? (
              <div className="text-center py-12">
                <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-medium">{t('settings.noCategories')}</h3>
                <p className="text-muted-foreground mt-2">{t('settings.noCategoriesDescription')}</p>
              </div>
            ) : isMobile ? (
              // Mobile: Card layout
              <div className="space-y-3 px-6 pb-4">
                {paginatedItems.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{category.name}</span>
                        {category.isActive ? (
                          <Badge variant="outline" className="bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30 text-xs">
                            <CheckCircle2 className="h-3 w-3" />
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30 text-xs">
                            <XCircle className="h-3 w-3" />
                          </Badge>
                        )}
                      </div>
                      {category.description && (
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditCategory(category)}>
                          <Edit className="h-4 w-4 mr-2" />
                          {t('common.edit')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleToggleActive(category)}>
                          {category.isActive ? (
                            <>
                              <XCircle className="h-4 w-4 mr-2" />
                              {t('users.deactivate')}
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              {t('users.activate')}
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            ) : (
              // Desktop: Table layout
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('common.name')}</TableHead>
                    <TableHead>{t('common.description')}</TableHead>
                    <TableHead>{t('common.status')}</TableHead>
                    <TableHead className="text-right">{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedItems.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {category.description || '-'}
                      </TableCell>
                      <TableCell>
                        {category.isActive ? (
                          <Badge variant="outline" className="bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            {t('common.active')}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30">
                            <XCircle className="h-3 w-3 mr-1" />
                            {t('common.inactive')}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditCategory(category)}>
                              <Edit className="h-4 w-4 mr-2" />
                              {t('common.edit')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleToggleActive(category)}>
                              {category.isActive ? (
                                <>
                                  <XCircle className="h-4 w-4 mr-2" />
                                  {t('users.deactivate')}
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  {t('users.activate')}
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            
            {/* Pagination */}
            {filteredCategories.length > 0 && (
              isMobile ? (
                <MobilePagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  onItemsPerPageChange={setItemsPerPage}
                />
              ) : (
                <TablePagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  onItemsPerPageChange={setItemsPerPage}
                />
              )
            )}
          </CardContent>
        </Card>
      )}

      {/* Clinic Section */}
      {activeSection === 'clinic' && <ClinicInformationTab />}

      {/* Tax Section */}
      {activeSection === 'tax' && <TaxInformationTab />}

      {/* Form Dialog */}
      <TreatmentCategoryFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        category={editingCategory}
        onSave={handleSaveCategory}
        isSaving={createCategory.isPending || updateCategory.isPending}
      />
    </div>
  );
};
