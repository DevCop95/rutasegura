"use client";

import React, { FormEvent, useState } from "react";
import { Check, X } from "lucide-react";
import NewModal from "@/components/ui/NewModal";

const PASSWORD_RULES: { label: string; test: (v: string) => boolean }[] = [
  { label: "Al menos 8 caracteres", test: (v) => v.length >= 8 },
  { label: "Una letra mayúscula", test: (v) => /[A-Z]/.test(v) },
  { label: "Una letra minúscula", test: (v) => /[a-z]/.test(v) },
  { label: "Un número", test: (v) => /\d/.test(v) },
  { label: "Un carácter especial (!@#$%...)", test: (v) => /[!@#$%^&*(),.?":{}|<>]/.test(v) },
];

type AuthModalProps = {
  authMode: "login" | "register" | "verify_email";
  setAuthMode: (mode: "login" | "register" | "verify_email" | null) => void;
  verificationEmail: string;
  activeRole: string;
  handleAuth: (event: FormEvent<HTMLFormElement>) => void;
  handleVerify: (event: FormEvent<HTMLFormElement>) => void;
  handleResendCode: () => void;
  roleLabel: (role: string) => string;
  isSubmitting?: boolean;
};

export default function AuthModal({
  authMode,
  setAuthMode,
  verificationEmail,
  activeRole,
  handleAuth,
  handleVerify,
  handleResendCode,
  roleLabel,
  isSubmitting = false,
}: AuthModalProps) {
  const [password, setPassword] = useState("");
  const passwordRulesOk = PASSWORD_RULES.every((rule) => rule.test(password));

  return (
    <NewModal 
      title={
        authMode === "login" 
          ? "Acceder a RutaSegura" 
          : authMode === "register" 
            ? "Crear nueva cuenta" 
            : "Verificar tu cuenta"
      } 
      onClose={() => setAuthMode(null)}
    >
      {authMode === "verify_email" ? (
        <form key="verify-email-form" className="space-y-4" onSubmit={handleVerify}>
          <div className="text-sm text-on-surface/70 text-center">
            Hemos enviado un código de 6 dígitos a su correo electrónico: <br />
            <span className="font-bold text-primary">{verificationEmail}</span>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-bold text-on-surface/70 ml-1">Código de Verificación</label>
            <input 
              name="code" 
              type="text" 
              maxLength={6} 
              required 
              placeholder="123456" 
              className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-center tracking-[0.5em] text-lg font-bold" 
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-on-primary py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {isSubmitting ? "Verificando..." : "Verificar Cuenta"}
          </button>
          <div className="flex justify-between text-xs font-semibold px-1">
            <button type="button" onClick={handleResendCode} className="text-primary hover:underline bg-transparent border-0 cursor-pointer">
              Reenviar código
            </button>
            <button type="button" onClick={() => setAuthMode("register")} className="text-outline hover:underline bg-transparent border-0 cursor-pointer">
              Volver al registro
            </button>
          </div>
        </form>
      ) : (
        <form key="auth-form" className="space-y-4" onSubmit={handleAuth}>
          <div className="space-y-1">
            <label className="text-sm font-bold text-on-surface/70 ml-1">Email</label>
            <input name="email" type="email" required className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
          </div>
          {authMode === "register" && (
            <div className="space-y-1">
              <label className="text-sm font-bold text-on-surface/70 ml-1">Alias público</label>
              <input name="alias" required minLength={3} className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
            </div>
          )}
          <div className="space-y-1">
            <label className="text-sm font-bold text-on-surface/70 ml-1">Contraseña</label>
            <input
              name="password"
              type="password"
              required
              minLength={8}
              value={authMode === "register" ? password : undefined}
              onChange={authMode === "register" ? (e) => setPassword(e.target.value) : undefined}
              className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
            {authMode === "register" && (
              <ul className="mt-1.5 space-y-0.5">
                {PASSWORD_RULES.map((rule) => {
                  const ok = rule.test(password);
                  return (
                    <li
                      key={rule.label}
                      className={`flex items-center gap-1.5 text-[11px] ${ok ? "text-secondary" : "text-outline"}`}
                    >
                      {ok ? <Check size={12} className="shrink-0" /> : <X size={12} className="shrink-0" />}
                      {rule.label}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          <button
            type="submit"
            disabled={isSubmitting || (authMode === "register" && !passwordRulesOk)}
            className="w-full bg-primary text-on-primary py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {isSubmitting ? "Procesando..." : authMode === "login" ? "Entrar" : `Registrar como ${roleLabel(activeRole)}`}
          </button>
        </form>
      )}
    </NewModal>
  );
}
