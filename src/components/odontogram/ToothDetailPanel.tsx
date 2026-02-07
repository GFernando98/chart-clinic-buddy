import React from 'react';
import { useTranslation } from 'react-i18next';
import { ToothRecord, ToothCondition, ToothSurface, ToothTreatmentRecord } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Plus, History } from 'lucide-react';
import { getToothType, getSurfacesForTooth, CONDITION_LABELS, SURFACE_LABELS, getConditionColor } from './toothUtils';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';

interface ToothDetailPanelProps {
  toothRecord: ToothRecord;
  treatments: ToothTreatmentRecord[];
  onClose: () => void;
  onConditionChange: (toothNumber: number, condition: ToothCondition) => void;
  onSurfaceConditionChange: (toothNumber: number, surface: ToothSurface, condition: ToothCondition) => void;
  onAddTreatment: (toothNumber: number) => void;
}

export function ToothDetailPanel({
  toothRecord,
  treatments,
  onClose,
  onConditionChange,
  onSurfaceConditionChange,
  onAddTreatment,
}: ToothDetailPanelProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'es' ? es : enUS;
  const lang = i18n.language as 'es' | 'en';
  
  const { toothNumber, condition, surfaces, notes } = toothRecord;
  const toothType = getToothType(toothNumber);
  const availableSurfaces = getSurfacesForTooth(toothNumber);
  
  const conditions = Object.values(ToothCondition).filter(v => typeof v === 'number') as ToothCondition[];
  
  const getSurfaceCondition = (surface: ToothSurface): ToothCondition => {
    const surfaceRecord = surfaces.find(s => s.surface === surface);
    return surfaceRecord?.condition || ToothCondition.Healthy;
  };

  return (
    <Card className="w-full lg:w-80 h-fit border-0 shadow-lg animate-slide-in-right">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {t('odontogram.tooth')} #{toothNumber}
            <Badge variant="secondary" className="text-xs capitalize">
              {toothType}
            </Badge>
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* General Condition */}
        <div className="space-y-2">
          <label className="text-sm font-medium">{t('odontogram.condition')}</label>
          <Select
            value={String(condition)}
            onValueChange={(value) => onConditionChange(toothNumber, Number(value) as ToothCondition)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {conditions.map((cond) => (
                <SelectItem key={cond} value={String(cond)}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full border border-border" 
                      style={{ backgroundColor: getConditionColor(cond) }}
                    />
                    {CONDITION_LABELS[cond][lang]}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Separator />
        
        {/* Surface Conditions */}
        <div className="space-y-2">
          <label className="text-sm font-medium">{t('odontogram.surfaceConditions')}</label>
          <div className="space-y-2">
            {availableSurfaces.map((surface) => {
              const surfaceCondition = getSurfaceCondition(surface);
              return (
                <div key={surface} className="flex items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground w-24">
                    {SURFACE_LABELS[surface][lang]}
                  </span>
                  <Select
                    value={String(surfaceCondition)}
                    onValueChange={(value) => onSurfaceConditionChange(toothNumber, surface, Number(value) as ToothCondition)}
                  >
                    <SelectTrigger className="flex-1 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {conditions.map((cond) => (
                        <SelectItem key={cond} value={String(cond)}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-2 h-2 rounded-full" 
                              style={{ backgroundColor: getConditionColor(cond) }}
                            />
                            <span className="text-xs">{CONDITION_LABELS[cond][lang]}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              );
            })}
          </div>
        </div>
        
        <Separator />
        
        {/* Notes */}
        {notes && (
          <>
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('common.notes')}</label>
              <p className="text-sm text-muted-foreground">{notes}</p>
            </div>
            <Separator />
          </>
        )}
        
        {/* Add Treatment Button */}
        <Button 
          className="w-full" 
          onClick={() => onAddTreatment(toothNumber)}
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('odontogram.addTreatment')}
        </Button>
        
        {/* Treatment History */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-muted-foreground" />
            <label className="text-sm font-medium">{t('odontogram.treatmentHistory')}</label>
          </div>
          
          {treatments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {t('common.noData')}
            </p>
          ) : (
            <ScrollArea className="h-40">
              <div className="space-y-2">
                {treatments.map((treatment) => (
                  <div 
                    key={treatment.id} 
                    className="p-2 bg-muted rounded-lg text-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{treatment.treatmentName}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(treatment.performedDate), 'dd/MM/yyyy', { locale })}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {treatment.doctorName}
                      {treatment.surfacesAffected && ` • ${treatment.surfacesAffected}`}
                    </div>
                    <div className="text-xs font-medium text-primary mt-1">
                      L {treatment.price.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
