import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Building2, ImageIcon, Upload, X } from 'lucide-react';
import { useClinicInformation, useUpdateClinicInformation } from '@/hooks/useClinicInformation';
import { ClinicInformationFormData } from '@/types';

export function ClinicInformationTab() {
  const { t } = useTranslation();
  const { data: clinic, isLoading } = useClinicInformation();
  const updateClinic = useUpdateClinicInformation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<ClinicInformationFormData>({
    clinicName: '', legalName: '', rtn: '', address: '',
    city: '', department: '', country: 'Honduras', phone: '', email: '',
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (clinic) {
      setForm({
        clinicName: clinic.clinicName || '',
        legalName: clinic.legalName || '',
        rtn: clinic.rtn || '',
        address: clinic.address || '',
        city: clinic.city || '',
        department: clinic.department || '',
        country: clinic.country || 'Honduras',
        phone: clinic.phone || '',
        email: clinic.email || '',
        website: clinic.website || '',
        logo: clinic.logo || '',
      });
      if (clinic.logo) {
        setLogoPreview(clinic.logo);
      }
    }
  }, [clinic]);

  useEffect(() => {
    if (clinic?.clinicName) {
      document.title = clinic.clinicName;
    }
  }, [clinic?.clinicName]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((prev) => ({ ...prev, logoFile: file }));
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setForm((prev) => ({ ...prev, logoFile: undefined, logo: '' }));
    setLogoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = () => updateClinic.mutate(form);

  if (isLoading) {
    return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full" /></div>;
  }

  const field = (key: keyof ClinicInformationFormData, label: string) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        value={(form[key] as string) || ''}
        onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
      />
    </div>
  );

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          {t('clinic.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Logo upload */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            {t('clinic.logo')}
          </Label>
          <div className="flex items-center gap-4">
            {logoPreview && (
              <div className="relative">
                <img
                  src={logoPreview}
                  alt="Logo"
                  className="h-20 w-20 object-contain rounded border bg-muted/30 p-1"
                />
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="absolute -top-2 -right-2 rounded-full bg-destructive text-destructive-foreground p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                {logoPreview ? t('common.change') : t('common.select')}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {field('clinicName', t('clinic.clinicName'))}
          {field('legalName', t('clinic.legalName'))}
          {field('rtn', t('clinic.rtn'))}
          {field('phone', t('common.phone'))}
          {field('email', t('common.email'))}
          {field('website', t('clinic.website'))}
          {field('address', t('common.address'))}
          {field('city', t('clinic.city'))}
          {field('department', t('clinic.department'))}
          {field('country', t('clinic.country'))}
        </div>
        <Button onClick={handleSave} disabled={updateClinic.isPending}>
          {updateClinic.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {t('common.save')}
        </Button>
      </CardContent>
    </Card>
  );
}
