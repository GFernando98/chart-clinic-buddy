import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Treatment, TreatmentCategory } from '@/types';

const treatmentFormSchema = z.object({
  code: z.string().min(2, 'Código requerido'),
  name: z.string().min(3, 'Nombre requerido'),
  description: z.string().optional(),
  category: z.nativeEnum(TreatmentCategory),
  defaultPrice: z.coerce.number().min(0, 'Precio debe ser mayor o igual a 0'),
  estimatedDurationMinutes: z.coerce.number().min(5, 'Mínimo 5 minutos'),
});

type TreatmentFormValues = z.infer<typeof treatmentFormSchema>;

interface TreatmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  treatment?: Treatment | null;
  onSave: (treatment: Partial<Treatment>) => void;
}

export const TreatmentFormDialog = ({
  open,
  onOpenChange,
  treatment,
  onSave,
}: TreatmentFormDialogProps) => {
  const { t } = useTranslation();
  const isEditing = !!treatment;

  const form = useForm<TreatmentFormValues>({
    resolver: zodResolver(treatmentFormSchema),
    defaultValues: {
      code: '',
      name: '',
      description: '',
      category: TreatmentCategory.Preventive,
      defaultPrice: 0,
      estimatedDurationMinutes: 30,
    },
  });

  useEffect(() => {
    if (open) {
      if (treatment) {
        form.reset({
          code: treatment.code,
          name: treatment.name,
          description: treatment.description || '',
          category: treatment.category,
          defaultPrice: treatment.defaultPrice,
          estimatedDurationMinutes: treatment.estimatedDurationMinutes,
        });
      } else {
        form.reset({
          code: '',
          name: '',
          description: '',
          category: TreatmentCategory.Preventive,
          defaultPrice: 0,
          estimatedDurationMinutes: 30,
        });
      }
    }
  }, [open, treatment, form]);

  const onSubmit = (values: TreatmentFormValues) => {
    const treatmentData: Partial<Treatment> = {
      code: values.code,
      name: values.name,
      description: values.description || undefined,
      category: values.category,
      defaultPrice: values.defaultPrice,
      estimatedDurationMinutes: values.estimatedDurationMinutes,
    };

    if (treatment) {
      treatmentData.id = treatment.id;
      treatmentData.isActive = treatment.isActive;
    } else {
      treatmentData.id = crypto.randomUUID();
      treatmentData.isActive = true;
    }

    onSave(treatmentData);
    onOpenChange(false);
  };

  const categoryOptions = [
    { value: TreatmentCategory.Preventive, label: t('treatments.preventive') },
    { value: TreatmentCategory.Restorative, label: t('treatments.restorative') },
    { value: TreatmentCategory.Endodontics, label: t('treatments.endodontics') },
    { value: TreatmentCategory.Periodontics, label: t('treatments.periodontics') },
    { value: TreatmentCategory.Orthodontics, label: t('treatments.orthodontics') },
    { value: TreatmentCategory.Prosthodontics, label: t('treatments.prosthodontics') },
    { value: TreatmentCategory.OralSurgery, label: t('treatments.oralSurgery') },
    { value: TreatmentCategory.Pediatric, label: t('treatments.pediatric') },
    { value: TreatmentCategory.Cosmetic, label: t('treatments.cosmetic') },
    { value: TreatmentCategory.Diagnostic, label: t('treatments.diagnostic') },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t('treatments.editTreatment') : t('treatments.newTreatment')}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('treatments.code')}</FormLabel>
                    <FormControl>
                      <Input placeholder="PREV-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('treatments.category')}</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={String(field.value)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('treatments.selectCategory')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categoryOptions.map((option) => (
                          <SelectItem key={option.value} value={String(option.value)}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('common.name')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('treatments.namePlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('common.description')}
                    <span className="ml-2 text-xs text-muted-foreground font-normal">
                      ({t('common.optional')})
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('treatments.descriptionPlaceholder')}
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="defaultPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('treatments.defaultPrice')}</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} step={0.01} placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estimatedDurationMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('treatments.estimatedDuration')}</FormLabel>
                    <FormControl>
                      <Input type="number" min={5} step={5} placeholder="30" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit">{t('common.save')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
