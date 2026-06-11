type Variant = "default" | "peach" | "steel" | "dark";

const VARIANTS: Record<Variant, string> = {
  default: "bg-white border border-cream-deep text-ink",
  peach: "bg-peach text-ink",
  steel: "bg-steel text-white",
  dark: "bg-ink text-white",
};

const TITLE_COLOR: Record<Variant, string> = {
  default: "text-ink/50",
  peach: "text-ink/60",
  steel: "text-white/80",
  dark: "text-white/70",
};

/**
 * Bento tile — a self-contained block. Compose into a grid with `className`
 * spans (e.g. "col-span-2"). Variants tint the surface for visual rhythm.
 */
export function Card({
  title,
  children,
  className = "",
  variant = "default",
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
  variant?: Variant;
}) {
  return (
    <section className={`rounded-tile p-5 shadow-tile-sm ${VARIANTS[variant]} ${className}`}>
      {title && (
        <h2 className={`mb-3 text-xs font-semibold uppercase tracking-wide ${TITLE_COLOR[variant]}`}>
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}
