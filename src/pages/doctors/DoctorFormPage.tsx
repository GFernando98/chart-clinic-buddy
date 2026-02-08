import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Skeleton } from '@/components/ui/skeleton';
import { useDoctor, useCreateDoctor, useUpdateDoctor } from '@/hooks/useDoctors';
import { useUsers } from '@/hooks/useUsers';
import type { DoctorFormData } from '@/types';

const doctorSchema = z.object({
  firstName: z.string().min(2, 'Mínimo 2 caracteres'),
  lastName: z.string().min(2, 'Mínimo 2 caracteres'),
  licenseNumber: z.string().min(3, 'Número de colegiado requerido'),
  specialty: z.string().min(2, 'Especialidad requerida'),
  phone: z.string().min(8, 'Teléfono requerido'),
  email: z.string().email('Email inválido'),
  userId: z.string().optional(),
});

type DoctorFormValues = z.infer<typeof doctorSchema>;

const specialties = [
  'Odontología General',
  'Ortodoncia',
  'Endodoncia',
  'Periodoncia',
  'Prostodoncia',
  'Cirugía Oral',
  'Odontopediatría',
  'Estética Dental',
];

const emptyToUndefined = (value?: string) => {
  const v = (value ?? '').trim();
  return v.length ? v : undefined;
};

const toApiPayload = (values: DoctorFormValues): DoctorFormData => ({
  firstName: values.firstName,
  lastName: values.lastName,
  licenseNumber: values.licenseNumber,
  specialty: values.specialty,
  phone: values.phone,
  email: values.email,
  userId: emptyToUndefined(values.userId),
});

export default function DoctorFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isEditing = !!id && id !== 'new';

  const createDoctor = useCreateDoctor();
  const updateDoctor = useUpdateDoctor();
  const {
    data: existingDoctor,
    isLoading: isDoctorLoading,
    error: doctorError,
  } = useDoctor(isEditing ? id : '');

  // Fetch users with Doctor role for linking
  const { data: users = [] } = useUsers();
  const doctorUsers = users.filter(
    (u) => u.roles.includes('Doctor') && u.isActive !== false
  );

  const saving = createDoctor.isPending || updateDoctor.isPending;
  const loading = isEditing ? isDoctorLoading : false;

  const form = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      licenseNumber: '',
      specialty: '',
      phone: '',
      email: '',
      userId: '',
    },
  });

  useEffect(() => {
    if (!isEditing || !existingDoctor) return;

    form.reset({
      firstName: existingDoctor.firstName,
      lastName: existingDoctor.lastName,
      licenseNumber: existingDoctor.licenseNumber,
      specialty: existingDoctor.specialty,
      phone: existingDoctor.phone,
      email: existingDoctor.email,
      userId: existingDoctor.userId || '',
    });
  }, [isEditing, existingDoctor, form]);

  const onSubmit = async (values: DoctorFormValues) => {
    const payload = toApiPayload(values);

    try {
      if (isEditing && id) {
        await updateDoctor.mutateAsync({ id, data: payload });
      } else {
        await createDoctor.mutateAsync(payload);
      }
      navigate('/doctors');
    } catch {
      // Error is handled by the mutation hook; form stays open
    }
  };

  if (doctorError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
        <h2 className="text-lg font-semibold">{t('common.error')}</h2>
        <p className="text-muted-foreground">{(doctorError as Error).message}</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/doctors')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('doctors.backToList')}
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/doctors')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">
          {isEditing ? t('doctors.editDoctor') : t('doctors.newDoctor')}
        </h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('doctors.basicInfo')}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('patients.firstName')} *</FormLabel>
                    <FormControl>
                      <Input placeholder={t('patients.firstNamePlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('patients.lastName')} *</FormLabel>
                    <FormControl>
                      <Input placeholder={t('patients.lastNamePlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="licenseNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('doctors.licenseNumber')} *</FormLabel>
                    <FormControl>
                      <Input placeholder="COL-12345" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="specialty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('doctors.specialty')} *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('doctors.selectSpecialty')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {specialties.map((specialty) => (
                          <SelectItem key={specialty} value={specialty}>
                            {specialty}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('patients.sectionContact')}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('common.phone')} *</FormLabel>
                    <FormControl>
                      <Input placeholder="9999-8888" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('common.email')} *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="doctor@clinica.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* System Link */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('doctors.systemLink')}</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="userId"
                render={({ field }) => (
                  <FormItem className="max-w-md">
                    <FormLabel>
                      {t('doctors.linkedUser')}
                      <span className="ml-2 text-xs text-muted-foreground font-normal">
                        ({t('common.optional')})
                      </span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('doctors.selectUser')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">({t('doctors.noLinkedUser')})</SelectItem>
                        {doctorUsers.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.fullName} ({user.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate('/doctors')} disabled={saving}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Save className="h-4 w-4 mr-2" />
              {t('common.save')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
