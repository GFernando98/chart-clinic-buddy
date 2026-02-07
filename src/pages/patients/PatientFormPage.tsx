import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { mockPatients } from '@/mocks/data';
import { Patient, Gender } from '@/types';
import { ChevronDown } from 'lucide-react';

const patientSchema = z.object({
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  identityNumber: z.string().min(13, 'El número de identidad debe tener 13 dígitos'),
  dateOfBirth: z.string().min(1, 'La fecha de nacimiento es requerida'),
  gender: z.nativeEnum(Gender),
  phone: z.string().min(8, 'El teléfono debe tener al menos 8 dígitos'),
  whatsAppNumber: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  occupation: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  allergies: z.string().optional(),
  medicalConditions: z.string().optional(),
  currentMedications: z.string().optional(),
  notes: z.string().optional(),
});

type PatientFormData = z.infer<typeof patientSchema>;

export default function PatientFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const isEditing = !!id && id !== 'new';

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [personalOpen, setPersonalOpen] = useState(true);
  const [contactOpen, setContactOpen] = useState(true);
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [medicalOpen, setMedicalOpen] = useState(false);

  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      identityNumber: '',
      dateOfBirth: '',
      gender: Gender.Male,
      phone: '',
      whatsAppNumber: '',
      email: '',
      address: '',
      city: '',
      occupation: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      allergies: '',
      medicalConditions: '',
      currentMedications: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (isEditing) {
      const timer = setTimeout(() => {
        const patient = mockPatients.find((p) => p.id === id);
        if (patient) {
          form.reset({
            firstName: patient.firstName,
            lastName: patient.lastName,
            identityNumber: patient.identityNumber,
            dateOfBirth: patient.dateOfBirth,
            gender: patient.gender,
            phone: patient.phone,
            whatsAppNumber: patient.whatsAppNumber || '',
            email: patient.email || '',
            address: patient.address || '',
            city: patient.city || '',
            occupation: patient.occupation || '',
            emergencyContactName: patient.emergencyContactName || '',
            emergencyContactPhone: patient.emergencyContactPhone || '',
            allergies: patient.allergies || '',
            medicalConditions: patient.medicalConditions || '',
            currentMedications: patient.currentMedications || '',
            notes: patient.notes || '',
          });
        }
        setLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [id, isEditing, form]);

  const onSubmit = async (data: PatientFormData) => {
    setSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    toast({
      title: isEditing ? t('patients.updateSuccess') : t('patients.createSuccess'),
      description: isEditing
        ? t('patients.updateSuccessMessage', { name: `${data.firstName} ${data.lastName}` })
        : t('patients.createSuccessMessage', { name: `${data.firstName} ${data.lastName}` }),
    });
    
    setSaving(false);
    navigate('/patients');
  };

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
        <Button variant="ghost" size="icon" onClick={() => navigate('/patients')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">
          {isEditing ? t('patients.editPatient') : t('patients.newPatient')}
        </h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information */}
          <Collapsible open={personalOpen} onOpenChange={setPersonalOpen}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{t('patients.sectionPersonal')}</CardTitle>
                    <ChevronDown className={`h-5 w-5 transition-transform ${personalOpen ? 'rotate-180' : ''}`} />
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
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
                    name="identityNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('patients.identity')} *</FormLabel>
                        <FormControl>
                          <Input placeholder="0801199912345" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('patients.dateOfBirth')} *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('patients.gender')} *</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(Number(value))}
                          value={String(field.value)}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('patients.selectGender')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={String(Gender.Male)}>{t('patients.genderMale')}</SelectItem>
                            <SelectItem value={String(Gender.Female)}>{t('patients.genderFemale')}</SelectItem>
                            <SelectItem value={String(Gender.Other)}>{t('patients.genderOther')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="occupation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('patients.occupation')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('patients.occupationPlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Contact Information */}
          <Collapsible open={contactOpen} onOpenChange={setContactOpen}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{t('patients.sectionContact')}</CardTitle>
                    <ChevronDown className={`h-5 w-5 transition-transform ${contactOpen ? 'rotate-180' : ''}`} />
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('patients.phone')} *</FormLabel>
                        <FormControl>
                          <Input placeholder="9999-8888" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="whatsAppNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('patients.whatsapp')}</FormLabel>
                        <FormControl>
                          <Input placeholder="50499998888" {...field} />
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
                        <FormLabel>{t('patients.email')}</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="correo@ejemplo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('patients.city')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('patients.cityPlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>{t('patients.address')}</FormLabel>
                        <FormControl>
                          <Textarea placeholder={t('patients.addressPlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Emergency Contact */}
          <Collapsible open={emergencyOpen} onOpenChange={setEmergencyOpen}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{t('patients.sectionEmergency')}</CardTitle>
                    <ChevronDown className={`h-5 w-5 transition-transform ${emergencyOpen ? 'rotate-180' : ''}`} />
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="emergencyContactName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('patients.emergencyName')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('patients.emergencyNamePlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="emergencyContactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('patients.emergencyPhone')}</FormLabel>
                        <FormControl>
                          <Input placeholder="9999-7777" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Medical Information */}
          <Collapsible open={medicalOpen} onOpenChange={setMedicalOpen}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{t('patients.sectionMedical')}</CardTitle>
                    <ChevronDown className={`h-5 w-5 transition-transform ${medicalOpen ? 'rotate-180' : ''}`} />
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="grid gap-4">
                  <FormField
                    control={form.control}
                    name="allergies"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('patients.allergies')}</FormLabel>
                        <FormControl>
                          <Textarea placeholder={t('patients.allergiesPlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="medicalConditions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('patients.medicalConditions')}</FormLabel>
                        <FormControl>
                          <Textarea placeholder={t('patients.medicalConditionsPlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="currentMedications"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('patients.currentMedications')}</FormLabel>
                        <FormControl>
                          <Textarea placeholder={t('patients.currentMedicationsPlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('patients.notes')}</FormLabel>
                        <FormControl>
                          <Textarea placeholder={t('patients.notesPlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate('/patients')}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('common.saving')}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {t('common.save')}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
