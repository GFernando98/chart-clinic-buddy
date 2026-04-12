import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { getToothType } from '@/components/odontogram/toothUtils';
import {
  PeriodontalMeasurement,
  ToothPerioData,
  PointData,
  PerioSurface,
  PerioPoint,
  FurcationGrade,
  MobilityGrade,
} from '@/types/periodontogram';

interface ToothMeasurementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  toothNumber: number;
  existingMeasurements: PeriodontalMeasurement[];
  onSave: (data: ToothPerioData) => void;
  isSaving?: boolean;
}

const DEFAULT_POINT: PointData = {
  probingDepth: 0,
  recession: 0,
  bleeding: false,
  plaque: false,
};

function getExistingPoint(
  measurements: PeriodontalMeasurement[],
  surface: PerioSurface,
  point: PerioPoint
): PointData {
  const m = measurements.find(
    (x) => x.surface === surface && x.point === point
  );
  if (!m) return { ...DEFAULT_POINT };
  return {
    probingDepth: m.probingDepth,
    recession: m.recession,
    bleeding: m.bleeding,
    plaque: m.plaque,
  };
}

export function ToothMeasurementDialog({
  open,
  onOpenChange,
  toothNumber,
  existingMeasurements,
  onSave,
  isSaving,
}: ToothMeasurementDialogProps) {
  const toothType = getToothType(toothNumber);
  const hasFurcation = toothType === 'molar' || toothType === 'premolar';

  const existingMobility: MobilityGrade = existingMeasurements.length > 0
    ? (existingMeasurements[0].mobility ?? 'None')
    : 'None';
  const existingFurcation: FurcationGrade = existingMeasurements.length > 0
    ? (existingMeasurements[0].furcation ?? 'None')
    : 'None';

  const [mobility, setMobility] = useState<MobilityGrade>(existingMobility);
  const [furcation, setFurcation] = useState<FurcationGrade>(
    hasFurcation ? existingFurcation : 'None'
  );

  const [vestibular, setVestibular] = useState({
    mesial: getExistingPoint(existingMeasurements, 'Vestibular', 'Mesial'),
    central: getExistingPoint(existingMeasurements, 'Vestibular', 'Central'),
    distal: getExistingPoint(existingMeasurements, 'Vestibular', 'Distal'),
  });

  const [lingualPalatine, setLingualPalatine] = useState({
    mesial: getExistingPoint(existingMeasurements, 'LingualPalatine', 'Mesial'),
    central: getExistingPoint(existingMeasurements, 'LingualPalatine', 'Central'),
    distal: getExistingPoint(existingMeasurements, 'LingualPalatine', 'Distal'),
  });

  // Reset when tooth changes
  useEffect(() => {
    setMobility(existingMobility);
    setFurcation(hasFurcation ? existingFurcation : 'None');
    setVestibular({
      mesial: getExistingPoint(existingMeasurements, 'Vestibular', 'Mesial'),
      central: getExistingPoint(existingMeasurements, 'Vestibular', 'Central'),
      distal: getExistingPoint(existingMeasurements, 'Vestibular', 'Distal'),
    });
    setLingualPalatine({
      mesial: getExistingPoint(existingMeasurements, 'LingualPalatine', 'Mesial'),
      central: getExistingPoint(existingMeasurements, 'LingualPalatine', 'Central'),
      distal: getExistingPoint(existingMeasurements, 'LingualPalatine', 'Distal'),
    });
  }, [toothNumber, existingMeasurements]);

  const handleSave = () => {
    onSave({
      toothNumber,
      mobility,
      furcation,
      vestibular,
      lingualPalatine,
    });
  };

  const updatePoint = (
    setter: React.Dispatch<React.SetStateAction<Record<string, PointData>>>,
    point: string,
    field: keyof PointData,
    value: number | boolean
  ) => {
    setter((prev: any) => ({
      ...prev,
      [point]: { ...prev[point], [field]: value },
    }));
  };

  const renderSurfaceInputs = (
    label: string,
    data: Record<string, PointData>,
    setter: React.Dispatch<React.SetStateAction<any>>
  ) => (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-foreground">{label}</h4>
      <div className="grid grid-cols-3 gap-3">
        {(['mesial', 'central', 'distal'] as const).map((point) => (
          <div key={point} className="space-y-2 p-2 rounded-md bg-muted/50 border">
            <span className="text-xs font-medium capitalize text-muted-foreground">{point}</span>

            <div className="space-y-1">
              <Label className="text-[10px]">Sondaje (mm)</Label>
              <Input
                type="number"
                min={0}
                max={15}
                value={data[point].probingDepth}
                onChange={(e) =>
                  updatePoint(setter, point, 'probingDepth', Math.max(0, Math.min(15, Number(e.target.value))))
                }
                className="h-7 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[10px]">Recesión (mm)</Label>
              <Input
                type="number"
                min={0}
                max={15}
                value={data[point].recession}
                onChange={(e) =>
                  updatePoint(setter, point, 'recession', Math.max(0, Math.min(15, Number(e.target.value))))
                }
                className="h-7 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[10px]">
                NIC: {data[point].probingDepth + data[point].recession} mm
              </Label>
            </div>

            <div className="flex items-center gap-1.5">
              <Checkbox
                id={`bleeding-${label}-${point}`}
                checked={data[point].bleeding}
                onCheckedChange={(checked) =>
                  updatePoint(setter, point, 'bleeding', !!checked)
                }
              />
              <Label htmlFor={`bleeding-${label}-${point}`} className="text-[10px]">Sangrado</Label>
            </div>

            <div className="flex items-center gap-1.5">
              <Checkbox
                id={`plaque-${label}-${point}`}
                checked={data[point].plaque}
                onCheckedChange={(checked) =>
                  updatePoint(setter, point, 'plaque', !!checked)
                }
              />
              <Label htmlFor={`plaque-${label}-${point}`} className="text-[10px]">Placa</Label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto pr-8">
        <DialogHeader>
          <DialogTitle>Diente #{toothNumber} — Mediciones Periodontales</DialogTitle>
          <DialogDescription>
            Ingrese las mediciones de los 6 puntos de sondaje
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Global tooth values */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Movilidad</Label>
              <Select
                value={mobility}
                onValueChange={(v) => setMobility(v as MobilityGrade)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="None">0 — Sin movilidad</SelectItem>
                  <SelectItem value="GradeI">I — Ligera</SelectItem>
                  <SelectItem value="GradeII">II — Moderada</SelectItem>
                  <SelectItem value="GradeIII">III — Severa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {hasFurcation && (
              <div className="space-y-1">
                <Label className="text-xs">Furcación</Label>
                <Select
                  value={furcation}
                  onValueChange={(v) => setFurcation(v as FurcationGrade)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="None">0 — Sin afectación</SelectItem>
                    <SelectItem value="GradeI">I — Inicial</SelectItem>
                    <SelectItem value="GradeII">II — Parcial</SelectItem>
                    <SelectItem value="GradeIII">III — Total</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <Separator />

          {renderSurfaceInputs('Vestibular', vestibular, setVestibular)}

          <Separator />

          {renderSurfaceInputs('Palatino / Lingual', lingualPalatine, setLingualPalatine)}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
