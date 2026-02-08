import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import { Doctor, User } from '@/types';
import { mockUsers } from '@/mocks/data';

const doctorFormSchema = z.object({
  firstName: z.string().min(2, 'Mínimo 2 caracteres'),
  lastName: z.string().min(2, 'Mínimo 2 caracteres'),
  licenseNumber: z.string().min(3, 'Número de colegiado requerido'),
  specialty: z.string().min(2, 'Especialidad requerida'),
  phone: z.string().min(8, 'Teléfono requerido'),
  email: z.string().email('Email inválido'),
  userId: z.string().optional(),
});

type DoctorFormValues = z.infer<typeof doctorFormSchema>;

interface DoctorFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctor?: Doctor | null;
  onSave: (doctor: Partial<Doctor>) => Promise<void>;
  isSaving?: boolean;
}

export const DoctorFormDialog = ({
  open,
  onOpenChange,
  doctor,
  onSave,
  isSaving = false,
}: DoctorFormDialogProps) => {
  const { t } = useTranslation();
  const isEditing = !!doctor;

  // Filter users with Doctor role for linking
  const doctorUsers = mockUsers.filter(
    (u) => u.roles.includes('Doctor') && u.isActive !== false
  );

  const form = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorFormSchema),
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
    if (open) {
      if (doctor) {
        form.reset({
          firstName: doctor.firstName,
          lastName: doctor.lastName,
          licenseNumber: doctor.licenseNumber,
          specialty: doctor.specialty,
          phone: doctor.phone,
          email: doctor.email,
          userId: doctor.userId || '',
        });
      } else {
        form.reset({
          firstName: '',
          lastName: '',
          licenseNumber: '',
          specialty: '',
          phone: '',
          email: '',
          userId: '',
        });
      }
    }
  }, [open, doctor, form]);

  const onSubmit = async (values: DoctorFormValues) => {
    const doctorData: Partial<Doctor> = {
      firstName: values.firstName,
      lastName: values.lastName,
      fullName: `Dr. ${values.firstName} ${values.lastName}`,
      licenseNumber: values.licenseNumber,
      specialty: values.specialty,
      phone: values.phone,
      email: values.email,
      userId: values.userId || undefined,
    };

    if (doctor) {
      doctorData.id = doctor.id;
      doctorData.isActive = doctor.isActive;
    } else {
      doctorData.id = crypto.randomUUID();
      doctorData.isActive = true;
    }

    await onSave(doctorData);
  };

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t('doctors.editDoctor') : t('doctors.newDoctor')}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('patients.firstName')}</FormLabel>
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
                    <FormLabel>{t('patients.lastName')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('patients.lastNamePlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="licenseNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('doctors.licenseNumber')}</FormLabel>
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
                  <FormLabel>{t('doctors.specialty')}</FormLabel>
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

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('common.phone')}</FormLabel>
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
                  <FormLabel>{t('common.email')}</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="doctor@clinica.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
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
      </DialogContent>
    </Dialog>
  );
};
