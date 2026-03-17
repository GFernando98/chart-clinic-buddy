import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft, Building2, User, Mail, Phone, Globe, Database,
  CheckCircle2, XCircle, Trash2, Loader2, Copy, Pencil,
} from 'lucide-react';
import { Tenant } from '@/types';
import { masterService } from '@/services/masterService';
import ClinicFormDialog from './components/ClinicFormDialog';

export default function TenantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const loadTenant = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      setTenant(await masterService.getTenant(id));
    } catch {
      toast({ title: 'Failed to load clinic details', variant: 'destructive' });
      navigate('/master/tenants');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadTenant(); }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    try {
      await masterService.deleteTenant(id);
      toast({ title: 'Clinic deleted successfully' });
      navigate('/master/tenants');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsDeleting(false);
      setDeleteOpen(false);
    }
  };

  const copyConnectionString = () => {
    if (tenant?.connectionString) {
      navigator.clipboard.writeText(tenant.connectionString);
      toast({ title: 'Copied to clipboard' });
    }
  };

  const maskString = (str: string) => {
    if (str.length <= 20) return '••••••••••••••••';
    return str.substring(0, 10) + '••••••••' + str.substring(str.length - 10);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!tenant) return null;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/master/tenants')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{tenant.name}</h1>
          <p className="text-muted-foreground font-mono text-sm">{tenant.subdomain}</p>
        </div>
        <Button variant="outline" onClick={() => setEditOpen(true)}>
          <Pencil className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clinic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              Clinic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoRow icon={Building2} label="Name" value={tenant.name} />
            <InfoRow icon={Globe} label="Subdomain" value={tenant.subdomain} mono />
            <InfoRow icon={User} label="Owner" value={tenant.ownerName} />
            <InfoRow icon={Mail} label="Email" value={tenant.ownerEmail} />
            {tenant.ownerPhone && <InfoRow icon={Phone} label="Phone" value={tenant.ownerPhone} />}
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge
                variant="outline"
                className={tenant.isActive
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                  : 'bg-red-500/10 text-red-600 border-red-500/20'
                }
              >
                {tenant.isActive ? (
                  <><CheckCircle2 className="h-3 w-3 mr-1" />Active</>
                ) : (
                  <><XCircle className="h-3 w-3 mr-1" />Inactive</>
                )}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Created</span>
              <span className="text-sm">{new Date(tenant.createdAt).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Connection String */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Database className="w-4 h-4 text-muted-foreground" />
              Database
            </CardTitle>
            <CardDescription>Connection details for this clinic's database</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Database Name</p>
              <p className="text-sm font-mono bg-muted rounded-lg p-3">{tenant.databaseName}</p>
            </div>
            {tenant.connectionString && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Connection String</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-mono bg-muted rounded-lg p-3 flex-1 truncate">
                    {maskString(tenant.connectionString)}
                  </p>
                  <Button variant="outline" size="icon" className="shrink-0" onClick={copyConnectionString}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Danger Zone */}
      <Card className="border-red-200 dark:border-red-900/50">
        <CardHeader>
          <CardTitle className="text-base text-red-600">Danger Zone</CardTitle>
          <CardDescription>Irreversible and destructive actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Delete this clinic</p>
              <p className="text-sm text-muted-foreground">Once deleted, all data will be permanently removed.</p>
            </div>
            <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Clinic
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{tenant.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the clinic and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      <ClinicFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        tenant={tenant}
        onSuccess={loadTenant}
      />
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, mono }: { icon: any; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </div>
      <span className={`text-sm ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}
