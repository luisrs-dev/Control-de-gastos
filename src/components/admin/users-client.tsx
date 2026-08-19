"use client";

import { FormEvent, useState } from "react";
import { Eye, EyeOff, Plus, Power, Users } from "lucide-react";
import { toast } from "sonner";
import { createUser, toggleUserStatus } from "@/actions/admin.actions";
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
};

export function UsersClient({
  initialUsers,
  currentUserId,
}: {
  initialUsers: UserRow[];
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

  const openCreate = () => {
    setName("");
    setEmail("");
    setPassword("");
    setRole("USER");
    setShowPassword(false);
    setDialogOpen(true);
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const result = await createUser({ name, email, password, role });
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
                  <td className="px-5 py-4 text-center">
                    <Badge variant={user.status === "ACTIVE" ? "default" : "destructive"}>
                      {user.status === "ACTIVE" ? "Activo" : "Inactivo"}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-[var(--muted-foreground)] text-xs hidden lg:table-cell">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-5 py-4 text-center">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent aria-labelledby="new-user-dialog-title">
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle id="new-user-dialog-title">Nuevo Usuario</DialogTitle>
              <DialogDescription>
                Crea las credenciales y define los permisos iniciales de la cuenta.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="user-name">Nombre</Label>
                <Input id="user-name" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required minLength={2} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="user-email">Email</Label>
                <Input id="user-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
              </div>
              <div className="space-y-1.5">
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
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="user-role">Rol</Label>
                <Select value={role} onValueChange={(value) => setRole(value as "ADMIN" | "USER")}>
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
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={loading}>
                Cancelar
              </Button>
              <Button id="save-user-btn" type="submit" disabled={loading}>
                {loading ? "Creando..." : "Crear Usuario"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
