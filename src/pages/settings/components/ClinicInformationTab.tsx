import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Loader2, Building2, ImageIcon, Upload, X, Globe, MapPin, Phone, Mail, FileText } from 'lucide-react';
import { useClinicInformation, useUpdateClinicInformation } from '@/hooks/useClinicInformation';
import { useCountries, useStates, useCities } from '@/hooks/useGeographic';
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
  const [countryIso2, setCountryIso2] = useState('HN');
  const [stateIso2, setStateIso2] = useState('');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const { data: countries = [], isLoading: loadingCountries } = useCountries();
  const { data: states = [], isLoading: loadingStates } = useStates(countryIso2);
  const { data: cities = [], isLoading: loadingCities } = useCities(countryIso2, stateIso2);

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
      if (clinic.logo) setLogoPreview(clinic.logo);
    }
  }, [clinic]);

  // Sync iso2 codes when countries/states load and clinic data is available
  useEffect(() => {
    if (countries.length && form.country) {
      const match = countries.find((c) => c.name === form.country);
      if (match) setCountryIso2(match.iso2);
    }
  }, [countries, form.country]);

  useEffect(() => {
    if (states.length && form.department) {
      const match = states.find((s) => s.name === form.department);
      if (match) setStateIso2(match.iso2);
    }
  }, [states, form.department]);

  useEffect(() => {
    if (clinic?.clinicName) document.title = clinic.clinicName;
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

  const handleCountryChange = (iso2: string) => {
    const country = countries.find((c) => c.iso2 === iso2);
    setCountryIso2(iso2);
    setStateIso2('');
    setForm((prev) => ({ ...prev, country: country?.name || iso2, department: '', city: '' }));
    setFieldErrors((prev) => ({ ...prev, Country: [], Department: [], City: [] }));
  };

  const handleDepartmentChange = (iso2: string) => {
    const state = states.find((s) => s.iso2 === iso2);
    setStateIso2(iso2);
    setForm((prev) => ({ ...prev, department: state?.name || iso2, city: '' }));
    setFieldErrors((prev) => ({ ...prev, Department: [], City: [] }));
  };

  const handleCityChange = (value: string) => {
    setForm((prev) => ({ ...prev, city: value }));
    setFieldErrors((prev) => ({ ...prev, City: [] }));
  };

  const handleInputChange = (key: keyof ClinicInformationFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    // Clear field error on change — map form key to backend PascalCase
    const fieldMap: Record<string, string> = {
      clinicName: 'ClinicName', legalName: 'LegalName', rtn: 'RTN',
      address: 'Address', city: 'City', department: 'Department',
      country: 'Country', phone: 'Phone', email: 'Email', website: 'Website',
    };
    const backendKey = fieldMap[key];
    if (backendKey && fieldErrors[backendKey]) {
      setFieldErrors((prev) => ({ ...prev, [backendKey]: [] }));
    }
  };

  const handleSave = () => {
    setFieldErrors({});
    updateClinic.mutate(form, {
      onError: (error: any) => {
        if (error.fieldErrors) {
          setFieldErrors(error.fieldErrors);
        }
      },
    });
  };

  const getError = (backendKey: string): string | undefined => {
    const errs = fieldErrors[backendKey];
    return errs?.length ? errs[0] : undefined;
  };

  if (isLoading) {
    return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full" /></div>;
  }

  const inputField = (key: keyof ClinicInformationFormData, label: string, backendKey: string, icon?: React.ReactNode) => {
    const error = getError(backendKey);
    return (
      <div className="space-y-1.5">
        <Label className="text-sm font-medium flex items-center gap-1.5">
          {icon}
          {label}
        </Label>
        <Input
          value={(form[key] as string) || ''}
          onChange={handleInputChange(key)}
          className={error ? 'border-destructive focus-visible:ring-destructive' : ''}
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Logo & Identity */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            {t('clinic.title')}
          </CardTitle>
          <CardDescription>{t('settings.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Logo */}
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              <Label className="text-sm font-medium flex items-center gap-1.5 mb-2">
                <ImageIcon className="h-4 w-4" />
                {t('clinic.logo')}
              </Label>
              <div className="flex items-center gap-4">
                <div className="relative h-24 w-24 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/30 flex items-center justify-center overflow-hidden">
                  {logoPreview ? (
                    <>
                      <img src={logoPreview} alt="Logo" className="h-full w-full object-contain p-1" />
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="absolute -top-1 -right-1 rounded-full bg-destructive text-destructive-foreground p-0.5 shadow-sm"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </>
                  ) : (
                    <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                  )}
                </div>
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
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* General Info */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <FileText className="h-4 w-4" />
              {t('clinic.title')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inputField('clinicName', t('clinic.clinicName'), 'ClinicName')}
              {inputField('legalName', t('clinic.legalName'), 'LegalName')}
              {inputField('rtn', t('clinic.rtn'), 'RTN')}
            </div>
          </div>

          <Separator />

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Phone className="h-4 w-4" />
              {t('patients.sectionContact')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inputField('phone', t('common.phone'), 'Phone', <Phone className="h-3.5 w-3.5" />)}
              {inputField('email', t('common.email'), 'Email', <Mail className="h-3.5 w-3.5" />)}
              {inputField('website', t('clinic.website'), 'Website', <Globe className="h-3.5 w-3.5" />)}
            </div>
          </div>

          <Separator />

          {/* Location */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {t('patients.addressInfo')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Country Select */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">{t('clinic.country')}</Label>
                <Select value={countryIso2} onValueChange={handleCountryChange}>
                  <SelectTrigger className={getError('Country') ? 'border-destructive' : ''}>
                    <SelectValue placeholder={loadingCountries ? t('common.loading') : t('common.select')} />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((c) => (
                      <SelectItem key={c.iso2} value={c.iso2}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {getError('Country') && <p className="text-xs text-destructive">{getError('Country')}</p>}
              </div>

              {/* Department/State Select */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">{t('clinic.department')}</Label>
                <Select
                  value={stateIso2}
                  onValueChange={handleDepartmentChange}
                  disabled={!countryIso2 || loadingStates}
                >
                  <SelectTrigger className={getError('Department') ? 'border-destructive' : ''}>
                    <SelectValue placeholder={loadingStates ? t('common.loading') : t('common.select')} />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((s) => (
                      <SelectItem key={s.iso2} value={s.iso2}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {getError('Department') && <p className="text-xs text-destructive">{getError('Department')}</p>}
              </div>

              {/* City Select */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">{t('clinic.city')}</Label>
                <Select
                  value={form.city}
                  onValueChange={handleCityChange}
                  disabled={!form.department || loadingCities}
                >
                  <SelectTrigger className={getError('City') ? 'border-destructive' : ''}>
                    <SelectValue placeholder={loadingCities ? t('common.loading') : t('common.select')} />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {getError('City') && <p className="text-xs text-destructive">{getError('City')}</p>}
              </div>

              {/* Address (full width) */}
              <div className="md:col-span-2 lg:col-span-3">
                {inputField('address', t('common.address'), 'Address', <MapPin className="h-3.5 w-3.5" />)}
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={updateClinic.isPending} size="lg">
              {updateClinic.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t('common.save')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
