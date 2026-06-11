import Link from "next/link";
import { COACHING_LIST } from "@/content/coaching";
import { Nav } from "@/components/ui/Nav";
import { Disclaimer } from "@/components/coaching/Disclaimer";

export default function CoachingPage() {
  return (
    <main className="mx-auto max-w-md px-5 pb-16 pt-2">
      <Nav active="dashboard" />
      <h1 className="mt-3 text-xl font-bold">Aprende a invertir</h1>
      <p className="text-sm text-gray-500">
        Módulos cortos en lenguaje claro para pasar de cero a invertir con cabeza.
      </p>

      <div className="mt-4 space-y-3">
        {COACHING_LIST.map((m) => (
          <Link
            key={m.slug}
            href={`/coaching/${m.slug}`}
            className="block rounded-2xl border border-gray-200 p-4"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              {m.readingMinutes} min
            </p>
            <h2 className="mt-1 font-bold">{m.title}</h2>
            <p className="mt-1 text-sm text-gray-600">{m.summary}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6">
        <Disclaimer />
      </div>
    </main>
  );
}
