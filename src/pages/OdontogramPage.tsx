import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { ToothRecord, ToothCondition, ToothSurface, Odontogram, ToothTreatmentRecord } from '@/types';
import { DentalChart } from '@/components/odontogram/DentalChart';
import { ToothDetailPanel } from '@/components/odontogram/ToothDetailPanel';
import { ConditionLegend } from '@/components/odontogram/ConditionLegend';
import { AddToothTreatmentDialog, ToothTreatmentFormData } from '@/components/odontogram/AddToothTreatmentDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Printer, History, User } from 'lucide-react';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { usePatients } from '@/hooks/usePatients';
import { 
  usePatientOdontograms, 
  useOdontogram, 
  useToothTreatments,
  useUpdateTooth,
  useAddSurface,
  useAddToothTreatment,
  useCreateOdontogram
} from '@/hooks/useOdontogram';

export default function OdontogramPage() {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const locale = i18n.language === 'es' ? es : enUS;
  
  // Fetch patients from API
  const { data: patients = [], isLoading: loadingPatients } = usePatients();
  
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
  
  // Fetch patient odontograms
  const { data: patientOdontograms = [], isLoading: loadingOdontograms } = usePatientOdontograms(selectedPatientId || '');
  
  // Fetch selected odontogram details
  const { data: currentOdontogram, isLoading: loadingCurrentOdontogram } = useOdontogram(selectedOdontogramId || '');
  
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
  
  // Mutations
  const updateToothMutation = useUpdateTooth();
  const addSurfaceMutation = useAddSurface();
  const addTreatmentMutation = useAddToothTreatment();
  const createOdontogramMutation = useCreateOdontogram();
  
  const selectedPatient = patients.find(p => p.id === selectedPatientId);
  
  // Auto-select most recent odontogram when patient changes
  useEffect(() => {
    if (patientOdontograms.length > 0 && !selectedOdontogramId) {
      const mostRecent = [...patientOdontograms].sort(
        (a, b) => new Date(b.examinationDate).getTime() - new Date(a.examinationDate).getTime()
      )[0];
      setSelectedOdontogramId(mostRecent.id);
    }
  }, [patientOdontograms, selectedOdontogramId]);
  
  // Load teeth records when odontogram is loaded
  useEffect(() => {
    if (currentOdontogram?.teethRecords) {
      setTeethRecords(currentOdontogram.teethRecords);
    }
  }, [currentOdontogram]);
  
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
      // Update existing record via API
      updateToothMutation.mutate({
        toothRecordId: toothRecord.id,
        data: {
          condition,
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
    
    toast({
      title: t('success.updated'),
      description: `${t('odontogram.tooth')} #${toothNumber}`,
    });
  };
  
  const handleSurfaceConditionChange = (toothNumber: number, surface: ToothSurface, condition: ToothCondition) => {
    const toothRecord = teethRecords.find(t => t.toothNumber === toothNumber);
    
    if (toothRecord?.id && !toothRecord.id.startsWith('tooth-')) {
      // Update via API
      addSurfaceMutation.mutate({
        toothRecordId: toothRecord.id,
        data: {
          surface,
          condition,
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
          performedDate: data.performedDate,
          price: data.price,
          notes: data.notes,
          surfacesAffected: data.surfacesAffected,
          isCompleted: data.isCompleted,
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
  
  const handleNewOdontogram = () => {
    if (!selectedPatientId) return;
    
    // For now, we'd need a doctor selection - using first available doctor would be a placeholder
    toast({
      title: t('odontogram.newChart'),
      description: 'Para crear un nuevo odontograma, seleccione el doctor que realiza el examen',
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
          
          {/* Odontogram History Selector */}
          {selectedPatientId && (
            <Select
              value={selectedOdontogramId || ''}
              onValueChange={setSelectedOdontogramId}
              disabled={loadingOdontograms}
            >
              <SelectTrigger className="w-[180px]">
                <History className="w-4 h-4 mr-2" />
                <SelectValue placeholder={loadingOdontograms ? 'Cargando...' : t('odontogram.selectOdontogram')} />
              </SelectTrigger>
              <SelectContent>
                {patientOdontograms.length === 0 ? (
                  <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                    Sin odontogramas
                  </div>
                ) : (
                  patientOdontograms.map((odontogram) => (
                    <SelectItem key={odontogram.id} value={odontogram.id}>
                      {format(new Date(odontogram.examinationDate), 'dd/MM/yyyy', { locale })}
                    </SelectItem>
                  ))
                )}
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
          
          <Button onClick={handleNewOdontogram} disabled={!selectedPatientId}>
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
                {loadingCurrentOdontogram ? (
                  <Skeleton className="h-6 w-48" />
                ) : currentOdontogram ? (
                  format(new Date(currentOdontogram.examinationDate), 'dd MMMM yyyy', { locale })
                ) : (
                  t('odontogram.newChart')
                )}
              </CardTitle>
              {currentOdontogram?.notes && (
                <CardDescription>{currentOdontogram.notes}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {loadingCurrentOdontogram ? (
                <div className="flex items-center justify-center py-16">
                  <Skeleton className="h-64 w-full" />
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
      
      {/* Add Treatment Dialog */}
      <AddToothTreatmentDialog
        open={treatmentDialogOpen}
        onOpenChange={setTreatmentDialogOpen}
        toothNumber={treatmentToothNumber || 0}
        onSubmit={handleTreatmentSubmit}
        isLoading={addTreatmentMutation.isPending}
      />
    </div>
  );
}
