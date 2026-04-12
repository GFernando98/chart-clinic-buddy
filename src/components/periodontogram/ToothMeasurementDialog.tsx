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
  gingivalRecession: 0,
  bleedingOnProbing: false,
  plaquePresent: false,
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
    gingivalRecession: m.gingivalRecession,
    bleedingOnProbing: m.bleedingOnProbing,
    plaquePresent: m.plaquePresent,
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

  const existingMobility = existingMeasurements.length > 0
    ? existingMeasurements[0].mobility
    : MobilityGrade.None;
  const existingFurcation = existingMeasurements.length > 0
    ? existingMeasurements[0].furcation
    : FurcationGrade.None;

  const [mobility, setMobility] = useState<MobilityGrade>(existingMobility);
  const [furcation, setFurcation] = useState<FurcationGrade | null>(
    hasFurcation ? (existingFurcation ?? FurcationGrade.None) : null
  );

  const [vestibular, setVestibular] = useState({
    mesial: getExistingPoint(existingMeasurements, PerioSurface.Vestibular, PerioPoint.Mesial),
    central: getExistingPoint(existingMeasurements, PerioSurface.Vestibular, PerioPoint.Central),
    distal: getExistingPoint(existingMeasurements, PerioSurface.Vestibular, PerioPoint.Distal),
  });

  const [palatinoLingual, setPalatinoLingual] = useState({
    mesial: getExistingPoint(existingMeasurements, PerioSurface.PalatinoLingual, PerioPoint.Mesial),
    central: getExistingPoint(existingMeasurements, PerioSurface.PalatinoLingual, PerioPoint.Central),
    distal: getExistingPoint(existingMeasurements, PerioSurface.PalatinoLingual, PerioPoint.Distal),
  });

  // Reset when tooth changes
  useEffect(() => {
    setMobility(existingMobility);
    setFurcation(hasFurcation ? (existingFurcation ?? FurcationGrade.None) : null);
    setVestibular({
      mesial: getExistingPoint(existingMeasurements, PerioSurface.Vestibular, PerioPoint.Mesial),
      central: getExistingPoint(existingMeasurements, PerioSurface.Vestibular, PerioPoint.Central),
      distal: getExistingPoint(existingMeasurements, PerioSurface.Vestibular, PerioPoint.Distal),
    });
    setPalatinoLingual({
      mesial: getExistingPoint(existingMeasurements, PerioSurface.PalatinoLingual, PerioPoint.Mesial),
      central: getExistingPoint(existingMeasurements, PerioSurface.PalatinoLingual, PerioPoint.Central),
      distal: getExistingPoint(existingMeasurements, PerioSurface.PalatinoLingual, PerioPoint.Distal),
    });
  }, [toothNumber, existingMeasurements]);

  const handleSave = () => {
    onSave({
      toothNumber,
      mobility,
      furcation,
      vestibular,
      palatino_lingual: palatinoLingual,
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
                value={data[point].gingivalRecession}
                onChange={(e) =>
                  updatePoint(setter, point, 'gingivalRecession', Math.max(0, Math.min(15, Number(e.target.value))))
                }
                className="h-7 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[10px]">
                NIC: {data[point].probingDepth + data[point].gingivalRecession} mm
              </Label>
            </div>

            <div className="flex items-center gap-1.5">
              <Checkbox
                id={`bleeding-${label}-${point}`}
                checked={data[point].bleedingOnProbing}
                onCheckedChange={(checked) =>
                  updatePoint(setter, point, 'bleedingOnProbing', !!checked)
                }
              />
              <Label htmlFor={`bleeding-${label}-${point}`} className="text-[10px]">Sangrado</Label>
            </div>

            <div className="flex items-center gap-1.5">
              <Checkbox
                id={`plaque-${label}-${point}`}
                checked={data[point].plaquePresent}
                onCheckedChange={(checked) =>
                  updatePoint(setter, point, 'plaquePresent', !!checked)
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                value={String(mobility)}
                onValueChange={(v) => setMobility(Number(v) as MobilityGrade)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0 — Sin movilidad</SelectItem>
                  <SelectItem value="1">I — Ligera</SelectItem>
                  <SelectItem value="2">II — Moderada</SelectItem>
                  <SelectItem value="3">III — Severa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {hasFurcation && (
              <div className="space-y-1">
                <Label className="text-xs">Furcación</Label>
                <Select
                  value={String(furcation ?? 0)}
                  onValueChange={(v) => setFurcation(Number(v) as FurcationGrade)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0 — Sin afectación</SelectItem>
                    <SelectItem value="1">I — Inicial</SelectItem>
                    <SelectItem value="2">II — Parcial</SelectItem>
                    <SelectItem value="3">III — Total</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <Separator />

          {renderSurfaceInputs('Vestibular', vestibular, setVestibular)}

          <Separator />

          {renderSurfaceInputs('Palatino / Lingual', palatinoLingual, setPalatinoLingual)}
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
