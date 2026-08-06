import type { Metadata } from "next";
import { getUsers, toggleUserStatus, createUser } from "@/actions/admin.actions";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Usuarios" };

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Usuarios</h1>
        <p className="text-[var(--muted-foreground)] text-sm mt-1">
          {users.length} {users.length === 1 ? "usuario registrado" : "usuarios registrados"}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-[var(--muted)] border-b border-[var(--border)]">
            <tr>
              <th className="text-left px-5 py-3 font-semibold text-[var(--muted-foreground)]">Usuario</th>
              <th className="text-left px-5 py-3 font-semibold text-[var(--muted-foreground)] hidden md:table-cell">Email</th>
              <th className="text-center px-5 py-3 font-semibold text-[var(--muted-foreground)]">Rol</th>
              <th className="text-center px-5 py-3 font-semibold text-[var(--muted-foreground)]">Estado</th>
              <th className="text-left px-5 py-3 font-semibold text-[var(--muted-foreground)] hidden lg:table-cell">Creado</th>
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
                <td className="px-5 py-4 text-[var(--muted-foreground)] hidden md:table-cell">
                  {user.email}
                </td>
                <td className="px-5 py-4 text-center">
                  <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                    {user.role === "ADMIN" ? "Admin" : "Usuario"}
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
