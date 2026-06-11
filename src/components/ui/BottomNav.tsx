"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Pillar = "patrimonio" | "gastos" | "aprender";

const ITEMS: { key: Pillar; href: string; label: string; icon: React.ReactNode }[] = [
  {
    key: "patrimonio",
    href: "/",
    label: "Patrimonio",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
        <path d="M4 19V10m5 9V5m5 14v-6m5 6V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: "gastos",
    href: "/gastos",
    label: "Gastos",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
        <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M9 8h6M9 12h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: "aprender",
    href: "/aprender",
    label: "Aprender",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
        <path d="M4 5a2 2 0 012-2h12v16H6a2 2 0 00-2 2V5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M18 17H6a2 2 0 00-2 2" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
];

function activePillar(pathname: string): Pillar {
  if (pathname.startsWith("/gastos")) return "gastos";
  if (pathname.startsWith("/aprender") || pathname.startsWith("/coaching")) return "aprender";
  return "patrimonio"; // "/", "/accounts", etc.
}

/** Mobile-first 3-pillar bottom navigation (neumorphic). */
export function BottomNav() {
  const pathname = usePathname();
  const active = activePillar(pathname);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-black/5 bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-md items-stretch justify-around px-4 py-2">
        {ITEMS.map((it) => {
          const on = active === it.key;
          return (
            <Link
              key={it.key}
              href={it.href}
              aria-current={on ? "page" : undefined}
              className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-[11px] font-bold transition ${
                on ? "text-teal" : "text-ink/40"
              }`}
            >
              <span className={on ? "rounded-xl bg-surface px-3 py-1 shadow-neu-inset" : "px-3 py-1"}>
                {it.icon}
              </span>
              {it.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
