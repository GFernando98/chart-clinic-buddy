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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { User, UserRole } from '@/types';

const userFormSchema = z.object({
  firstName: z.string().min(2, 'Mínimo 2 caracteres'),
  lastName: z.string().min(2, 'Mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres').optional().or(z.literal('')),
  roles: z.array(z.string()).min(1, 'Selecciona al menos un rol'),
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
  onSave: (user: Partial<User> & { password?: string }) => Promise<void>;
  isSaving?: boolean;
}

const availableRoles: UserRole[] = ['Admin', 'Doctor', 'Receptionist', 'Assistant'];

export const UserFormDialog = ({
  open,
  onOpenChange,
  user,
  onSave,
  isSaving = false,
}: UserFormDialogProps) => {
  const { t } = useTranslation();
  const isEditing = !!user;

  const form = useForm<UserFormValues>({
    resolver: zodResolver(
      isEditing
        ? userFormSchema.omit({ password: true }).extend({
            password: z.string().optional().or(z.literal('')),
          })
        : userFormSchema
    ),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      roles: [],
    },
  });

  useEffect(() => {
    if (open) {
      if (user) {
        form.reset({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          password: '',
          roles: user.roles,
        });
      } else {
        form.reset({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          roles: [],
        });
      }
    }
  }, [open, user, form]);

  const onSubmit = async (values: UserFormValues) => {
    const userData: Partial<User> & { password?: string } = {
      firstName: values.firstName,
      lastName: values.lastName,
      fullName: `${values.firstName} ${values.lastName}`,
      email: values.email,
      roles: values.roles as UserRole[],
    };

    if (values.password) {
      userData.password = values.password;
    }

    if (user) {
      userData.id = user.id;
      userData.isActive = user.isActive;
    } else {
      userData.id = crypto.randomUUID();
      userData.isActive = true;
    }

    await onSave(userData);
  };

  const roleLabels: Record<UserRole, string> = {
    Admin: t('roles.admin'),
    Doctor: t('roles.doctor'),
    Receptionist: t('roles.receptionist'),
    Assistant: t('roles.assistant'),
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t('users.editUser') : t('users.newUser')}
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('common.email')}</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="correo@ejemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('auth.password')}
                    {isEditing && (
                      <span className="ml-2 text-xs text-muted-foreground font-normal">
                        (dejar vacío para mantener actual)
                      </span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="roles"
              render={() => (
                <FormItem>
                  <FormLabel>{t('users.roles')}</FormLabel>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {availableRoles.map((role) => (
                      <FormField
                        key={role}
                        control={form.control}
                        name="roles"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(role)}
                                onCheckedChange={(checked) => {
                                  const currentRoles = field.value || [];
                                  if (checked) {
                                    field.onChange([...currentRoles, role]);
                                  } else {
                                    field.onChange(
                                      currentRoles.filter((r) => r !== role)
                                    );
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              {roleLabels[role]}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
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
