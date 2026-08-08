"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

type FormData = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      toast.error("Email o contraseña incorrectos");
      return;
    }

    // Fetch session to get role for redirect
    const sessionRes = await fetch(`${basePath}/api/auth/session`);
    const session = await sessionRes.json();
    const role = session?.user?.role;

    toast.success("¡Bienvenido!");
    window.location.href =
      role === "ADMIN" ? `${basePath}/admin` : `${basePath}/dashboard`;
  };

  return (
    <form
      id="login-form"
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
      noValidate
    >
      <div className="space-y-2">
        <Label htmlFor="email" className="text-white/80 text-sm font-medium">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="tu@empresa.com"
          className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-[var(--primary)] focus-visible:border-[var(--primary)]"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-white/80 text-sm font-medium">
          Contraseña
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-[var(--primary)] focus-visible:border-[var(--primary)] pr-10"
            {...register("password")}
          />
          <button
            type="button"
            id="toggle-password"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
        )}
      </div>

      <Button
        id="login-submit"
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white font-semibold h-11 mt-2"
      >
        {isSubmitting ? (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        ) : (
          <LogIn className="w-4 h-4 mr-2" />
        )}
        {isSubmitting ? "Ingresando..." : "Iniciar Sesión"}
      </Button>
    </form>
  );
}
