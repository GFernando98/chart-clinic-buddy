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
  Stethoscope,
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
import { Doctor } from '@/types';
import { DoctorFormDialog } from './components/DoctorFormDialog';
import { DoctorDetailDialog } from './components/DoctorDetailDialog';
import { useDoctors, useCreateDoctor, useUpdateDoctor } from '@/hooks/useDoctors';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

export const DoctorsPage = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);

  // Fetch doctors from API
  const { data: doctors = [], isLoading, error } = useDoctors();
  const createDoctor = useCreateDoctor();
  const updateDoctor = useUpdateDoctor();

  // Get unique specialties
  const specialties = useMemo(() => {
    const specs = new Set(doctors.map((d) => d.specialty));
    return Array.from(specs).sort();
  }, [doctors]);

  // Filtered doctors
  const filteredDoctors = useMemo(() => {
    return doctors.filter((doctor) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        doctor.fullName.toLowerCase().includes(searchLower) ||
        doctor.email.toLowerCase().includes(searchLower) ||
        doctor.licenseNumber.toLowerCase().includes(searchLower);

      // Specialty filter
      const matchesSpecialty =
        specialtyFilter === 'all' || doctor.specialty === specialtyFilter;

      // Status filter
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && doctor.isActive !== false) ||
        (statusFilter === 'inactive' && doctor.isActive === false);

      return matchesSearch && matchesSpecialty && matchesStatus;
    });
  }, [doctors, searchQuery, specialtyFilter, statusFilter]);

  // Handlers
  const handleViewDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsDetailOpen(true);
  };

  const handleEditDoctor = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setIsDetailOpen(false);
    setIsFormOpen(true);
  };

  const handleNewDoctor = () => {
    setEditingDoctor(null);
    setIsFormOpen(true);
  };

  const handleSaveDoctor = async (doctorData: Partial<Doctor>) => {
    try {
      if (editingDoctor) {
        await updateDoctor.mutateAsync({ id: editingDoctor.id, data: doctorData as any });
      } else {
        await createDoctor.mutateAsync(doctorData as any);
      }
      setEditingDoctor(null);
      setIsFormOpen(false);
    } catch {
      // Error is handled by the mutation's onError callback
    }
  };

  const handleToggleActive = (doctor: Doctor) => {
    const newStatus = doctor.isActive === false ? true : false;
    updateDoctor.mutate({ id: doctor.id, data: { ...doctor, isActive: newStatus } as any });
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
        <Stethoscope className="h-12 w-12 text-destructive mb-4" />
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
          <h1 className="text-2xl font-bold tracking-tight">{t('doctors.title')}</h1>
          <p className="text-muted-foreground">
            {t('common.showing')} {filteredDoctors.length} {t('common.of')}{' '}
            {doctors.length} {t('common.results')}
          </p>
        </div>
        <Button onClick={handleNewDoctor}>
          <Plus className="h-4 w-4 mr-2" />
          {t('doctors.newDoctor')}
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
        <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder={t('doctors.specialty')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('doctors.allSpecialties')}</SelectItem>
            {specialties.map((specialty) => (
              <SelectItem key={specialty} value={specialty}>
                {specialty}
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
      {filteredDoctors.length === 0 ? (
        <div className="text-center py-12">
          <Stethoscope className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium">{t('doctors.noDoctors')}</h3>
          <p className="text-muted-foreground mt-2">{t('patients.noSearchResults')}</p>
        </div>
      ) : isMobile ? (
        // Mobile: Card layout
        <div className="space-y-4">
          {filteredDoctors.map((doctor) => (
            <Card
              key={doctor.id}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => handleViewDoctor(doctor)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{doctor.fullName}</span>
                      {doctor.isActive !== false ? (
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
                    <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                    <p className="text-sm text-muted-foreground">{doctor.email}</p>
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
                          handleViewDoctor(doctor);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        {t('common.view')}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditDoctor(doctor);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        {t('common.edit')}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleActive(doctor);
                        }}
                      >
                        {doctor.isActive !== false ? (
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
                <TableHead>{t('common.name')}</TableHead>
                <TableHead>{t('doctors.specialty')}</TableHead>
                <TableHead>{t('doctors.licenseNumber')}</TableHead>
                <TableHead>{t('common.phone')}</TableHead>
                <TableHead>{t('common.status')}</TableHead>
                <TableHead className="text-right">{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDoctors.map((doctor) => (
                <TableRow
                  key={doctor.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleViewDoctor(doctor)}
                >
                  <TableCell className="font-medium">{doctor.fullName}</TableCell>
                  <TableCell>{doctor.specialty}</TableCell>
                  <TableCell>{doctor.licenseNumber}</TableCell>
                  <TableCell>{doctor.phone}</TableCell>
                  <TableCell>
                    {doctor.isActive !== false ? (
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
                            handleViewDoctor(doctor);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          {t('common.view')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditDoctor(doctor);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          {t('common.edit')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleActive(doctor);
                          }}
                        >
                          {doctor.isActive !== false ? (
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
      <DoctorFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        doctor={editingDoctor}
        onSave={handleSaveDoctor}
        isSaving={createDoctor.isPending || updateDoctor.isPending}
      />

      <DoctorDetailDialog
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        doctor={selectedDoctor}
        onEdit={handleEditDoctor}
        onToggleActive={handleToggleActive}
      />
    </div>
  );
};
