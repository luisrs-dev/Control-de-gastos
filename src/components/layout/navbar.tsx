"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Menu,
  X,
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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

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

interface NavbarProps {
  role: string;
  userName: string;
  userEmail: string;
  pageTitle?: string;
}

export function Navbar({ role, userName, userEmail, pageTitle }: NavbarProps) {
  const pathname = usePathname();
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const [open, setOpen] = useState(false);
  const isAdmin = role === "ADMIN";
  const navItems = isAdmin ? adminNavItems : userNavItems;

  return (
    <header
      id="navbar"
      className="sticky top-0 z-20 h-14 bg-white/80 backdrop-blur-md border-b border-[var(--border)] flex items-center px-4 gap-4"
    >
      {/* Mobile menu trigger */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          id="mobile-menu-btn"
          className="md:hidden p-2 rounded-lg hover:bg-[var(--accent)] transition-colors"
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0 bg-[var(--sidebar-background)]">
          {/* Mobile Sidebar */}
          <div className="flex flex-col h-full">
            <div className="px-6 py-6 border-b border-[var(--sidebar-border)]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[var(--primary)] flex items-center justify-center">
                  <BarChart2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">ControlGastos</p>
                  <p className="text-white/40 text-xs">{isAdmin ? "Admin" : "Usuario"}</p>
                </div>
              </div>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium",
                      isActive
                        ? "bg-[var(--primary)] text-white"
                        : "text-white/60 hover:text-white hover:bg-white/10"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                    {isActive && <ChevronRight className="w-3 h-3 ml-auto opacity-60" />}
                  </Link>
                );
              })}
            </nav>

            <div className="px-3 pb-6 pt-4 border-t border-[var(--sidebar-border)]">
              <p className="text-white/40 text-xs px-3 mb-2 truncate">{userEmail}</p>
              <button
                onClick={() => signOut({ callbackUrl: `${basePath}/login` })}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-all"
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Page title */}
      {pageTitle && (
        <h1 className="text-sm font-semibold text-[var(--foreground)] truncate">{pageTitle}</h1>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* User badge */}
      <div className="hidden sm:flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-[var(--primary)]/15 flex items-center justify-center">
          <span className="text-[var(--primary)] text-xs font-bold">
            {(userName || userEmail).charAt(0).toUpperCase()}
          </span>
        </div>
        <span className="text-xs font-medium text-[var(--muted-foreground)]">
          {userName || userEmail}
        </span>
      </div>
    </header>
  );
}
