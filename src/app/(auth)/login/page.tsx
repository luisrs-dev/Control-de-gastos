import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Iniciar Sesión",
};

export default function LoginPage() {
  return (
    <main className="min-h-dvh flex items-center justify-center relative overflow-hidden bg-[var(--sidebar-background)]">
      {/* Background blobs */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
      >
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[var(--chart-1)] opacity-20 blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-80 h-80 rounded-full bg-[var(--chart-2)] opacity-15 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 w-72 h-72 rounded-full bg-[var(--chart-4)] opacity-10 blur-3xl" />
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm mx-4">
        <div className="glass rounded-2xl p-8 shadow-2xl">
          {/* Logo / Brand */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-[var(--primary)] flex items-center justify-center mb-4 shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-7 h-7 text-white"
                aria-hidden="true"
              >
                <path d="M2 17 L12 11 L22 17" />
                <path d="M2 12 L12 6 L22 12" />
                <path d="M2 22 L12 16 L22 22" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">ControlGastos</h1>
            <p className="text-sm text-white/60 mt-1">Gestión de Gastos</p>
          </div>

          <LoginForm />
        </div>
      </div>
    </main>
  );
}
