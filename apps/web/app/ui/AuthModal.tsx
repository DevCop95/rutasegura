"use client";

import React, { FormEvent } from "react";
import NewModal from "@/components/ui/NewModal";

type AuthModalProps = {
  authMode: "login" | "register" | "verify_email";
  setAuthMode: (mode: "login" | "register" | "verify_email" | null) => void;
  verificationEmail: string;
  activeRole: string;
  handleAuth: (event: FormEvent<HTMLFormElement>) => void;
  handleVerify: (event: FormEvent<HTMLFormElement>) => void;
  handleResendCode: () => void;
  roleLabel: (role: string) => string;
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
}: AuthModalProps) {
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
        <form className="space-y-4" onSubmit={handleVerify}>
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
          <button type="submit" className="w-full bg-primary text-on-primary py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-xl transition-all active:scale-[0.98]">
            Verificar Cuenta
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
        <form className="space-y-4" onSubmit={handleAuth}>
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
            <input name="password" type="password" required minLength={8} className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
            {authMode === "register" && (
              <p className="text-[11px] text-outline ml-1 leading-normal">
                Debe tener al menos 8 caracteres, incluir una mayúscula, una minúscula, un número y un carácter especial (ej. !@#$%).
              </p>
            )}
          </div>
          <button type="submit" className="w-full bg-primary text-on-primary py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-xl transition-all active:scale-[0.98]">
            {authMode === "login" ? "Entrar" : `Registrar como ${roleLabel(activeRole)}`}
          </button>
        </form>
      )}
    </NewModal>
  );
}
