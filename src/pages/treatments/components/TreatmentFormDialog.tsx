import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Loader2, Globe, Crosshair } from 'lucide-react';
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
  FormDescription,
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
import { Switch } from '@/components/ui/switch';
import { Treatment } from '@/types';
import { useTreatmentCategories } from '@/hooks/useTreatmentCategories';

const treatmentFormSchema = z.object({
  code: z.string().min(2, 'Código requerido'),
  name: z.string().min(3, 'Nombre requerido'),
  description: z.string().optional(),
  categoryId: z.string().min(1, 'Seleccione una categoría'),
  defaultPrice: z.coerce.number().min(0, 'Precio debe ser mayor o igual a 0'),
  estimatedDurationMinutes: z.coerce.number().min(5, 'Mínimo 5 minutos'),
  isGlobalTreatment: z.boolean(),
});

type TreatmentFormValues = z.infer<typeof treatmentFormSchema>;

interface TreatmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  treatment?: Treatment | null;
  onSave: (treatment: Partial<Treatment> & { categoryId?: string }) => Promise<void>;
  isSaving?: boolean;
}

export const TreatmentFormDialog = ({
  open,
  onOpenChange,
  treatment,
  onSave,
  isSaving = false,
}: TreatmentFormDialogProps) => {
  const { t } = useTranslation();
  const isEditing = !!treatment;

  // Fetch categories from API
  const { data: categories = [], isLoading: categoriesLoading } = useTreatmentCategories();

  const form = useForm<TreatmentFormValues>({
    resolver: zodResolver(treatmentFormSchema),
    defaultValues: {
      code: '',
      name: '',
      description: '',
      categoryId: '',
      defaultPrice: 0,
      estimatedDurationMinutes: 30,
      isGlobalTreatment: false,
    },
  });

  useEffect(() => {
    if (open) {
      if (treatment) {
        form.reset({
          code: treatment.code,
          name: treatment.name,
          description: treatment.description || '',
          categoryId: String(treatment.category),
          defaultPrice: treatment.defaultPrice,
          estimatedDurationMinutes: treatment.estimatedDurationMinutes,
          isGlobalTreatment: treatment.isGlobalTreatment ?? false,
        });
      } else {
        form.reset({
          code: '',
          name: '',
          description: '',
          categoryId: categories[0]?.id || '',
          defaultPrice: 0,
          estimatedDurationMinutes: 30,
          isGlobalTreatment: false,
        });
      }
    }
  }, [open, treatment, form, categories]);

  const onSubmit = async (values: TreatmentFormValues) => {
    const treatmentData: Partial<Treatment> & { categoryId?: string } = {
      code: values.code,
      name: values.name,
      description: values.description || undefined,
      categoryId: values.categoryId,
      defaultPrice: values.defaultPrice,
      estimatedDurationMinutes: values.estimatedDurationMinutes,
      isGlobalTreatment: values.isGlobalTreatment,
    };

    if (treatment) {
      treatmentData.id = treatment.id;
      treatmentData.isActive = treatment.isActive;
    }

    await onSave(treatmentData);
  };

  const isGlobal = form.watch('isGlobalTreatment');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t('treatments.editTreatment') : t('treatments.newTreatment')}
          </DialogTitle>
        </DialogHeader>

        {categoriesLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
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
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('treatments.category')}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('treatments.selectCategory')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.filter(c => c.isActive).map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
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

              {/* Global Treatment Toggle */}
              <FormField
                control={form.control}
                name="isGlobalTreatment"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel className="flex items-center gap-2">
                        {isGlobal ? (
                          <Globe className="h-4 w-4 text-primary" />
                        ) : (
                          <Crosshair className="h-4 w-4 text-muted-foreground" />
                        )}
                        {t('treatments.isGlobalTreatment')}
                      </FormLabel>
                      <FormDescription className="text-xs">
                        {t('treatments.isGlobalTreatmentDescription')}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
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
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {t('common.save')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};
