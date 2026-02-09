import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ToothTreatmentRecord } from '@/types';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';

interface GlobalTreatmentsSectionProps {
  treatments: ToothTreatmentRecord[];
  onAddTreatment: () => void;
  isLoading?: boolean;
}

export function GlobalTreatmentsSection({
  treatments,
  onAddTreatment,
  isLoading = false,
}: GlobalTreatmentsSectionProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'es' ? es : enUS;

  // Filter only global treatments
  const globalTreatments = treatments.filter(t => t.isGlobalTreatment);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            {t('treatments.globalTreatments')}
            {globalTreatments.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {globalTreatments.length}
              </Badge>
            )}
          </CardTitle>
          <Button 
            size="sm" 
            variant="outline"
            onClick={onAddTreatment}
            disabled={isLoading}
          >
            <Plus className="h-4 w-4 mr-1" />
            {t('common.create')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {globalTreatments.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay tratamientos globales registrados</p>
            <p className="text-xs mt-1">
              Agregue limpiezas, rayos X u otros tratamientos de toda la boca
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[200px]">
            <div className="space-y-2">
              {globalTreatments.map((treatment) => (
                <div 
                  key={treatment.id} 
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{treatment.treatmentName}</span>
                      <Badge variant="outline" className="text-xs">
                        {treatment.treatmentCode}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {treatment.doctorName} • {format(new Date(treatment.performedDate), 'dd/MM/yyyy', { locale })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-sm text-primary">
                      L {treatment.price.toFixed(2)}
                    </div>
                    <Badge 
                      variant={treatment.isCompleted ? "default" : "secondary"} 
                      className="text-xs"
                    >
                      {treatment.isCompleted ? 'Completado' : 'Planificado'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
