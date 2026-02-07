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
  
  const getToothRecord = (toothNumber: number): ToothRecord => {
    const record = teethRecords.find(t => t.toothNumber === toothNumber);
    if (record) return record;
    
    // Return default healthy tooth if not found
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
        <div className="flex justify-center gap-1 mb-2">
          {teeth.upper.map((toothNumber) => (
            <ToothSVG
              key={toothNumber}
              toothRecord={getToothRecord(toothNumber)}
              isSelected={selectedTooth === toothNumber}
              onToothClick={onToothClick}
              onSurfaceClick={onSurfaceClick}
              size={isPediatric ? 55 : 48}
            />
          ))}
        </div>
        
        {/* Divider */}
        <div className="flex items-center justify-center my-4">
          <div className="flex-1 h-px bg-border" />
          <div className="px-4 text-xs text-muted-foreground">
            {isPediatric ? '20' : '32'} {t('odontogram.tooth')}s
          </div>
          <div className="flex-1 h-px bg-border" />
        </div>
        
        {/* Lower Jaw */}
        <div className="flex justify-center gap-1 mt-2">
          {teeth.lower.map((toothNumber) => (
            <ToothSVG
              key={toothNumber}
              toothRecord={getToothRecord(toothNumber)}
              isSelected={selectedTooth === toothNumber}
              onToothClick={onToothClick}
              onSurfaceClick={onSurfaceClick}
              size={isPediatric ? 55 : 48}
            />
          ))}
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
