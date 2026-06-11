type Variant = "default" | "inset" | "accent";

const VARIANTS: Record<Variant, string> = {
  default: "bg-surface shadow-neu",
  inset: "bg-surface shadow-neu-inset",
  accent: "bg-surface shadow-neu",
};

const TITLE_COLOR: Record<Variant, string> = {
  default: "text-ink/45",
  inset: "text-ink/45",
  accent: "text-teal",
};

/**
 * Neumorphic tile — emerges from the single stone surface via paired shadows.
 * No borders or fills; depth is the shadow. Compose into a grid with `className`
 * spans (e.g. "col-span-2").
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
    <section className={`rounded-2xl p-5 ${VARIANTS[variant]} ${className}`}>
      {title && (
        <h2 className={`mb-3 text-xs font-bold uppercase tracking-wide ${TITLE_COLOR[variant]}`}>
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}
