import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, User, FileText, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { usePatients } from '@/hooks/usePatients';
import { useDoctors } from '@/hooks/useDoctors';
import { usePatientOdontograms } from '@/hooks/useOdontogram';
import {
  usePatientPeriodontograms,
  useCreatePeriodontogram,
  useSaveToothMeasurements,
  useFinalizePeriodontogram,
} from '@/hooks/usePeriodontogram';
import { PeriodontalChart } from '@/components/periodontogram/PeriodontalChart';
import { MeasurementTable } from '@/components/periodontogram/MeasurementTable';
import { ToothMeasurementDialog } from '@/components/periodontogram/ToothMeasurementDialog';
import { PerioSummary } from '@/components/periodontogram/PerioSummary';
import { ToothCondition } from '@/types';
import {
  PeriodontalMeasurement,
  ToothPerioData,
  SaveToothMeasurementsPayload,
  MeasurementPointPayload,
} from '@/types/periodontogram';

export default function PeriodontogramPage() {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const { data: patients = [], isLoading: loadingPatients } = usePatients();
  const { data: doctors = [], isLoading: loadingDoctors } = useDoctors();

  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    searchParams.get('patientId') || null
  );
  const [selectedPerioId, setSelectedPerioId] = useState<string | null>(null);
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmNewOpen, setConfirmNewOpen] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [localMeasurements, setLocalMeasurements] = useState<PeriodontalMeasurement[]>([]);

  // Queries
  const { data: periodontograms = [], isLoading: loadingPerios } =
    usePatientPeriodontograms(selectedPatientId || '');
  const { data: odontograms = [] } = usePatientOdontograms(selectedPatientId || '');

  // Mutations
  const createMutation = useCreatePeriodontogram();
  const saveMeasurementsMutation = useSaveToothMeasurements();
  const finalizeMutation = useFinalizePeriodontogram();

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);

  const sortedPerios = useMemo(() => {
    return [...periodontograms].sort((a, b) => {
      const dA = a.examinationDate ? new Date(a.examinationDate).getTime() : 0;
      const dB = b.examinationDate ? new Date(b.examinationDate).getTime() : 0;
      return dB - dA;
    });
  }, [periodontograms]);

  const selectedPerio =
    sortedPerios.find((p) => p.id === selectedPerioId) || sortedPerios[0] || null;

  // Missing teeth from odontogram
  const missingTeeth = useMemo(() => {
    if (odontograms.length === 0) return [];
    const latest = odontograms[0];
    if (!latest.teethRecords) return [];
    return latest.teethRecords
      .filter(
        (t) =>
          !t.isPresent ||
          t.condition === ToothCondition.Extracted ||
          t.condition === ToothCondition.Missing
      )
      .map((t) => t.toothNumber);
  }, [odontograms]);

  // Sync measurements from selected perio
  useEffect(() => {
    if (selectedPerio?.measurements) {
      setLocalMeasurements(selectedPerio.measurements);
    } else {
      setLocalMeasurements([]);
    }
  }, [selectedPerio]);

  // Auto-select latest
  useEffect(() => {
    if (sortedPerios.length > 0 && !selectedPerioId) {
      setSelectedPerioId(sortedPerios[0].id);
    }
  }, [sortedPerios, selectedPerioId]);

  const handleToothClick = (toothNumber: number) => {
    if (!selectedPerio) {
      toast({ title: 'Debe crear un examen primero', variant: 'destructive' });
      return;
    }
    setSelectedTooth(toothNumber);
    setDialogOpen(true);
  };

  const handleSaveTooth = (data: ToothPerioData) => {
    if (!selectedPerio) return;

    // Build the payload matching the API contract
    const vestibularPoints: MeasurementPointPayload[] = (['mesial', 'central', 'distal'] as const).map((p) => ({
      point: (p.charAt(0).toUpperCase() + p.slice(1)) as 'Mesial' | 'Central' | 'Distal',
      probingDepth: data.vestibular[p].probingDepth,
      recession: data.vestibular[p].recession,
      bleeding: data.vestibular[p].bleeding,
      plaque: data.vestibular[p].plaque,
    }));

    const lingualPalatinePoints: MeasurementPointPayload[] = (['mesial', 'central', 'distal'] as const).map((p) => ({
      point: (p.charAt(0).toUpperCase() + p.slice(1)) as 'Mesial' | 'Central' | 'Distal',
      probingDepth: data.lingualPalatine[p].probingDepth,
      recession: data.lingualPalatine[p].recession,
      bleeding: data.lingualPalatine[p].bleeding,
      plaque: data.lingualPalatine[p].plaque,
    }));

    const payload: SaveToothMeasurementsPayload = {
      periodontalRecordId: selectedPerio.id,
      toothNumber: data.toothNumber,
      vestibular: vestibularPoints,
      lingualPalatine: lingualPalatinePoints,
      furcation: data.furcation,
      mobility: data.mobility,
    };

    // Update local state immediately for instant feedback
    setLocalMeasurements((prev) => {
      const filtered = prev.filter((m) => m.toothNumber !== data.toothNumber);
      const newMeasurements: PeriodontalMeasurement[] = [];

      vestibularPoints.forEach((vp, i) => {
        newMeasurements.push({
          id: `local-v-${data.toothNumber}-${i}`,
          toothNumber: data.toothNumber,
          surface: 'Vestibular',
          point: vp.point,
          probingDepth: vp.probingDepth,
          recession: vp.recession,
          clinicalAttachmentLevel: vp.probingDepth + vp.recession,
          bleeding: vp.bleeding,
          plaque: vp.plaque,
          furcation: data.furcation,
          mobility: data.mobility,
        });
      });

      lingualPalatinePoints.forEach((lp, i) => {
        newMeasurements.push({
          id: `local-l-${data.toothNumber}-${i}`,
          toothNumber: data.toothNumber,
          surface: 'LingualPalatine',
          point: lp.point,
          probingDepth: lp.probingDepth,
          recession: lp.recession,
          clinicalAttachmentLevel: lp.probingDepth + lp.recession,
          bleeding: lp.bleeding,
          plaque: lp.plaque,
          furcation: data.furcation,
          mobility: data.mobility,
        });
      });

      return [...filtered, ...newMeasurements];
    });

    saveMeasurementsMutation.mutate(payload);
    setDialogOpen(false);
  };

  const handleNewExam = () => {
    if (!selectedPatientId) return;
    setConfirmNewOpen(true);
  };

  const handleConfirmNew = () => {
    if (!selectedPatientId || !selectedDoctorId) return;
    createMutation.mutate(
      {
        patientId: selectedPatientId,
        doctorId: selectedDoctorId,
        examinationDate: new Date().toISOString(),
      },
      {
        onSuccess: (newPerio) => {
          setSelectedPerioId(newPerio.id);
          setConfirmNewOpen(false);
          setSelectedDoctorId('');
        },
      }
    );
  };

  const handleFinalize = () => {
    if (!selectedPerio) return;
    const totalPoints = localMeasurements.length;
    const bleedingCount = localMeasurements.filter((m) => m.bleeding).length;
    const plaqueCount = localMeasurements.filter((m) => m.plaque).length;
    const bleedingIndex = totalPoints > 0 ? parseFloat(((bleedingCount / totalPoints) * 100).toFixed(2)) : 0;
    const plaqueIndex = totalPoints > 0 ? parseFloat(((plaqueCount / totalPoints) * 100).toFixed(2)) : 0;

    finalizeMutation.mutate({
      id: selectedPerio.id,
      data: { bleedingIndex, plaqueIndex },
    });
  };

  const toothMeasurements = useMemo(() => {
    if (!selectedTooth) return [];
    return localMeasurements.filter((m) => m.toothNumber === selectedTooth);
  }, [selectedTooth, localMeasurements]);

  const isDraft = selectedPerio?.status === 'Draft';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Periodontograma</h1>
          <p className="text-muted-foreground">
            {selectedPatient
              ? `${selectedPatient.fullName} - ${selectedPatient.age} años`
              : 'Seleccione un paciente'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={selectedPatientId || ''}
            onValueChange={(value) => {
              setSelectedPatientId(value);
              setSelectedPerioId(null);
              setLocalMeasurements([]);
            }}
            disabled={loadingPatients}
          >
            <SelectTrigger className="w-[200px]">
              <User className="w-4 h-4 mr-2" />
              <SelectValue placeholder={loadingPatients ? 'Cargando...' : 'Seleccionar Paciente'} />
            </SelectTrigger>
            <SelectContent>
              {patients.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.fullName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedPatientId && sortedPerios.length > 0 && (
            <Select
              value={selectedPerioId || ''}
              onValueChange={(v) => setSelectedPerioId(v)}
              disabled={loadingPerios}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Seleccionar fecha" />
              </SelectTrigger>
              <SelectContent>
                {sortedPerios.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.examinationDate
                      ? (() => {
                          try {
                            const d = new Date(p.examinationDate);
                            return isNaN(d.getTime())
                              ? `Registro ${p.id.slice(0, 8)}`
                              : format(d, 'dd/MM/yyyy', { locale: es });
                          } catch {
                            return `Registro ${p.id.slice(0, 8)}`;
                          }
                        })()
                      : `Registro ${p.id.slice(0, 8)}`}
                    {p.status === 'Draft' ? ' (Borrador)' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {selectedPerio && isDraft && (
            <Button variant="outline" onClick={handleFinalize} disabled={finalizeMutation.isPending}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Finalizar
            </Button>
          )}

          <Button
            onClick={handleNewExam}
            disabled={!selectedPatientId || createMutation.isPending}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Examen
          </Button>
        </div>
      </div>

      {selectedPatientId ? (
        <>
          {/* Summary */}
          <PerioSummary measurements={localMeasurements} />

          {/* Status badge */}
          {selectedPerio && (
            <div className="flex items-center gap-2">
              <Badge variant={isDraft ? 'secondary' : 'default'}>
                {isDraft ? 'Borrador' : 'Finalizado'}
              </Badge>
              {selectedPerio.doctorName && (
                <span className="text-sm text-muted-foreground">
                  Dr. {selectedPerio.doctorName}
                </span>
              )}
            </div>
          )}

          {/* Dental Chart */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                {loadingPerios ? (
                  <Skeleton className="h-6 w-48" />
                ) : selectedPerio?.examinationDate ? (
                  (() => {
                    try {
                      const d = new Date(selectedPerio.examinationDate);
                      return isNaN(d.getTime())
                        ? 'Periodontograma'
                        : format(d, 'dd MMMM yyyy', { locale: es });
                    } catch {
                      return 'Periodontograma';
                    }
                  })()
                ) : (
                  'Nuevo Examen'
                )}
              </CardTitle>
              <CardDescription>
                Haga clic en un diente para registrar mediciones periodontales
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingPerios ? (
                <Skeleton className="h-32 w-full" />
              ) : !selectedPerio ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="w-16 h-16 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">
                    No hay registros. Cree un nuevo examen periodontal.
                  </p>
                </div>
              ) : (
                <PeriodontalChart
                  measurements={localMeasurements}
                  missingTeeth={missingTeeth}
                  selectedTooth={selectedTooth}
                  onToothClick={handleToothClick}
                />
              )}
            </CardContent>
          </Card>

          {/* Measurement Tables */}
          {selectedPerio && localMeasurements.length > 0 && (
            <div className="space-y-4">
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Maxilar Superior</CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  <MeasurementTable
                    measurements={localMeasurements}
                    missingTeeth={missingTeeth}
                    jaw="upper"
                  />
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Mandíbula Inferior</CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  <MeasurementTable
                    measurements={localMeasurements}
                    missingTeeth={missingTeeth}
                    jaw="lower"
                  />
                </CardContent>
              </Card>
            </div>
          )}
        </>
      ) : (
        <Card className="border-0 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Periodontograma</h3>
            <p className="text-muted-foreground">
              Seleccione un paciente para ver o crear registros periodontales
            </p>
          </CardContent>
        </Card>
      )}

      {/* Measurement Dialog */}
      {selectedTooth && (
        <ToothMeasurementDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          toothNumber={selectedTooth}
          existingMeasurements={toothMeasurements}
          onSave={handleSaveTooth}
          isSaving={saveMeasurementsMutation.isPending}
        />
      )}

      {/* New Exam Confirmation */}
      <AlertDialog open={confirmNewOpen} onOpenChange={setConfirmNewOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Nuevo Examen Periodontal</AlertDialogTitle>
            <AlertDialogDescription>
              Seleccione el doctor que realizará el examen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar Doctor" />
            </SelectTrigger>
            <SelectContent>
              {doctors.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.fullName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmNew}
              disabled={!selectedDoctorId || createMutation.isPending}
            >
              Crear Examen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
