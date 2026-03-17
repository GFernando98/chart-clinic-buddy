import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tenant, CreateTenantData } from '@/types';
import { masterService } from '@/services/masterService';

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function dbName(text: string): string {
  return 'db_' + text.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '');
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenant: Tenant | null;
  onSuccess: () => void;
}

export default function ClinicFormDialog({ open, onOpenChange, tenant, onSuccess }: Props) {
  const { toast } = useToast();
  const isEditing = !!tenant;

  const [form, setForm] = useState<CreateTenantData>({
    name: '', ownerName: '', ownerEmail: '', ownerPhone: '', subdomain: '', databaseName: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (tenant) {
        setForm({
          name: tenant.name,
          ownerName: tenant.ownerName,
          ownerEmail: tenant.ownerEmail,
          ownerPhone: tenant.ownerPhone || '',
          subdomain: tenant.subdomain,
          databaseName: tenant.databaseName,
        });
      } else {
        setForm({ name: '', ownerName: '', ownerEmail: '', ownerPhone: '', subdomain: '', databaseName: '' });
      }
    }
  }, [open, tenant]);

  const handleNameChange = (name: string) => {
    setForm(prev => ({
      ...prev,
      name,
      ...(!isEditing ? { subdomain: slugify(name), databaseName: dbName(name) } : {}),
    }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.ownerName || !form.ownerEmail) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }
    setIsSaving(true);
    try {
      if (isEditing && tenant) {
        await masterService.updateTenant(tenant.id, form);
        toast({ title: 'Clinic updated successfully' });
      } else {
        await masterService.createTenant(form);
        toast({ title: 'Clinic created successfully' });
      }
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const set = (key: keyof CreateTenantData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Clinic' : 'New Clinic'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the clinic information.' : 'Enter the details for the new clinic.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Clinic Name *</Label>
              <Input value={form.name} onChange={(e) => handleNameChange(e.target.value)} placeholder="San Rafael Dental" />
            </div>
            <div className="space-y-2">
              <Label>Subdomain</Label>
              <Input value={form.subdomain} onChange={set('subdomain')} placeholder="san-rafael-dental" className="font-mono text-sm" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Database Name</Label>
            <Input value={form.databaseName} onChange={set('databaseName')} placeholder="db_san_rafael_dental" className="font-mono text-sm" />
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-3 text-muted-foreground">Owner Information</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Owner Name *</Label>
                <Input value={form.ownerName} onChange={set('ownerName')} placeholder="Dr. Juan Pérez" />
              </div>
              <div className="space-y-2">
                <Label>Owner Email *</Label>
                <Input type="email" value={form.ownerEmail} onChange={set('ownerEmail')} placeholder="owner@clinic.com" />
              </div>
            </div>
            <div className="space-y-2 mt-4">
              <Label>Owner Phone</Label>
              <Input value={form.ownerPhone || ''} onChange={set('ownerPhone')} placeholder="+504 9999-9999" />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSaving} className="bg-indigo-500 hover:bg-indigo-600 text-white">
            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isEditing ? 'Save Changes' : 'Create Clinic'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
