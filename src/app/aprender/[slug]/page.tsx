import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { COACHING_MODULES, COACHING_LIST } from "@/content/coaching";
import type { CoachingSlug } from "@/lib/coaching";
import { Disclaimer } from "@/components/coaching/Disclaimer";
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
    <main className="mx-auto max-w-md px-5 pb-24 pt-4">
      <Link href="/aprender" className="text-sm font-bold text-ink/40">
        ← Todos los módulos
      </Link>

      <p className="mt-4 text-xs font-bold uppercase tracking-wide text-success">
        {module.readingMinutes} min de lectura
      </p>

      <article className="prose prose-sm mt-2 max-w-none prose-headings:font-bold prose-h2:text-lg prose-a:text-teal">
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
