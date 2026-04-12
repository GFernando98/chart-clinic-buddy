import React from 'react';
import { PERMANENT_TEETH } from '@/components/odontogram/toothUtils';
import { cn } from '@/lib/utils';
import {
  PeriodontalMeasurement,
  ToothPerioData,
  PerioSurface,
  PerioPoint,
} from '@/types/periodontogram';

interface PeriodontalChartProps {
  measurements: PeriodontalMeasurement[];
  missingTeeth: number[];
  selectedTooth: number | null;
  onToothClick: (toothNumber: number) => void;
}

export function PeriodontalChart({
  measurements,
  missingTeeth,
  selectedTooth,
  onToothClick,
}: PeriodontalChartProps) {
  const teeth = PERMANENT_TEETH;

  const hasMeasurements = (toothNumber: number) => {
    return measurements.some(m => m.toothNumber === toothNumber);
  };

  const isMissing = (toothNumber: number) => missingTeeth.includes(toothNumber);

  const getToothColor = (toothNumber: number) => {
    if (isMissing(toothNumber)) return 'bg-muted text-muted-foreground opacity-40';
    if (hasMeasurements(toothNumber)) return 'bg-primary/10 border-primary text-primary';
    return 'bg-background border-border hover:border-primary/50';
  };

  const renderToothRow = (toothNumbers: number[], label: string) => (
    <div className="space-y-1">
      <div className="text-center text-xs font-medium text-muted-foreground">{label}</div>
      <div className="flex justify-center gap-0.5">
        {toothNumbers.map((num) => {
          const missing = isMissing(num);
          return (
            <button
              key={num}
              onClick={() => !missing && onToothClick(num)}
              disabled={missing}
              className={cn(
                'w-10 h-12 flex flex-col items-center justify-center border rounded text-xs font-medium transition-all',
                getToothColor(num),
                selectedTooth === num && !missing && 'ring-2 ring-primary ring-offset-1',
                missing && 'cursor-not-allowed line-through'
              )}
            >
              <span className="font-bold text-[11px]">{num}</span>
              {hasMeasurements(num) && !missing && (
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[700px] space-y-3 p-3">
        {renderToothRow(teeth.upper, 'Maxilar Superior')}
        <div className="flex items-center justify-center">
          <div className="flex-1 h-px bg-border" />
          <div className="px-3 text-xs text-muted-foreground">32 dientes</div>
          <div className="flex-1 h-px bg-border" />
        </div>
        {renderToothRow(teeth.lower, 'Mandíbula Inferior')}
      </div>
    </div>
  );
}
