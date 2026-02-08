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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useTreatments } from '@/hooks/useTreatments';
import { useDoctors } from '@/hooks/useDoctors';
import { format } from 'date-fns';

const formSchema = z.object({
  treatmentId: z.string().min(1, 'Seleccione un tratamiento'),
  doctorId: z.string().min(1, 'Seleccione un doctor'),
  performedDate: z.string().min(1, 'Ingrese la fecha'),
  price: z.coerce.number().min(0, 'El precio debe ser mayor o igual a 0'),
  surfacesAffected: z.string().optional(),
  notes: z.string().optional(),
  isCompleted: z.boolean().default(true),
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
  const { data: doctors = [], isLoading: loadingDoctors } = useDoctors();

  const form = useForm<ToothTreatmentFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      treatmentId: '',
      doctorId: '',
      performedDate: format(new Date(), 'yyyy-MM-dd'),
      price: 0,
      surfacesAffected: '',
      notes: '',
      isCompleted: true,
    },
  });

  const selectedTreatmentId = form.watch('treatmentId');
  
  // Auto-fill price when treatment is selected
  React.useEffect(() => {
    if (selectedTreatmentId) {
      const treatment = treatments.find(t => t.id === selectedTreatmentId);
      if (treatment) {
        form.setValue('price', treatment.defaultPrice);
      }
    }
  }, [selectedTreatmentId, treatments, form]);

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
            Registre un tratamiento realizado en este diente
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
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          Dr. {doctor.firstName} {doctor.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* Date */}
              <FormField
                control={form.control}
                name="performedDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('common.date')}</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Price */}
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('treatments.price')}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          L
                        </span>
                        <Input 
                          type="number" 
                          step="0.01"
                          className="pl-8"
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Surfaces Affected */}
            <FormField
              control={form.control}
              name="surfacesAffected"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Superficies afectadas (opcional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ej: Mesial, Oclusal" 
                      {...field} 
                    />
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

            {/* Completed Checkbox */}
            <FormField
              control={form.control}
              name="isCompleted"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Tratamiento completado
                    </FormLabel>
                  </div>
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
