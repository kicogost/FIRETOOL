import Link from "next/link";
import { COACHING_MODULES } from "@/content/coaching";
import type { DashboardData } from "@/db/queries";

/** Contextual coaching suggestion (PRD §8/§10) — one module, chosen by triggers. */
export function CoachingCard({ data }: { data: DashboardData }) {
  const module = COACHING_MODULES[data.coachingSlug];

  return (
    <Link
      href={`/aprender/${module.slug}`}
      className="col-span-2 block rounded-2xl bg-surface p-5 shadow-neu transition active:shadow-neu-inset"
    >
      <p className="text-xs font-bold uppercase tracking-wide text-teal">
        Aprende · {module.readingMinutes} min
      </p>
      <h2 className="mt-1 text-lg font-bold text-ink">{module.title}</h2>
      <p className="mt-1 text-sm text-ink/55">{module.summary}</p>
      <span className="mt-3 inline-block text-sm font-bold text-teal">Leer →</span>
    </Link>
  );
}
