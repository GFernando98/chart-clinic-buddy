import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Shield, LogOut, Plus, Building2, Users, CheckCircle2, XCircle,
  Loader2, Search, KeyRound,
} from 'lucide-react';
import { Tenant, CreateTenantData } from '@/types';
import { masterService, getMasterToken, clearMasterToken } from '@/services/masterService';

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function MasterDashboardPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Create dialog
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<CreateTenantData>({
    name: '', slug: '', connectionString: '',
    adminUserName: '', adminPassword: '', adminFirstName: '', adminLastName: '', adminEmail: '',
  });

  // Toggle dialog
  const [toggleTarget, setToggleTarget] = useState<Tenant | null>(null);

  // Change password
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    if (!getMasterToken()) { navigate('/master/login'); return; }
    loadTenants();
  }, [navigate]);

  const loadTenants = async () => {
    setIsLoading(true);
    try {
      const data = await masterService.getTenants();
      setTenants(data);
    } catch {
      toast({ title: 'Error al cargar clínicas', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTenants = useMemo(() => {
    if (!searchQuery) return tenants;
    const q = searchQuery.toLowerCase();
    return tenants.filter(t => t.name.toLowerCase().includes(q) || t.slug.toLowerCase().includes(q));
  }, [tenants, searchQuery]);

  const handleLogout = () => { clearMasterToken(); navigate('/master/login'); };

  const handleNameChange = (name: string) => {
    setForm(prev => ({ ...prev, name, slug: slugify(name) }));
  };

  const handleCreate = async () => {
    if (!form.name || !form.connectionString || !form.adminUserName || !form.adminPassword) {
      toast({ title: 'Completa todos los campos obligatorios', variant: 'destructive' });
      return;
    }
    setIsSaving(true);
    try {
      await masterService.createTenant(form);
      toast({ title: 'Clínica creada. La base de datos fue generada automáticamente.' });
      setIsCreateOpen(false);
      setForm({ name: '', slug: '', connectionString: '', adminUserName: '', adminPassword: '', adminFirstName: '', adminLastName: '', adminEmail: '' });
      loadTenants();
    } catch (err: any) {
      toast({ title: 'Error al crear clínica', description: err.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = async () => {
    if (!toggleTarget) return;
    try {
      await masterService.toggleTenantStatus(toggleTarget.id);
      toast({ title: `Clínica ${toggleTarget.isActive ? 'desactivada' : 'activada'}` });
      setToggleTarget(null);
      loadTenants();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleChangePassword = async () => {
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast({ title: 'Las contraseñas no coinciden', variant: 'destructive' });
      return;
    }
    if (pwForm.newPassword.length < 6) {
      toast({ title: 'La nueva contraseña debe tener al menos 6 caracteres', variant: 'destructive' });
      return;
    }
    setPwSaving(true);
    try {
      await masterService.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast({ title: 'Contraseña actualizada correctamente' });
      setIsPasswordOpen(false);
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-background" />
            </div>
            <span className="font-semibold">SmileOS Master</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsPasswordOpen(true)}>
              <KeyRound className="h-4 w-4 mr-2" />
              Cambiar contraseña
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Gestión de Clínicas</h1>
            <p className="text-muted-foreground">{tenants.length} clínicas registradas</p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Clínica
          </Button>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar clínica..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead className="text-center">Usuarios</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha creación</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTenants.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                        <Building2 className="mx-auto h-10 w-10 mb-3 opacity-50" />
                        No se encontraron clínicas
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTenants.map((tenant) => (
                      <TableRow key={tenant.id}>
                        <TableCell className="font-medium">{tenant.name}</TableCell>
                        <TableCell className="text-muted-foreground font-mono text-sm">{tenant.slug}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary"><Users className="h-3 w-3 mr-1" />{tenant.userCount}</Badge>
                        </TableCell>
                        <TableCell>
                          {tenant.isActive ? (
                            <Badge variant="outline" className="bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30">
                              <CheckCircle2 className="h-3 w-3 mr-1" />Activa
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30">
                              <XCircle className="h-3 w-3 mr-1" />Inactiva
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(tenant.createdAt).toLocaleDateString('es-HN')}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => setToggleTarget(tenant)}>
                            {tenant.isActive ? 'Desactivar' : 'Activar'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="py-3 px-6 text-center text-xs text-muted-foreground/60 border-t mt-8">
        © {new Date().getFullYear()} SmileOS · Distribuido por <span className="font-medium">SysCore</span>
      </footer>

      {/* Create Tenant Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nueva Clínica</DialogTitle>
            <DialogDescription>Ingresa los datos de la nueva clínica y su administrador inicial.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre de la clínica *</Label>
                <Input value={form.name} onChange={(e) => handleNameChange(e.target.value)} placeholder="Clínica San Rafael" />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input value={form.slug} onChange={(e) => setForm(p => ({ ...p, slug: e.target.value }))} placeholder="clinica-san-rafael" className="font-mono text-sm" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Connection String *</Label>
              <Textarea value={form.connectionString} onChange={(e) => setForm(p => ({ ...p, connectionString: e.target.value }))}
                placeholder="Server=...;Database=...;" rows={3} className="font-mono text-sm" />
            </div>
            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-3">Administrador inicial</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Usuario *</Label>
                  <Input value={form.adminUserName} onChange={(e) => setForm(p => ({ ...p, adminUserName: e.target.value }))} placeholder="admin" />
                </div>
                <div className="space-y-2">
                  <Label>Contraseña *</Label>
                  <Input type="password" value={form.adminPassword} onChange={(e) => setForm(p => ({ ...p, adminPassword: e.target.value }))} placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                  <Label>Nombre</Label>
                  <Input value={form.adminFirstName} onChange={(e) => setForm(p => ({ ...p, adminFirstName: e.target.value }))} placeholder="Juan" />
                </div>
                <div className="space-y-2">
                  <Label>Apellido</Label>
                  <Input value={form.adminLastName} onChange={(e) => setForm(p => ({ ...p, adminLastName: e.target.value }))} placeholder="Pérez" />
                </div>
              </div>
              <div className="space-y-2 mt-4">
                <Label>Email</Label>
                <Input type="email" value={form.adminEmail} onChange={(e) => setForm(p => ({ ...p, adminEmail: e.target.value }))} placeholder="admin@clinica.com" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)} disabled={isSaving}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Crear Clínica
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toggle Status Confirm */}
      <AlertDialog open={!!toggleTarget} onOpenChange={() => setToggleTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{toggleTarget?.isActive ? 'Desactivar' : 'Activar'} clínica</AlertDialogTitle>
            <AlertDialogDescription>
              {toggleTarget?.isActive
                ? `¿Deseas desactivar "${toggleTarget?.name}"? Los usuarios de esta clínica no podrán iniciar sesión.`
                : `¿Deseas activar "${toggleTarget?.name}"?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggle}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Change Password Dialog */}
      <Dialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Cambiar contraseña</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Contraseña actual</Label>
              <Input type="password" value={pwForm.currentPassword} onChange={(e) => setPwForm(p => ({ ...p, currentPassword: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Nueva contraseña</Label>
              <Input type="password" value={pwForm.newPassword} onChange={(e) => setPwForm(p => ({ ...p, newPassword: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Confirmar nueva contraseña</Label>
              <Input type="password" value={pwForm.confirmPassword} onChange={(e) => setPwForm(p => ({ ...p, confirmPassword: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPasswordOpen(false)} disabled={pwSaving}>Cancelar</Button>
            <Button onClick={handleChangePassword} disabled={pwSaving}>
              {pwSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
