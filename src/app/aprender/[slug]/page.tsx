import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { COACHING_MODULES, COACHING_LIST } from "@/content/coaching";
import type { CoachingSlug } from "@/lib/coaching";
import { Disclaimer } from "@/components/coaching/Disclaimer";
import { Nav } from "@/components/ui/Nav";
import { BottomNav } from "@/components/ui/BottomNav";

export function generateStaticParams() {
  return COACHING_LIST.map((m) => ({ slug: m.slug }));
}

export default async function AprenderModulePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const module = COACHING_MODULES[slug as CoachingSlug];
  if (!module) notFound();

  return (
    <main className="mx-auto max-w-md px-5 pb-28 pt-2">
      <Nav />
      <Link href="/aprender" className="mt-2 inline-block text-sm font-bold text-ink/55">
        ← Todos los módulos
      </Link>

      <p className="mt-4 text-xs font-bold uppercase tracking-wide text-teal">
        {module.readingMinutes} min de lectura
      </p>

      <article className="prose prose-sm mt-2 max-w-none prose-headings:text-ink prose-headings:font-bold prose-h2:text-lg prose-p:text-ink/80 prose-li:text-ink/80 prose-strong:text-ink prose-a:text-teal prose-table:text-ink/80">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{module.body}</ReactMarkdown>
      </article>

      <Link href={module.action.href} className="neu-btn-primary mt-6 block text-center">
        {module.action.label}
      </Link>

      <div className="mt-4">
        <Disclaimer />
      </div>
      <BottomNav />
    </main>
  );
}
