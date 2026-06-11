"use client";

import { useState } from "react";
import { eur, pct } from "@/lib/format";

interface Props {
  progress: number;
  fireNumber: number;
  invested: number;
  netWorth: number;
  fireDateLabel: string | null;
}

const CALC_URL = "https://firetool-ten.vercel.app/calculadora";

export function ShareProgress({ progress, fireNumber, invested, netWorth, fireDateLabel }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  async function share() {
    const text = `Voy por el ${pct(progress)} de mi número FIRE (${eur(fireNumber)}). Calcula el tuyo, España-first y sin conectar el banco:`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "Mi progreso FIRE", text, url: CALC_URL });
        return;
      } catch {
        /* user cancelled — fall through to copy */
      }
    }
    try {
      await navigator.clipboard.writeText(`${text} ${CALC_URL}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* ignore */
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="col-span-2 rounded-2xl bg-surface py-3 text-sm font-bold text-teal shadow-neu-sm active:shadow-neu-inset"
      >
        📤 Compartir mi progreso
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
          onClick={() => setOpen(false)}
        >
          <div className="w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            {/* Screenshot-ready card */}
            <div className="rounded-3xl bg-surface p-7 text-center shadow-neu">
              <p className="text-xs font-bold uppercase tracking-wide text-teal">Mi camino FIRE</p>
              <p className="mt-3 text-6xl font-bold tabular-nums text-ink">{pct(progress)}</p>
              <p className="text-sm text-ink/50">de {eur(fireNumber)}</p>

              <div className="mx-auto mt-4 h-3 w-full overflow-hidden rounded-full bg-surface shadow-neu-inset">
                <div
                  className="h-full rounded-full bg-teal"
                  style={{ width: `${Math.min(100, progress * 100)}%` }}
                />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 text-left">
                <div className="rounded-xl bg-surface p-3 shadow-neu-inset">
                  <p className="text-[10px] uppercase text-ink/45">Invertido</p>
                  <p className="font-bold tabular-nums">{eur(invested)}</p>
                </div>
                <div className="rounded-xl bg-surface p-3 shadow-neu-inset">
                  <p className="text-[10px] uppercase text-ink/45">Patrimonio</p>
                  <p className="font-bold tabular-nums">{eur(netWorth)}</p>
                </div>
              </div>

              {fireDateLabel && (
                <p className="mt-4 text-sm text-ink/60">
                  Libertad estimada: <strong className="text-ink">{fireDateLabel}</strong>
                </p>
              )}
              <p className="mt-4 text-xs font-bold text-ink/40">FIRE Tracker · España-first</p>
            </div>

            <button onClick={share} className="neu-btn-primary mt-4 w-full">
              {copied ? "✓ Copiado al portapapeles" : "Compartir"}
            </button>
            <p className="mt-2 text-center text-xs text-white/80">
              Haz captura de la tarjeta para compartirla 📸
            </p>
            <button onClick={() => setOpen(false)} className="mt-1 w-full py-2 text-xs text-white/70">
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
