"use client";

import { useEffect } from "react";
import type { CelebrationPayload } from "@/app/actions/transactions";

/**
 * Celebration moment (PRD §9): confetti + a concrete stat that makes progress
 * tangible. Intensity follows the reward-style setting (loud = confetti,
 * quiet = subtle toast). Never punishes — only shown for positive movement.
 */
export function Celebration({
  payload,
  onClose,
}: {
  payload: CelebrationPayload;
  onClose: () => void;
}) {
  const loud = payload.rewardStyle === "loud";
  const daysEarlier = payload.fireDateDaysEarlier ?? 0;
  const hasStat = daysEarlier > 0;

  useEffect(() => {
    if (!loud) return;
    let cancelled = false;
    import("canvas-confetti").then(({ default: confetti }) => {
      if (cancelled) return;
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
    });
    return () => {
      cancelled = true;
    };
  }, [loud]);

  // Quiet style: a subtle auto-dismissing toast at the top.
  useEffect(() => {
    if (loud) return;
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [loud, onClose]);

  if (!loud) {
    return (
      <div className="fixed inset-x-0 top-4 z-[60] flex justify-center px-4">
        <div className="max-w-sm rounded-xl bg-ink px-4 py-3 text-sm text-white shadow-lg">
          {hasStat
            ? `Tu fecha FIRE se adelanta ${daysEarlier} días. 👏`
            : payload.becameOnTrack
              ? "¡Ya vas por buen camino hacia FIRE! 🚀"
              : payload.newMilestones[0]?.title
                ? `¡Nuevo logro: ${payload.newMilestones[0].title}!`
                : "Movimiento guardado."}
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-white p-7 text-center shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-5xl">🎉</div>
        {hasStat ? (
          <>
            <h2 className="mt-3 text-xl font-bold">¡Un paso más cerca!</h2>
            <p className="mt-1 text-ink/60">
              Esta aportación adelanta tu fecha FIRE{" "}
              <strong className="text-success">{daysEarlier} días</strong>.
            </p>
          </>
        ) : payload.becameOnTrack ? (
          <>
            <h2 className="mt-3 text-xl font-bold">¡Ya vas por buen camino! 🚀</h2>
            <p className="mt-1 text-ink/60">
              Con esta aportación, ya tienes una fecha FIRE proyectada.
            </p>
          </>
        ) : (
          <h2 className="mt-3 text-xl font-bold">¡Movimiento guardado!</h2>
        )}

        {payload.newMilestones.length > 0 && (
          <div className="mt-4 space-y-2">
            {payload.newMilestones.map((m) => (
              <div key={m.key} className="rounded-xl bg-peach/50 px-3 py-2 text-left">
                <p className="text-sm font-semibold text-ink">🏅 {m.title}</p>
                <p className="text-xs text-success">{m.description}</p>
              </div>
            ))}
          </div>
        )}

        {payload.streak.current > 0 && (
          <p className="mt-4 text-sm text-ink/50">
            Racha actual: <strong>{payload.streak.current}</strong>{" "}
            {payload.streak.current === 1 ? "mes" : "meses"} 🔥
          </p>
        )}

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-success py-3 font-semibold text-white"
        >
          ¡Seguir así!
        </button>
      </div>
    </div>
  );
}
