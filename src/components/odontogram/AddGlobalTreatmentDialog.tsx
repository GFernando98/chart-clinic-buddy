import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Globe } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTreatments } from '@/hooks/useTreatments';
import { useDoctors } from '@/hooks/useDoctors';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  treatmentId: z.string().min(1, 'Seleccione un tratamiento'),
  doctorId: z.string().min(1, 'Seleccione un doctor'),
  status: z.enum(['Planned', 'InProgress', 'Completed']),
  performedDate: z.string().optional(),
  notes: z.string().optional(),
});

export type GlobalTreatmentFormData = z.infer<typeof formSchema>;

interface AddGlobalTreatmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDoctorId?: string;
  onSubmit: (data: GlobalTreatmentFormData) => void;
  isLoading?: boolean;
}

export function AddGlobalTreatmentDialog({
  open,
  onOpenChange,
  defaultDoctorId,
  onSubmit,
  isLoading = false,
}: AddGlobalTreatmentDialogProps) {
  const { t } = useTranslation();
  const { data: treatments = [], isLoading: loadingTreatments } = useTreatments();
  const { data: doctors = [], isLoading: loadingDoctors } = useDoctors();

  // Filter only global treatments
  const globalTreatments = useMemo(() => {
    return treatments.filter(t => t.isActive !== false && t.isGlobalTreatment);
  }, [treatments]);

  const form = useForm<GlobalTreatmentFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      treatmentId: '',
      doctorId: defaultDoctorId || '',
      status: 'Completed',
      performedDate: format(new Date(), 'yyyy-MM-dd'),
      notes: '',
    },
  });

  // Update doctorId when defaultDoctorId changes
  useEffect(() => {
    if (defaultDoctorId) {
      form.setValue('doctorId', defaultDoctorId);
    }
  }, [defaultDoctorId, form]);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        treatmentId: '',
        doctorId: defaultDoctorId || '',
        status: 'Completed',
        performedDate: format(new Date(), 'yyyy-MM-dd'),
        notes: '',
      });
    }
  }, [open, defaultDoctorId, form]);

  const handleSubmit = (data: GlobalTreatmentFormData) => {
    onSubmit(data);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            {t('treatments.addGlobalTreatment')}
          </DialogTitle>
          <DialogDescription>
            Registre un tratamiento global aplicado a toda la boca (ej: limpieza, rayos X)
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Doctor Selection */}
            <FormField
              control={form.control}
              name="doctorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('doctors.title')}</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                    disabled={loadingDoctors}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un doctor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {doctors.filter(d => d.isActive !== false).map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          {doctor.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Treatment Selection - Only global treatments */}
            <FormField
              control={form.control}
              name="treatmentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    {t('treatments.title')}
                    <Badge variant="secondary" className="text-xs">
                      <Globe className="h-3 w-3 mr-1" />
                      {t('treatments.globalBadge')}
                    </Badge>
                  </FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                    disabled={loadingTreatments}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un tratamiento global" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {globalTreatments.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground text-center">
                          No hay tratamientos globales registrados
                        </div>
                      ) : (
                        globalTreatments.map((treatment) => (
                          <SelectItem key={treatment.id} value={treatment.id}>
                            <div className="flex justify-between items-center w-full">
                              <span>{treatment.name}</span>
                              <span className="text-xs text-muted-foreground ml-2">
                                L {treatment.defaultPrice.toFixed(2)}
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status Selection */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione el estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Planned">Planificado</SelectItem>
                      <SelectItem value="InProgress">En progreso</SelectItem>
                      <SelectItem value="Completed">Completado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Performed Date */}
            <FormField
              control={form.control}
              name="performedDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('common.date')} (opcional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('common.notes')} (opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Observaciones adicionales..."
                      className="resize-none"
                      rows={2}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={isLoading || globalTreatments.length === 0}>
                {isLoading ? t('common.saving') : t('common.save')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
