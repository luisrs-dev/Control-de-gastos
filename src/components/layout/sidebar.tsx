"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Receipt,
  PlusCircle,
  BarChart2,
  Users,
  Building2,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const userNavItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Nuevo Gasto", href: "/gastos/nuevo", icon: PlusCircle },
  { label: "Mis Gastos", href: "/gastos", icon: Receipt },
];

const adminNavItems: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: BarChart2 },
  { label: "Nuevo Gasto", href: "/gastos/nuevo", icon: PlusCircle },
  { label: "Todos los Gastos", href: "/admin/gastos", icon: Receipt },
  { label: "Centros de Costo", href: "/admin/centros-costo", icon: Building2 },
  { label: "Usuarios", href: "/admin/usuarios", icon: Users },
];

interface SidebarProps {
  role: string;
  userName: string;
  userEmail: string;
}

export function Sidebar({ role, userName, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const isAdmin = role === "ADMIN";
  const navItems = isAdmin ? adminNavItems : userNavItems;

  return (
    <aside
      id="sidebar"
      className="hidden md:flex flex-col bg-[var(--sidebar-background)] h-full min-h-dvh w-[260px] fixed top-0 left-0 border-r border-[var(--sidebar-border)] z-30"
      aria-label="Navegación principal"
    >
      {/* Brand */}
      <div className="px-6 py-6 border-b border-[var(--sidebar-border)]">
        <Link
          href={isAdmin ? "/admin" : "/dashboard"}
          className="flex items-center gap-3 group"
        >
          <div className="w-9 h-9 rounded-xl bg-[var(--primary)] flex items-center justify-center shadow flex-shrink-0 group-hover:scale-105 transition-transform">
            <BarChart2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">ControlGastos</p>
            <p className="text-[var(--sidebar-foreground)]/50 text-xs">
              {isAdmin ? "Administración" : "Portal Usuario"}
            </p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Menú principal">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" &&
              item.href !== "/dashboard" &&
              pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                isActive
                  ? "bg-[var(--primary)] text-white shadow-md"
                  : "text-[var(--sidebar-foreground)]/70 hover:text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)]"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="w-3 h-3 opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* User area */}
      <div className="px-3 pb-4 border-t border-[var(--sidebar-border)] pt-4">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-[var(--primary)]/20 flex items-center justify-center flex-shrink-0">
            <span className="text-[var(--primary)] text-xs font-bold">
              {(userName || userEmail).charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="overflow-hidden">
            <p className="text-white text-xs font-semibold truncate">{userName || "Usuario"}</p>
            <p className="text-[var(--sidebar-foreground)]/40 text-xs truncate">{userEmail}</p>
          </div>
        </div>
        <button
          id="logout-btn"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[var(--sidebar-foreground)]/60 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
