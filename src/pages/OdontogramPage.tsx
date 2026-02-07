import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { ToothRecord, ToothCondition, ToothSurface, Odontogram, ToothTreatmentRecord } from '@/types';
import { mockOdontograms, mockPatients, mockToothTreatments } from '@/mocks/data';
import { DentalChart } from '@/components/odontogram/DentalChart';
import { ToothDetailPanel } from '@/components/odontogram/ToothDetailPanel';
import { ConditionLegend } from '@/components/odontogram/ConditionLegend';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Printer, History, User } from 'lucide-react';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

export default function OdontogramPage() {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const locale = i18n.language === 'es' ? es : enUS;
  
  // State
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    searchParams.get('patientId') || null
  );
  const [selectedOdontogramId, setSelectedOdontogramId] = useState<string | null>(null);
  const [isPediatric, setIsPediatric] = useState(false);
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [teethRecords, setTeethRecords] = useState<ToothRecord[]>([]);
  const [currentOdontogram, setCurrentOdontogram] = useState<Odontogram | null>(null);
  
  // Get patient odontograms
  const patientOdontograms = selectedPatientId 
    ? mockOdontograms.filter(o => o.patientId === selectedPatientId)
    : [];
  
  const selectedPatient = mockPatients.find(p => p.id === selectedPatientId);
  
  // Load odontogram when selection changes
  useEffect(() => {
    if (selectedOdontogramId) {
      const odontogram = mockOdontograms.find(o => o.id === selectedOdontogramId);
      if (odontogram) {
        setCurrentOdontogram(odontogram);
        setTeethRecords(odontogram.teethRecords || []);
      }
    } else if (patientOdontograms.length > 0) {
      // Auto-select the most recent odontogram
      const mostRecent = patientOdontograms.sort(
        (a, b) => new Date(b.examinationDate).getTime() - new Date(a.examinationDate).getTime()
      )[0];
      setSelectedOdontogramId(mostRecent.id);
    }
  }, [selectedOdontogramId, selectedPatientId]);
  
  // Get treatments for selected tooth
  const selectedToothTreatments: ToothTreatmentRecord[] = selectedTooth
    ? mockToothTreatments.filter(t => t.toothNumber === selectedTooth)
    : [];
  
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
  
  const handleToothClick = (toothNumber: number) => {
    setSelectedTooth(toothNumber === selectedTooth ? null : toothNumber);
  };
  
  const handleSurfaceClick = (toothNumber: number, surface: ToothSurface) => {
    // Open tooth detail if not already selected
    if (selectedTooth !== toothNumber) {
      setSelectedTooth(toothNumber);
    }
  };
  
  const handleConditionChange = (toothNumber: number, condition: ToothCondition) => {
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
    toast({
      title: 'Agregar tratamiento',
      description: `Función disponible próximamente para diente #${toothNumber}`,
    });
  };
  
  const handleNewOdontogram = () => {
    toast({
      title: t('odontogram.newChart'),
      description: 'Función disponible próximamente',
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
            }}
          >
            <SelectTrigger className="w-[200px]">
              <User className="w-4 h-4 mr-2" />
              <SelectValue placeholder={t('appointments.selectPatient')} />
            </SelectTrigger>
            <SelectContent>
              {mockPatients.map((patient) => (
                <SelectItem key={patient.id} value={patient.id}>
                  {patient.fullName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Odontogram History Selector */}
          {selectedPatientId && patientOdontograms.length > 0 && (
            <Select
              value={selectedOdontogramId || ''}
              onValueChange={setSelectedOdontogramId}
            >
              <SelectTrigger className="w-[180px]">
                <History className="w-4 h-4 mr-2" />
                <SelectValue placeholder={t('odontogram.selectOdontogram')} />
              </SelectTrigger>
              <SelectContent>
                {patientOdontograms.map((odontogram) => (
                  <SelectItem key={odontogram.id} value={odontogram.id}>
                    {format(new Date(odontogram.examinationDate), 'dd/MM/yyyy', { locale })}
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
                {currentOdontogram 
                  ? format(new Date(currentOdontogram.examinationDate), 'dd MMMM yyyy', { locale })
                  : t('odontogram.newChart')
                }
              </CardTitle>
              {currentOdontogram?.notes && (
                <CardDescription>{currentOdontogram.notes}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
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
    </div>
  );
}
