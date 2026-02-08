import React from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { useTreatments } from '@/hooks/useTreatments';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  treatmentId: z.string().min(1, 'Seleccione un tratamiento'),
  status: z.enum(['Planned', 'InProgress', 'Completed']),
  performedDate: z.string().optional(),
  notes: z.string().optional(),
});

export type ToothTreatmentFormData = z.infer<typeof formSchema>;

interface AddToothTreatmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  toothNumber: number;
  onSubmit: (data: ToothTreatmentFormData) => void;
  isLoading?: boolean;
}

export function AddToothTreatmentDialog({
  open,
  onOpenChange,
  toothNumber,
  onSubmit,
  isLoading = false,
}: AddToothTreatmentDialogProps) {
  const { t } = useTranslation();
  const { data: treatments = [], isLoading: loadingTreatments } = useTreatments();

  const form = useForm<ToothTreatmentFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      treatmentId: '',
      status: 'Planned',
      performedDate: format(new Date(), 'yyyy-MM-dd'),
      notes: '',
    },
  });

  const handleSubmit = (data: ToothTreatmentFormData) => {
    onSubmit(data);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {t('odontogram.addTreatment')} - {t('odontogram.tooth')} #{toothNumber}
          </DialogTitle>
          <DialogDescription>
            Registre un tratamiento realizado o planificado en este diente
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Treatment Selection */}
            <FormField
              control={form.control}
              name="treatmentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('treatments.title')}</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                    disabled={loadingTreatments}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un tratamiento" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {treatments.map((treatment) => (
                        <SelectItem key={treatment.id} value={treatment.id}>
                          <div className="flex justify-between items-center w-full">
                            <span>{treatment.name}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              L {treatment.defaultPrice.toFixed(2)}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
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
                      placeholder="Ej: Resina compuesta, observaciones..."
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
              <Button type="submit" disabled={isLoading}>
                {isLoading ? t('common.saving') : t('common.save')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
