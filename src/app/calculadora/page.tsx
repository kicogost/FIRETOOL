import type { Metadata } from "next";
import Link from "next/link";
import { Calculadora } from "@/components/calculadora/Calculadora";

export const metadata: Metadata = {
  title: "Calculadora FIRE España — ¿cuánto necesitas para ser libre?",
  description:
    "Calcula tu número FIRE y tu fecha de independencia financiera, pensada para España. Gratis, sin conectar tu banco.",
};

export default function CalculadoraPage() {
  return (
    <main className="mx-auto max-w-md px-5 py-10">
      <p className="text-xs font-bold uppercase tracking-wide text-teal">Calculadora FIRE · España</p>
      <h1 className="mt-1 text-3xl font-bold leading-tight">
        ¿Cuánto necesitas para ser libre?
      </h1>
      <p className="mt-2 text-sm text-ink/55">
        Tu número FIRE y tu fecha de libertad financiera en 20 segundos. Sin registro, sin conectar
        tu banco.
      </p>

      <div className="mt-6">
        <Calculadora />
      </div>

      <p className="mt-8 text-center text-xs text-ink/40">
        Esto es educación financiera, no asesoramiento.{" "}
        <Link href="/login" className="font-bold text-teal">
          Entrar
        </Link>
      </p>
    </main>
  );
}
