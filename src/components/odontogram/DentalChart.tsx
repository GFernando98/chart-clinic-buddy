import React from 'react';
import { useTranslation } from 'react-i18next';
import { ToothRecord, ToothSurface } from '@/types';
import { ToothSVG } from './ToothSVG';
import { PERMANENT_TEETH, DECIDUOUS_TEETH } from './toothUtils';
import { cn } from '@/lib/utils';

interface DentalChartProps {
  teethRecords: ToothRecord[];
  selectedTooth: number | null;
  isPediatric: boolean;
  onToothClick: (toothNumber: number) => void;
  onSurfaceClick?: (toothNumber: number, surface: ToothSurface) => void;
}

export function DentalChart({
  teethRecords,
  selectedTooth,
  isPediatric,
  onToothClick,
  onSurfaceClick,
}: DentalChartProps) {
  const { t } = useTranslation();
  
  const teeth = isPediatric ? DECIDUOUS_TEETH : PERMANENT_TEETH;
  const toothSize = isPediatric ? 48 : 42;
  
  const getToothRecord = (toothNumber: number): ToothRecord => {
    const record = teethRecords.find(t => t.toothNumber === toothNumber);
    if (record) return record;
    return {
      id: `tooth-${toothNumber}`,
      toothNumber,
      toothType: isPediatric ? 2 : 1,
      condition: 1,
      isPresent: true,
      surfaces: [],
    };
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[800px] p-4">
        {/* Upper Jaw Label */}
        <div className="text-center mb-2">
          <span className="text-sm font-medium text-muted-foreground">
            {t('odontogram.upperJaw')}
          </span>
        </div>
        
        {/* Upper Jaw */}
        <div className="flex justify-center gap-0.5">
          {teeth.upper.map((toothNumber) => {
            const record = getToothRecord(toothNumber);
            return (
              <div key={toothNumber} className="flex flex-col items-center">
                <span className="text-[10px] font-semibold text-muted-foreground mb-0.5">
                  {toothNumber}
                </span>
                <div className={cn(
                  selectedTooth === toothNumber && 'rounded ring-2 ring-primary ring-offset-1'
                )}>
                  <ToothSVG
                    toothRecord={record}
                    isSelected={false}
                    onToothClick={onToothClick}
                    onSurfaceClick={onSurfaceClick}
                    size={toothSize}
                  />
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Divider */}
        <div className="flex items-center justify-center my-3">
          <div className="flex-1 h-px bg-border" />
          <div className="px-4 text-xs text-muted-foreground">
            {isPediatric ? '20' : '32'} {t('odontogram.tooth')}s
          </div>
          <div className="flex-1 h-px bg-border" />
        </div>
        
        {/* Lower Jaw */}
        <div className="flex justify-center gap-0.5">
          {teeth.lower.map((toothNumber) => {
            const record = getToothRecord(toothNumber);
            return (
              <div key={toothNumber} className="flex flex-col items-center">
                <div className={cn(
                  selectedTooth === toothNumber && 'rounded ring-2 ring-primary ring-offset-1'
                )}>
                  <ToothSVG
                    toothRecord={record}
                    isSelected={false}
                    onToothClick={onToothClick}
                    onSurfaceClick={onSurfaceClick}
                    size={toothSize}
                  />
                </div>
                <span className="text-[10px] font-semibold text-muted-foreground mt-0.5">
                  {toothNumber}
                </span>
              </div>
            );
          })}
        </div>
        
        {/* Lower Jaw Label */}
        <div className="text-center mt-2">
          <span className="text-sm font-medium text-muted-foreground">
            {t('odontogram.lowerJaw')}
          </span>
        </div>
      </div>
    </div>
  );
}
