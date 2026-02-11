import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { ToothRecord, ToothCondition, ToothSurface, Odontogram, ToothTreatmentRecord } from '@/types';
import { DentalChart } from '@/components/odontogram/DentalChart';
import { ToothDetailPanel } from '@/components/odontogram/ToothDetailPanel';
import { ConditionLegend } from '@/components/odontogram/ConditionLegend';
import { AddToothTreatmentDialog, ToothTreatmentFormData } from '@/components/odontogram/AddToothTreatmentDialog';
import { AddGlobalTreatmentDialog, GlobalTreatmentFormData } from '@/components/odontogram/AddGlobalTreatmentDialog';
import { GlobalTreatmentsSection } from '@/components/odontogram/GlobalTreatmentsSection';
import { InvoicePreviewDialog } from '@/components/odontogram/InvoicePreviewDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Printer, User, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { usePatients } from '@/hooks/usePatients';
import { useDoctors } from '@/hooks/useDoctors';
import { 
  usePatientOdontograms, 
  useToothTreatments,
  useAllOdontogramTreatments,
  useUpdateTooth,
  useAddSurface,
  useAddToothTreatment,
  useAddGlobalTreatment,
  useCreateOdontogram
} from '@/hooks/useOdontogram';

export default function OdontogramPage() {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const locale = i18n.language === 'es' ? es : enUS;
  
  // Fetch patients and doctors from API
  const { data: patients = [], isLoading: loadingPatients } = usePatients();
  const { data: doctors = [], isLoading: loadingDoctors } = useDoctors();
  
  // State
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    searchParams.get('patientId') || null
  );
  const [selectedOdontogramId, setSelectedOdontogramId] = useState<string | null>(null);
  const [isPediatric, setIsPediatric] = useState(false);
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [teethRecords, setTeethRecords] = useState<ToothRecord[]>([]);
  const [treatmentDialogOpen, setTreatmentDialogOpen] = useState(false);
  const [treatmentToothNumber, setTreatmentToothNumber] = useState<number | null>(null);
  const [confirmNewOdontogramOpen, setConfirmNewOdontogramOpen] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [globalTreatmentDialogOpen, setGlobalTreatmentDialogOpen] = useState(false);
  const [invoicePreviewOpen, setInvoicePreviewOpen] = useState(false);
  
  // Fetch all odontograms for the patient
  const { data: patientOdontograms = [], isLoading: loadingOdontograms } = usePatientOdontograms(selectedPatientId || '');
  
  // Sort odontograms by date (most recent first)
  const sortedOdontograms = useMemo(() => {
    return [...patientOdontograms].sort((a, b) => {
      const dateA = a.examinationDate ? new Date(a.examinationDate).getTime() : 0;
      const dateB = b.examinationDate ? new Date(b.examinationDate).getTime() : 0;
      return dateB - dateA; // Most recent first
    });
  }, [patientOdontograms]);
  
  // Get the selected odontogram (default to most recent)
  const selectedOdontogram = sortedOdontograms.find(o => o.id === selectedOdontogramId) || sortedOdontograms[0] || null;
  
  
  // Get selected tooth record
  const selectedToothRecord = selectedTooth
    ? teethRecords.find(t => t.toothNumber === selectedTooth) || {
        id: `tooth-${selectedTooth}`,
        toothNumber: selectedTooth,
        toothType: isPediatric ? 2 : 1,
        condition: ToothCondition.Healthy,
        isPresent: true,
        surfaces: [],
      }
    : null;
  
  // Fetch treatments for selected tooth
  const { data: selectedToothTreatments = [] } = useToothTreatments(selectedToothRecord?.id || '');
  
  // Fetch all treatments for the odontogram (including global treatments)
  const { data: allOdontogramTreatments = [] } = useAllOdontogramTreatments(selectedOdontogram?.id || '');
  
  // Mutations
  const updateToothMutation = useUpdateTooth();
  const addSurfaceMutation = useAddSurface();
  const addTreatmentMutation = useAddToothTreatment();
  const addGlobalTreatmentMutation = useAddGlobalTreatment();
  const createOdontogramMutation = useCreateOdontogram();
  
  const selectedPatient = patients.find(p => p.id === selectedPatientId);
  
  // Load teeth records when odontogram is loaded
  useEffect(() => {
    if (selectedOdontogram?.teethRecords) {
      console.log('📋 Odontogram loaded:', selectedOdontogram);
      console.log('🦷 TeethRecords from API:', selectedOdontogram.teethRecords);
      setTeethRecords(selectedOdontogram.teethRecords);
    } else {
      console.log('⚠️ No teethRecords in odontogram:', selectedOdontogram);
      setTeethRecords([]);
    }
  }, [selectedOdontogram]);
  
  // Auto-select most recent odontogram when list changes
  useEffect(() => {
    if (sortedOdontograms.length > 0 && !selectedOdontogramId) {
      setSelectedOdontogramId(sortedOdontograms[0].id);
    }
  }, [sortedOdontograms, selectedOdontogramId]);
  
  const handleToothClick = (toothNumber: number) => {
    setSelectedTooth(toothNumber === selectedTooth ? null : toothNumber);
  };
  
  const handleSurfaceClick = (toothNumber: number, surface: ToothSurface) => {
    if (selectedTooth !== toothNumber) {
      setSelectedTooth(toothNumber);
    }
  };
  
  const handleConditionChange = (toothNumber: number, condition: ToothCondition) => {
    const toothRecord = teethRecords.find(t => t.toothNumber === toothNumber);
    
    if (toothRecord?.id && !toothRecord.id.startsWith('tooth-')) {
      // Update existing record via API - send numeric enum values
      updateToothMutation.mutate({
        toothRecordId: toothRecord.id,
        data: {
          condition: condition as number,
          isPresent: condition !== ToothCondition.Extracted && condition !== ToothCondition.Missing,
          notes: toothRecord.notes,
        }
      });
    }
    
    // Update local state for immediate feedback
    setTeethRecords(prev => {
      const existing = prev.find(t => t.toothNumber === toothNumber);
      if (existing) {
        return prev.map(t => 
          t.toothNumber === toothNumber 
            ? { ...t, condition, isPresent: condition !== ToothCondition.Extracted && condition !== ToothCondition.Missing }
            : t
        );
      }
      return [...prev, {
        id: `tooth-${toothNumber}`,
        toothNumber,
        toothType: isPediatric ? 2 : 1,
        condition,
        isPresent: condition !== ToothCondition.Extracted && condition !== ToothCondition.Missing,
        surfaces: [],
      }];
    });
  };
  
  const handleSurfaceConditionChange = (toothNumber: number, surface: ToothSurface, condition: ToothCondition) => {
    const toothRecord = teethRecords.find(t => t.toothNumber === toothNumber);
    
    if (toothRecord?.id && !toothRecord.id.startsWith('tooth-')) {
      // Send numeric enum values to API
      addSurfaceMutation.mutate({
        toothRecordId: toothRecord.id,
        data: {
          surface: surface as number,
          condition: condition as number,
        }
      });
    }
    
    // Update local state
    setTeethRecords(prev => {
      const existing = prev.find(t => t.toothNumber === toothNumber);
      if (existing) {
        const updatedSurfaces = existing.surfaces.filter(s => s.surface !== surface);
        if (condition !== ToothCondition.Healthy) {
          updatedSurfaces.push({
            id: `surface-${toothNumber}-${surface}`,
            surface,
            condition,
          });
        }
        return prev.map(t =>
          t.toothNumber === toothNumber
            ? { ...t, surfaces: updatedSurfaces }
            : t
        );
      }
      return [...prev, {
        id: `tooth-${toothNumber}`,
        toothNumber,
        toothType: isPediatric ? 2 : 1,
        condition: ToothCondition.Healthy,
        isPresent: true,
        surfaces: condition !== ToothCondition.Healthy ? [{
          id: `surface-${toothNumber}-${surface}`,
          surface,
          condition,
        }] : [],
      }];
    });
    
    toast({
      title: t('success.updated'),
    });
  };
  
  const handleAddTreatment = (toothNumber: number) => {
    setTreatmentToothNumber(toothNumber);
    setTreatmentDialogOpen(true);
  };
  
  const handleTreatmentSubmit = (data: ToothTreatmentFormData) => {
    const toothRecord = teethRecords.find(t => t.toothNumber === treatmentToothNumber);
    
    if (toothRecord?.id && !toothRecord.id.startsWith('tooth-')) {
      addTreatmentMutation.mutate({
        toothRecordId: toothRecord.id,
        data: {
          treatmentId: data.treatmentId,
          doctorId: data.doctorId,
          status: data.status,
          performedDate: data.performedDate,
          notes: data.notes,
        }
      }, {
        onSuccess: () => {
          setTreatmentDialogOpen(false);
          setTreatmentToothNumber(null);
        }
      });
    } else {
      toast({
        title: 'Error',
        description: 'El diente debe tener un registro guardado para agregar tratamientos',
        variant: 'destructive',
      });
    }
  };
  
  const handleAddGlobalTreatment = () => {
    setGlobalTreatmentDialogOpen(true);
  };
  
  const handleGlobalTreatmentSubmit = (data: GlobalTreatmentFormData) => {
    if (!selectedOdontogram?.id) {
      toast({
        title: 'Error',
        description: 'Debe seleccionar un odontograma primero',
        variant: 'destructive',
      });
      return;
    }
    
    addGlobalTreatmentMutation.mutate({
      odontogramId: selectedOdontogram.id,
      data: {
        treatmentId: data.treatmentId,
        doctorId: data.doctorId,
        status: data.status,
        performedDate: data.performedDate,
        notes: data.notes,
      }
    }, {
      onSuccess: () => {
        setGlobalTreatmentDialogOpen(false);
      }
    });
  };
  
  const handleNewOdontogramClick = () => {
    if (!selectedPatientId) return;
    
    // Siempre pedir confirmación
    setConfirmNewOdontogramOpen(true);
  };
  
  const handleConfirmNewOdontogram = () => {
    if (!selectedPatientId || !selectedDoctorId) return;
    
    createOdontogramMutation.mutate({
      patientId: selectedPatientId,
      doctorId: selectedDoctorId,
      isPediatric: isPediatric,
      examinationDate: new Date().toISOString(),
      notes: '',
    }, {
      onSuccess: (newOdontogram) => {
        // Seleccionar el nuevo odontograma automáticamente
        setSelectedOdontogramId(newOdontogram.id);
        setConfirmNewOdontogramOpen(false);
        setSelectedDoctorId('');
      }
    });
  };
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('odontogram.title')}</h1>
          <p className="text-muted-foreground">
            {selectedPatient 
              ? `${selectedPatient.fullName} - ${selectedPatient.age} ${t('patients.years')}`
              : t('appointments.selectPatient')
            }
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {/* Patient Selector */}
          <Select
            value={selectedPatientId || ''}
            onValueChange={(value) => {
              setSelectedPatientId(value);
              setSelectedOdontogramId(null);
              setSelectedTooth(null);
              setTeethRecords([]);
            }}
            disabled={loadingPatients}
          >
            <SelectTrigger className="w-[200px]">
              <User className="w-4 h-4 mr-2" />
              <SelectValue placeholder={loadingPatients ? 'Cargando...' : t('appointments.selectPatient')} />
            </SelectTrigger>
            <SelectContent>
              {patients.map((patient) => (
                <SelectItem key={patient.id} value={patient.id}>
                  {patient.fullName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Odontogram Selector */}
          {selectedPatientId && patientOdontograms.length > 0 && (
            <Select
              value={selectedOdontogramId || ''}
              onValueChange={(value) => {
                setSelectedOdontogramId(value);
                setSelectedTooth(null);
              }}
              disabled={loadingOdontograms}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={loadingOdontograms ? 'Cargando...' : 'Seleccionar fecha'} />
              </SelectTrigger>
              <SelectContent>
                {patientOdontograms.map((odontogram) => (
                  <SelectItem key={odontogram.id} value={odontogram.id}>
                    {odontogram.examinationDate ? (() => {
                      try {
                        const date = new Date(odontogram.examinationDate);
                        return isNaN(date.getTime()) 
                          ? `Odontograma ${odontogram.id.slice(0, 8)}`
                          : format(date, 'dd/MM/yyyy', { locale });
                      } catch {
                        return `Odontograma ${odontogram.id.slice(0, 8)}`;
                      }
                    })() : `Odontograma ${odontogram.id.slice(0, 8)}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          {/* Adult/Pediatric Toggle */}
          <div className="flex items-center space-x-2 px-3 py-2 bg-muted rounded-lg">
            <Label htmlFor="pediatric" className="text-sm">
              {t('odontogram.adult')}
            </Label>
            <Switch
              id="pediatric"
              checked={isPediatric}
              onCheckedChange={setIsPediatric}
            />
            <Label htmlFor="pediatric" className="text-sm">
              {t('odontogram.pediatric')}
            </Label>
          </div>
          
          {/* Action Buttons */}
          <Button variant="outline" size="icon" onClick={handlePrint}>
            <Printer className="w-4 h-4" />
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => setInvoicePreviewOpen(true)}
            disabled={!selectedOdontogram}
          >
            <FileText className="w-4 h-4 mr-2" />
            {t('invoices.preview')}
          </Button>
          
          <Button 
            onClick={handleNewOdontogramClick} 
            disabled={!selectedPatientId || createOdontogramMutation.isPending}
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('odontogram.newChart')}
          </Button>
        </div>
      </div>
      
      {/* Main Content */}
      {selectedPatientId ? (
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Dental Chart */}
          <Card className="flex-1 border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                {loadingOdontograms ? (
                  <Skeleton className="h-6 w-48" />
                ) : selectedOdontogram?.examinationDate ? (
                  (() => {
                    try {
                      const date = new Date(selectedOdontogram.examinationDate);
                      return isNaN(date.getTime()) 
                        ? t('odontogram.title')
                        : format(date, 'dd MMMM yyyy', { locale });
                    } catch {
                      return t('odontogram.title');
                    }
                  })()
                ) : (
                  t('odontogram.newChart')
                )}
              </CardTitle>
              {selectedOdontogram && (
                <CardDescription>Odontograma del paciente</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {loadingOdontograms ? (
                <div className="flex items-center justify-center py-16">
                  <Skeleton className="h-64 w-full" />
                </div>
              ) : !selectedOdontogram ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="text-muted-foreground mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="64"
                      height="64"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mx-auto opacity-50"
                    >
                      <path d="M12 2c2 0 3.5 1.5 3.5 3.5 0 1-.5 2-1.5 3L12 12l-2-3.5c-1-1-1.5-2-1.5-3C8.5 3.5 10 2 12 2z" />
                      <path d="M12 12v10" />
                      <path d="M8 22h8" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium mb-2">No hay odontograma</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Este paciente no tiene un odontograma registrado. Crea uno nuevo para comenzar.
                  </p>
                  <Button 
                    onClick={handleNewOdontogramClick}
                    disabled={createOdontogramMutation.isPending}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Odontograma
                  </Button>
                </div>
              ) : (
                <>
                  <DentalChart
                    teethRecords={teethRecords}
                    selectedTooth={selectedTooth}
                    isPediatric={isPediatric}
                    onToothClick={handleToothClick}
                    onSurfaceClick={handleSurfaceClick}
                  />
                  
                  <div className="mt-6 pt-4 border-t">
                    <ConditionLegend />
                  </div>
                  
                  {/* Global Treatments Section */}
                  <div className="mt-6">
                    <GlobalTreatmentsSection
                      treatments={allOdontogramTreatments}
                      onAddTreatment={handleAddGlobalTreatment}
                      isLoading={addGlobalTreatmentMutation.isPending}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          
          {/* Tooth Detail Panel */}
          {selectedToothRecord && (
            <ToothDetailPanel
              toothRecord={selectedToothRecord}
              treatments={selectedToothTreatments}
              onClose={() => setSelectedTooth(null)}
              onConditionChange={handleConditionChange}
              onSurfaceConditionChange={handleSurfaceConditionChange}
              onAddTreatment={handleAddTreatment}
            />
          )}
        </div>
      ) : (
        <Card className="border-0 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <User className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {t('appointments.selectPatient')}
            </h3>
            <p className="text-muted-foreground text-center max-w-md">
              Seleccione un paciente para ver o crear su odontograma
            </p>
          </CardContent>
        </Card>
      )}
      
      {/* Add Tooth Treatment Dialog */}
      <AddToothTreatmentDialog
        open={treatmentDialogOpen}
        onOpenChange={setTreatmentDialogOpen}
        toothNumber={treatmentToothNumber || 0}
        defaultDoctorId={selectedOdontogram?.doctorId}
        onSubmit={handleTreatmentSubmit}
        isLoading={addTreatmentMutation.isPending}
      />
      
      {/* Add Global Treatment Dialog */}
      <AddGlobalTreatmentDialog
        open={globalTreatmentDialogOpen}
        onOpenChange={setGlobalTreatmentDialogOpen}
        defaultDoctorId={selectedOdontogram?.doctorId}
        onSubmit={handleGlobalTreatmentSubmit}
        isLoading={addGlobalTreatmentMutation.isPending}
      />
      
      {/* Confirm New Odontogram Dialog */}
      <AlertDialog open={confirmNewOdontogramOpen} onOpenChange={(open) => {
        setConfirmNewOdontogramOpen(open);
        if (!open) setSelectedDoctorId('');
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Crear nuevo odontograma</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                {patientOdontograms.length > 0 && (
                  <p>
                    Este paciente ya tiene {patientOdontograms.length} odontograma(s) registrado(s). 
                    El odontograma actual se mantendrá en el historial.
                  </p>
                )}
                <div className="space-y-2">
                  <Label htmlFor="doctor-select">Doctor responsable *</Label>
                  <Select
                    value={selectedDoctorId}
                    onValueChange={setSelectedDoctorId}
                    disabled={loadingDoctors}
                  >
                    <SelectTrigger id="doctor-select">
                      <SelectValue placeholder={loadingDoctors ? 'Cargando...' : 'Seleccionar doctor'} />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.filter(d => d.isActive).map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          {doctor.fullName} - {doctor.specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmNewOdontogram}
              disabled={!selectedDoctorId || createOdontogramMutation.isPending}
            >
              {createOdontogramMutation.isPending ? 'Creando...' : 'Crear odontograma'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Invoice Preview Dialog */}
      <InvoicePreviewDialog
        open={invoicePreviewOpen}
        onOpenChange={setInvoicePreviewOpen}
        odontogramId={selectedOdontogram?.id || ''}
        patientName={selectedPatient?.fullName}
      />
    </div>
  );
}
