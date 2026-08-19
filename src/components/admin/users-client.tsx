"use client";

import { FormEvent, useState } from "react";
import { Eye, EyeOff, Pencil, Plus, Power, Users } from "lucide-react";
import { toast } from "sonner";
import { createUser, toggleUserStatus, updateUserCostCenters } from "@/actions/admin.actions";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type UserRow = {
  id: string;
  name: string | null;
  email: string;
  role: "ADMIN" | "USER";
  status: "ACTIVE" | "INACTIVE";
  createdAt: Date;
  costCenters: { id: string; name: string }[];
};

export function UsersClient({
  initialUsers,
  availableCostCenters,
  currentUserId,
}: {
  initialUsers: UserRow[];
  availableCostCenters: { id: string; name: string }[];
  currentUserId: string;
}) {
  const [users, setUsers] = useState(initialUsers);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"ADMIN" | "USER">("USER");
  const [selectedCostCenterIds, setSelectedCostCenterIds] = useState<string[]>([]);
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);

  const openCreate = () => {
    setName("");
    setEmail("");
    setPassword("");
    setRole("USER");
    setSelectedCostCenterIds([]);
    setEditingUser(null);
    setShowPassword(false);
    setDialogOpen(true);
  };

  const openAssignments = (user: UserRow) => {
    setEditingUser(user);
    setSelectedCostCenterIds(user.costCenters.map((costCenter) => costCenter.id));
    setDialogOpen(true);
  };

  const toggleCostCenter = (costCenterId: string) => {
    setSelectedCostCenterIds((current) =>
      current.includes(costCenterId)
        ? current.filter((id) => id !== costCenterId)
        : [...current, costCenterId]
    );
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    if (role === "USER" && selectedCostCenterIds.length === 0) {
      toast.error("Asigna al menos un Centro de Costo.");
      return;
    }

    const result = await createUser({
      name,
      email,
      password,
      role,
      costCenterIds: selectedCostCenterIds,
    });
    setLoading(false);

    if (result.error || !result.user) {
      toast.error(result.error ?? "No se pudo crear el usuario.");
      return;
    }

    setUsers((current) =>
      [...current, result.user].sort((a, b) =>
        (a.name ?? a.email).localeCompare(b.name ?? b.email, "es")
      )
    );
    setDialogOpen(false);
    toast.success("Usuario creado correctamente.");
  };

  const handleUpdateAssignments = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingUser) return;
    if (editingUser.role === "USER" && selectedCostCenterIds.length === 0) {
      toast.error("Asigna al menos un Centro de Costo.");
      return;
    }

    setLoading(true);
    const result = await updateUserCostCenters(editingUser.id, selectedCostCenterIds);
    setLoading(false);
    if (result.error || !result.costCenters) {
      toast.error(result.error ?? "No se pudieron actualizar las asignaciones.");
      return;
    }

    setUsers((current) =>
      current.map((user) =>
        user.id === editingUser.id ? { ...user, costCenters: result.costCenters } : user
      )
    );
    setDialogOpen(false);
    toast.success("Centros de Costo actualizados.");
  };

  const handleToggle = async (user: UserRow) => {
    const nextStatus = user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const result = await toggleUserStatus(user.id, nextStatus);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    setUsers((current) =>
      current.map((item) =>
        item.id === user.id ? { ...item, status: nextStatus } : item
      )
    );
    toast.success(nextStatus === "ACTIVE" ? "Usuario activado." : "Usuario desactivado.");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Usuarios</h1>
          <p className="text-[var(--muted-foreground)] text-sm mt-1">
            {users.length} {users.length === 1 ? "usuario registrado" : "usuarios registrados"}
          </p>
        </div>
        <Button id="new-user-btn" onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Usuario
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-[var(--border)] overflow-x-auto shadow-sm">
        {users.length === 0 ? (
          <div className="text-center py-16 text-[var(--muted-foreground)]">
            <Users className="w-12 h-12 mx-auto opacity-20 mb-3" />
            <p>No hay usuarios registrados.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[var(--muted)] border-b border-[var(--border)]">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-[var(--muted-foreground)]">Usuario</th>
                <th className="text-left px-5 py-3 font-semibold text-[var(--muted-foreground)] hidden md:table-cell">Email</th>
                <th className="text-center px-5 py-3 font-semibold text-[var(--muted-foreground)]">Rol</th>
                <th className="text-left px-5 py-3 font-semibold text-[var(--muted-foreground)]">Centros asignados</th>
                <th className="text-center px-5 py-3 font-semibold text-[var(--muted-foreground)]">Estado</th>
                <th className="text-left px-5 py-3 font-semibold text-[var(--muted-foreground)] hidden lg:table-cell">Creado</th>
                <th className="text-center px-5 py-3 font-semibold text-[var(--muted-foreground)]">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-[var(--accent)] transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--primary)]/15 flex items-center justify-center flex-shrink-0">
                        <span className="text-[var(--primary)] text-xs font-bold">
                          {(user.name || user.email).charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{user.name ?? "Sin nombre"}</p>
                        <p className="text-xs text-[var(--muted-foreground)] md:hidden">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-[var(--muted-foreground)] hidden md:table-cell">{user.email}</td>
                  <td className="px-5 py-4 text-center">
                    <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                      {user.role === "ADMIN" ? "Administrador" : "Usuario"}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-[var(--muted-foreground)]">
                    {user.role === "ADMIN" ? (
                      <span className="text-xs">Todos</span>
                    ) : user.costCenters.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {user.costCenters.map((costCenter) => (
                          <Badge key={costCenter.id} variant="secondary">
                            {costCenter.name}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-amber-600">Sin asignación</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <Badge variant={user.status === "ACTIVE" ? "default" : "destructive"}>
                      {user.status === "ACTIVE" ? "Activo" : "Inactivo"}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-[var(--muted-foreground)] text-xs hidden lg:table-cell">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <div className="flex justify-center gap-1">
                      {user.role === "USER" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openAssignments(user)}
                          aria-label={`Editar Centros de Costo de ${user.name}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={user.id === currentUserId}
                        onClick={() => handleToggle(user)}
                        aria-label={user.status === "ACTIVE" ? `Desactivar ${user.name}` : `Activar ${user.name}`}
                        title={user.id === currentUserId ? "No puedes desactivar tu propia cuenta" : undefined}
                      >
                        <Power className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent aria-labelledby="new-user-dialog-title">
          <form onSubmit={editingUser ? handleUpdateAssignments : handleCreate}>
            <DialogHeader>
              <DialogTitle id="new-user-dialog-title">
                {editingUser ? "Asignar Centros de Costo" : "Nuevo Usuario"}
              </DialogTitle>
              <DialogDescription>
                {editingUser
                  ? `Selecciona los centros disponibles para ${editingUser.name ?? editingUser.email}.`
                  : "Crea las credenciales y define los permisos iniciales de la cuenta."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {!editingUser && <div className="space-y-1.5">
                <Label htmlFor="user-name">Nombre</Label>
                <Input id="user-name" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required minLength={2} />
              </div>}
              {!editingUser && <div className="space-y-1.5">
                <Label htmlFor="user-email">Email</Label>
                <Input id="user-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
              </div>}
              {!editingUser && <div className="space-y-1.5">
                <Label htmlFor="user-password">Contraseña temporal</Label>
                <div className="relative">
                  <Input
                    id="user-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute inset-y-0 right-0 px-3 text-[var(--muted-foreground)]"
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Mínimo 8 caracteres, con mayúscula, minúscula y número.
                </p>
              </div>}
              {!editingUser && <div className="space-y-1.5">
                <Label htmlFor="user-role">Rol</Label>
                <Select value={role} onValueChange={(value) => {
                  const nextRole = value as "ADMIN" | "USER";
                  setRole(nextRole);
                  if (nextRole === "ADMIN") setSelectedCostCenterIds([]);
                }}>
                  <SelectTrigger id="user-role" className="w-full">
                    <SelectValue>{(value) => value === "ADMIN" ? "Administrador" : "Usuario"}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">Usuario</SelectItem>
                    <SelectItem value="ADMIN">Administrador</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Los administradores pueden gestionar usuarios, centros de costo y todos los gastos.
                </p>
              </div>}

              {(editingUser || role === "USER") && (
                <fieldset className="space-y-2">
                  <legend className="text-sm font-medium">
                    Centros de Costo <span className="text-red-500">*</span>
                  </legend>
                  <div className="max-h-52 overflow-y-auto rounded-lg border border-[var(--border)] p-2 space-y-1">
                    {availableCostCenters.length === 0 ? (
                      <p className="text-sm text-[var(--muted-foreground)] p-2">
                        No hay Centros de Costo activos disponibles.
                      </p>
                    ) : availableCostCenters.map((costCenter) => (
                      <label
                        key={costCenter.id}
                        className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-[var(--accent)] cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCostCenterIds.includes(costCenter.id)}
                          onChange={() => toggleCostCenter(costCenter.id)}
                          className="size-4 accent-[var(--primary)]"
                        />
                        <span className="text-sm">{costCenter.name}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    El usuario solamente podrá registrar gastos en los centros seleccionados.
                  </p>
                </fieldset>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={loading}>
                Cancelar
              </Button>
              <Button id="save-user-btn" type="submit" disabled={loading}>
                {loading
                  ? "Guardando..."
                  : editingUser
                    ? "Guardar Asignaciones"
                    : "Crear Usuario"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
