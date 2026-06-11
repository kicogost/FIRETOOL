import Link from "next/link";
import { COACHING_LIST } from "@/content/coaching";
import { Nav } from "@/components/ui/Nav";
import { BottomNav } from "@/components/ui/BottomNav";
import { Disclaimer } from "@/components/coaching/Disclaimer";

export default function AprenderPage() {
  return (
    <main className="mx-auto max-w-md px-5 pb-24 pt-2">
      <Nav />
      <h1 className="mt-3 text-xl font-bold">Aprender a invertir</h1>
      <p className="text-sm text-ink/50">
        Módulos cortos, en lenguaje claro y pensados para España, para pasar de cero a invertir con
        cabeza.
      </p>

      <div className="mt-4 space-y-3">
        {COACHING_LIST.map((m) => (
          <Link
            key={m.slug}
            href={`/aprender/${m.slug}`}
            className="block rounded-2xl bg-surface p-4 shadow-neu-sm"
          >
            <p className="text-xs font-bold uppercase tracking-wide text-success">
              {m.readingMinutes} min
            </p>
            <h2 className="mt-1 font-bold">{m.title}</h2>
            <p className="mt-1 text-sm text-ink/60">{m.summary}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6">
        <Disclaimer />
      </div>
      <BottomNav />
    </main>
  );
}
