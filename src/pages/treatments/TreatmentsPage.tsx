import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  Search,
  Eye,
  Edit,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  FileText,
  Loader2,
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
import { Card, CardContent } from '@/components/ui/card';
import { Treatment, TreatmentCategory } from '@/types';
import { TreatmentCategoryBadge } from './components/TreatmentCategoryBadge';
import { TreatmentFormDialog } from './components/TreatmentFormDialog';
import { TreatmentDetailDialog } from './components/TreatmentDetailDialog';
import { useTreatments, useCreateTreatment, useUpdateTreatment } from '@/hooks/useTreatments';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

export const TreatmentsPage = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState<Treatment | null>(null);

  // Fetch treatments from API
  const { data: treatments = [], isLoading, error } = useTreatments();
  const createTreatment = useCreateTreatment();
  const updateTreatment = useUpdateTreatment();

  // Category options for filter
  const categoryOptions = [
    { value: TreatmentCategory.Preventive, label: t('treatments.preventive') },
    { value: TreatmentCategory.Restorative, label: t('treatments.restorative') },
    { value: TreatmentCategory.Endodontics, label: t('treatments.endodontics') },
    { value: TreatmentCategory.Periodontics, label: t('treatments.periodontics') },
    { value: TreatmentCategory.Orthodontics, label: t('treatments.orthodontics') },
    { value: TreatmentCategory.Prosthodontics, label: t('treatments.prosthodontics') },
    { value: TreatmentCategory.OralSurgery, label: t('treatments.oralSurgery') },
    { value: TreatmentCategory.Pediatric, label: t('treatments.pediatric') },
    { value: TreatmentCategory.Cosmetic, label: t('treatments.cosmetic') },
    { value: TreatmentCategory.Diagnostic, label: t('treatments.diagnostic') },
  ];

  // Filtered treatments
  const filteredTreatments = useMemo(() => {
    return treatments.filter((treatment) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        treatment.name.toLowerCase().includes(searchLower) ||
        treatment.code.toLowerCase().includes(searchLower) ||
        (treatment.description?.toLowerCase().includes(searchLower) ?? false);

      // Category filter
      const matchesCategory =
        categoryFilter === 'all' || treatment.category === Number(categoryFilter);

      // Status filter
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && treatment.isActive !== false) ||
        (statusFilter === 'inactive' && treatment.isActive === false);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [treatments, searchQuery, categoryFilter, statusFilter]);

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-HN', {
      style: 'currency',
      currency: 'HNL',
    }).format(price);
  };

  // Handlers
  const handleViewTreatment = (treatment: Treatment) => {
    setSelectedTreatment(treatment);
    setIsDetailOpen(true);
  };

  const handleEditTreatment = (treatment: Treatment) => {
    setEditingTreatment(treatment);
    setIsDetailOpen(false);
    setIsFormOpen(true);
  };

  const handleNewTreatment = () => {
    setEditingTreatment(null);
    setIsFormOpen(true);
  };

  const handleSaveTreatment = (treatmentData: Partial<Treatment>) => {
    if (editingTreatment) {
      updateTreatment.mutate({ id: editingTreatment.id, data: treatmentData as any });
    } else {
      createTreatment.mutate(treatmentData as any);
    }
    setEditingTreatment(null);
    setIsFormOpen(false);
  };

  const handleToggleActive = (treatment: Treatment) => {
    const newStatus = treatment.isActive === false ? true : false;
    updateTreatment.mutate({ id: treatment.id, data: { ...treatment, isActive: newStatus } as any });
    setIsDetailOpen(false);
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
        <FileText className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold">{t('common.error')}</h3>
        <p className="text-muted-foreground">{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('treatments.title')}</h1>
          <p className="text-muted-foreground">
            {t('common.showing')} {filteredTreatments.length} {t('common.of')}{' '}
            {treatments.length} {t('common.results')}
          </p>
        </div>
        <Button onClick={handleNewTreatment}>
          <Plus className="h-4 w-4 mr-2" />
          {t('treatments.newTreatment')}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('common.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder={t('treatments.category')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('treatments.allCategories')}</SelectItem>
            {categoryOptions.map((option) => (
              <SelectItem key={option.value} value={String(option.value)}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder={t('common.status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('appointments.allStatuses')}</SelectItem>
            <SelectItem value="active">{t('common.active')}</SelectItem>
            <SelectItem value="inactive">{t('common.inactive')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {filteredTreatments.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium">{t('treatments.noTreatments')}</h3>
          <p className="text-muted-foreground mt-2">{t('patients.noSearchResults')}</p>
        </div>
      ) : isMobile ? (
        // Mobile: Card layout
        <div className="space-y-4">
          {filteredTreatments.map((treatment) => (
            <Card
              key={treatment.id}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => handleViewTreatment(treatment)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{treatment.name}</span>
                      {treatment.isActive !== false ? (
                        <Badge
                          variant="outline"
                          className="bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30 text-xs"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30 text-xs"
                        >
                          <XCircle className="h-3 w-3" />
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-muted-foreground">
                        {treatment.code}
                      </span>
                      <TreatmentCategoryBadge category={treatment.category} />
                    </div>
                    <p className="text-sm font-medium">{formatPrice(treatment.defaultPrice)}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewTreatment(treatment);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        {t('common.view')}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditTreatment(treatment);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        {t('common.edit')}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleActive(treatment);
                        }}
                      >
                        {treatment.isActive !== false ? (
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
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        // Desktop: Table layout
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('treatments.code')}</TableHead>
                <TableHead>{t('common.name')}</TableHead>
                <TableHead>{t('treatments.category')}</TableHead>
                <TableHead className="text-right">{t('treatments.defaultPrice')}</TableHead>
                <TableHead className="text-center">{t('treatments.estimatedDuration')}</TableHead>
                <TableHead>{t('common.status')}</TableHead>
                <TableHead className="text-right">{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTreatments.map((treatment) => (
                <TableRow
                  key={treatment.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleViewTreatment(treatment)}
                >
                  <TableCell className="font-mono">{treatment.code}</TableCell>
                  <TableCell className="font-medium">{treatment.name}</TableCell>
                  <TableCell>
                    <TreatmentCategoryBadge category={treatment.category} />
                  </TableCell>
                  <TableCell className="text-right">{formatPrice(treatment.defaultPrice)}</TableCell>
                  <TableCell className="text-center">
                    {treatment.estimatedDurationMinutes} min
                  </TableCell>
                  <TableCell>
                    {treatment.isActive !== false ? (
                      <Badge
                        variant="outline"
                        className="bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30"
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {t('common.active')}
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30"
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        {t('common.inactive')}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewTreatment(treatment);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          {t('common.view')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditTreatment(treatment);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          {t('common.edit')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleActive(treatment);
                          }}
                        >
                          {treatment.isActive !== false ? (
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
        </div>
      )}

      {/* Dialogs */}
      <TreatmentFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        treatment={editingTreatment}
        onSave={handleSaveTreatment}
      />

      <TreatmentDetailDialog
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        treatment={selectedTreatment}
        onEdit={handleEditTreatment}
        onToggleActive={handleToggleActive}
      />
    </div>
  );
};
