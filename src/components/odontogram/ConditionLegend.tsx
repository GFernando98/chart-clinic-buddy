import React from 'react';
import { useTranslation } from 'react-i18next';
import { ToothCondition } from '@/types';
import { CONDITION_LABELS, getConditionColor } from './toothUtils';
import { cn } from '@/lib/utils';

interface ConditionLegendProps {
  className?: string;
}

export function ConditionLegend({ className }: ConditionLegendProps) {
  const { i18n } = useTranslation();
  const lang = i18n.language as 'es' | 'en';
  
  const conditions = [
    ToothCondition.Healthy,
    ToothCondition.Decayed,
    ToothCondition.Filled,
    ToothCondition.Missing,
    ToothCondition.Extracted,
    ToothCondition.Crown,
    ToothCondition.Bridge,
    ToothCondition.Implant,
    ToothCondition.RootCanal,
    ToothCondition.Fracture,
    ToothCondition.Sealant,
    ToothCondition.Prosthesis,
  ];

  return (
    <div className={cn('flex flex-wrap gap-3 justify-center', className)}>
      {conditions.map((condition) => (
        <div key={condition} className="flex items-center gap-1.5">
          <div 
            className={cn(
              'w-4 h-4 rounded border border-border',
              condition === ToothCondition.Extracted && 'relative'
            )}
            style={{ backgroundColor: getConditionColor(condition) }}
          >
            {condition === ToothCondition.Extracted && (
              <>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-0.5 bg-current rotate-45 absolute" />
                  <div className="w-full h-0.5 bg-current -rotate-45 absolute" />
                </div>
              </>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {CONDITION_LABELS[condition][lang]}
          </span>
        </div>
      ))}
    </div>
  );
}
