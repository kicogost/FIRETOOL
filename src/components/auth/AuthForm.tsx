"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { useActionState } from "react";
import { signIn, signUp, type AuthState } from "@/app/auth/actions";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-success py-3 font-semibold text-white disabled:opacity-50"
    >
      {pending ? "Un momento…" : label}
    </button>
  );
}

export function AuthForm() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const action = mode === "signin" ? signIn : signUp;
  const [state, formAction] = useActionState<AuthState, FormData>(action, {});

  return (
    <div className="mx-auto w-full max-w-sm rounded-tile border border-cream-deep bg-white p-7 shadow-tile">
      <h1 className="text-2xl font-bold">
        {mode === "signin" ? "Entra en FIRE Tracker" : "Crea tu cuenta"}
      </h1>
      <p className="mt-1 text-sm text-ink/50">
        {mode === "signin"
          ? "Tu camino hacia la independencia financiera."
          : "Empieza a planificar tu libertad financiera."}
      </p>

      <form action={formAction} className="mt-6 space-y-4">
        <label className="block">
          <span className="text-sm text-ink/60">Correo electrónico</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            className="mt-1 w-full rounded-xl border border-cream-deep px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="text-sm text-ink/60">Contraseña</span>
          <input
            name="password"
            type="password"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            required
            minLength={6}
            className="mt-1 w-full rounded-xl border border-cream-deep px-3 py-2"
          />
        </label>

        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        {state.message && <p className="text-sm text-success">{state.message}</p>}

        <SubmitButton label={mode === "signin" ? "Entrar" : "Crear cuenta"} />
      </form>

      <button
        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        className="mt-4 w-full text-sm text-ink/50"
      >
        {mode === "signin"
          ? "¿No tienes cuenta? Crea una"
          : "¿Ya tienes cuenta? Entra"}
      </button>
    </div>
  );
}
