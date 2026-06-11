import Link from "next/link";
import { COACHING_MODULES } from "@/content/coaching";
import type { DashboardData } from "@/db/queries";

/** Contextual coaching suggestion (PRD §8/§10) — one module, chosen by triggers. */
export function CoachingCard({ data }: { data: DashboardData }) {
  const module = COACHING_MODULES[data.coachingSlug];

  return (
    <Link
      href={`/coaching/${module.slug}`}
      className="col-span-2 block rounded-tile bg-steel p-5 text-white shadow-tile-sm transition hover:bg-steel-deep"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-white/80">
        Aprende · {module.readingMinutes} min
      </p>
      <h2 className="mt-1 text-lg font-bold">{module.title}</h2>
      <p className="mt-1 text-sm text-white/85">{module.summary}</p>
      <span className="mt-3 inline-block text-sm font-semibold">Leer →</span>
    </Link>
  );
}
