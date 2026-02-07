import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Pencil,
  Phone,
  Mail,
  MapPin,
  Calendar,
  User,
  Heart,
  Pill,
  AlertTriangle,
  FileText,
  ClipboardList,
  Stethoscope,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { mockPatients, mockOdontograms, mockAppointments } from '@/mocks/data';
import { Patient, Gender, AppointmentStatus } from '@/types';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  const dateLocale = i18n.language === 'es' ? es : enUS;

  useEffect(() => {
    // Simulate API fetch
    const timer = setTimeout(() => {
      const found = mockPatients.find((p) => p.id === id);
      setPatient(found || null);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [id]);

  const getGenderLabel = (gender: Gender) => {
    switch (gender) {
      case Gender.Male:
        return t('patients.genderMale');
      case Gender.Female:
        return t('patients.genderFemale');
      default:
        return t('patients.genderOther');
    }
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    const statusConfig = {
      [AppointmentStatus.Scheduled]: { label: t('appointments.statusScheduled'), variant: 'outline' as const },
      [AppointmentStatus.Confirmed]: { label: t('appointments.statusConfirmed'), variant: 'default' as const },
      [AppointmentStatus.InProgress]: { label: t('appointments.statusInProgress'), variant: 'secondary' as const },
      [AppointmentStatus.Completed]: { label: t('appointments.statusCompleted'), variant: 'default' as const },
      [AppointmentStatus.Cancelled]: { label: t('appointments.statusCancelled'), variant: 'destructive' as const },
      [AppointmentStatus.NoShow]: { label: t('appointments.statusNoShow'), variant: 'destructive' as const },
    };
    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <User className="mb-4 h-16 w-16 text-muted-foreground" />
        <h2 className="text-xl font-semibold">{t('patients.notFound')}</h2>
        <p className="text-muted-foreground">{t('patients.notFoundMessage')}</p>
        <Button onClick={() => navigate('/patients')} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('patients.backToList')}
        </Button>
      </div>
    );
  }

  const patientOdontograms = mockOdontograms.filter((o) => o.patientId === patient.id);
  const patientAppointments = mockAppointments.filter((a) => a.patientId === patient.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/patients')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary text-2xl font-semibold">
              {patient.firstName[0]}{patient.lastName[0]}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{patient.fullName}</h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Badge variant="secondary">{getGenderLabel(patient.gender)}</Badge>
                <span>•</span>
                <span>{patient.age} {t('patients.years')}</span>
              </div>
            </div>
          </div>
        </div>
        <Button onClick={() => navigate(`/patients/${patient.id}/edit`)}>
          <Pencil className="mr-2 h-4 w-4" />
          {t('common.edit')}
        </Button>
      </div>

      {/* Quick Info Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
              <Phone className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('patients.phone')}</p>
              <p className="font-medium">{patient.phone}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
              <Mail className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('patients.email')}</p>
              <p className="font-medium truncate max-w-[150px]">
                {patient.email || '—'}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10">
              <MapPin className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('patients.city')}</p>
              <p className="font-medium">{patient.city || '—'}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/10">
              <Calendar className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('patients.dateOfBirth')}</p>
              <p className="font-medium">
                {format(new Date(patient.dateOfBirth), 'PP', { locale: dateLocale })}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="personal" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">{t('patients.tabPersonal')}</span>
          </TabsTrigger>
          <TabsTrigger value="dental" className="gap-2">
            <Stethoscope className="h-4 w-4" />
            <span className="hidden sm:inline">{t('patients.tabDental')}</span>
          </TabsTrigger>
          <TabsTrigger value="appointments" className="gap-2">
            <ClipboardList className="h-4 w-4" />
            <span className="hidden sm:inline">{t('patients.tabAppointments')}</span>
          </TabsTrigger>
          <TabsTrigger value="medical" className="gap-2">
            <Heart className="h-4 w-4" />
            <span className="hidden sm:inline">{t('patients.tabMedical')}</span>
          </TabsTrigger>
        </TabsList>

        {/* Personal Info Tab */}
        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>{t('patients.personalInfo')}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  {t('patients.contactInfo')}
                </h4>
                <div className="grid gap-3">
                  <InfoRow label={t('patients.identity')} value={patient.identityNumber} />
                  <InfoRow label={t('patients.phone')} value={patient.phone} />
                  <InfoRow label={t('patients.whatsapp')} value={patient.whatsAppNumber} />
                  <InfoRow label={t('patients.email')} value={patient.email} />
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  {t('patients.addressInfo')}
                </h4>
                <div className="grid gap-3">
                  <InfoRow label={t('patients.address')} value={patient.address} />
                  <InfoRow label={t('patients.city')} value={patient.city} />
                  <InfoRow label={t('patients.occupation')} value={patient.occupation} />
                </div>
              </div>
              <Separator className="md:col-span-2" />
              <div className="space-y-4 md:col-span-2">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  {t('patients.emergencyContact')}
                </h4>
                <div className="grid gap-3 md:grid-cols-2">
                  <InfoRow label={t('patients.emergencyName')} value={patient.emergencyContactName} />
                  <InfoRow label={t('patients.emergencyPhone')} value={patient.emergencyContactPhone} />
                </div>
              </div>
              {patient.notes && (
                <>
                  <Separator className="md:col-span-2" />
                  <div className="space-y-4 md:col-span-2">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                      {t('patients.notes')}
                    </h4>
                    <p className="text-sm">{patient.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dental History Tab */}
        <TabsContent value="dental">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t('patients.dentalHistory')}</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/odontogram?patientId=${patient.id}`)}
              >
                {t('patients.viewOdontogram')}
              </Button>
            </CardHeader>
            <CardContent>
              {patientOdontograms.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">{t('patients.noOdontograms')}</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {patientOdontograms.map((odontogram) => (
                    <Card key={odontogram.id} className="cursor-pointer hover:bg-muted/50">
                      <CardContent className="flex items-center justify-between p-4">
                        <div>
                          <p className="font-medium">
                            {format(new Date(odontogram.examinationDate), 'PPP', { locale: dateLocale })}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {odontogram.doctorName}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          {t('common.view')}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appointments Tab */}
        <TabsContent value="appointments">
          <Card>
            <CardHeader>
              <CardTitle>{t('patients.appointmentsHistory')}</CardTitle>
            </CardHeader>
            <CardContent>
              {patientAppointments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <ClipboardList className="mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">{t('patients.noAppointments')}</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {patientAppointments.map((appointment) => (
                    <Card key={appointment.id}>
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">
                              {format(new Date(appointment.scheduledDate), 'PPP', { locale: dateLocale })}
                            </p>
                            {getStatusBadge(appointment.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(appointment.scheduledDate), 'p', { locale: dateLocale })} • {appointment.doctorName}
                          </p>
                          <p className="text-sm">{appointment.reason}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Medical History Tab */}
        <TabsContent value="medical">
          <Card>
            <CardHeader>
              <CardTitle>{t('patients.medicalHistory')}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-4 md:grid-cols-3">
                <MedicalInfoCard
                  icon={AlertTriangle}
                  iconColor="text-red-500"
                  bgColor="bg-red-500/10"
                  title={t('patients.allergies')}
                  content={patient.allergies}
                  emptyText={t('patients.noAllergies')}
                />
                <MedicalInfoCard
                  icon={Heart}
                  iconColor="text-pink-500"
                  bgColor="bg-pink-500/10"
                  title={t('patients.medicalConditions')}
                  content={patient.medicalConditions}
                  emptyText={t('patients.noConditions')}
                />
                <MedicalInfoCard
                  icon={Pill}
                  iconColor="text-blue-500"
                  bgColor="bg-blue-500/10"
                  title={t('patients.currentMedications')}
                  content={patient.currentMedications}
                  emptyText={t('patients.noMedications')}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value || '—'}</span>
    </div>
  );
}

function MedicalInfoCard({
  icon: Icon,
  iconColor,
  bgColor,
  title,
  content,
  emptyText,
}: {
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  bgColor: string;
  title: string;
  content?: string;
  emptyText: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${bgColor}`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
          <h4 className="font-semibold">{title}</h4>
        </div>
        <p className={`text-sm ${content ? '' : 'text-muted-foreground italic'}`}>
          {content || emptyText}
        </p>
      </CardContent>
    </Card>
  );
}
