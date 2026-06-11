import Link from "next/link";
import { COACHING_MODULES } from "@/content/coaching";
import type { DashboardData } from "@/db/queries";

/** Contextual coaching suggestion (PRD §8/§10) — one module, chosen by triggers. */
export function CoachingCard({ data }: { data: DashboardData }) {
  const module = COACHING_MODULES[data.coachingSlug];

  return (
    <Link
      href={`/coaching/${module.slug}`}
      className="block rounded-2xl border border-emerald-200 bg-emerald-50 p-5"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
        Aprende · {module.readingMinutes} min
      </p>
      <h2 className="mt-1 font-bold text-emerald-900">{module.title}</h2>
      <p className="mt-1 text-sm text-emerald-800">{module.summary}</p>
      <span className="mt-3 inline-block text-sm font-semibold text-emerald-700">
        Leer →
      </span>
    </Link>
  );
}
