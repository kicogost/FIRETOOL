/** Shared Spanish (es-ES) / EUR formatters for all user-facing numbers. */

const eurFmt = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});
const eurFmt2 = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
});
const pctFmt = new Intl.NumberFormat("es-ES", {
  style: "percent",
  maximumFractionDigits: 1,
});
const dateLong = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "long",
  year: "numeric",
});
const monthShort = new Intl.DateTimeFormat("es-ES", { month: "short", year: "2-digit" });

export const eur = (n: number) => eurFmt.format(n);
export const eur2 = (n: number) => eurFmt2.format(n);
export const pct = (n: number) => pctFmt.format(n);
export const formatDate = (d: Date) => dateLong.format(d);

/** "2026-03" -> "mar 26" for chart axes. */
export const formatMonth = (ym: string) => {
  const [y, m] = ym.split("-").map(Number);
  return monthShort.format(new Date(Date.UTC(y, m - 1, 1)));
};

/** Human phrase for a projected FIRE result. */
export function fireDatePhrase(
  result: { onTrack: boolean; date: Date | null; monthsToFire: number | null },
): string {
  if (!result.onTrack || !result.date) return "Aún no vas por buen camino";
  const months = result.monthsToFire ?? 0;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? "año" : "años"}`);
  if (rem > 0) parts.push(`${rem} ${rem === 1 ? "mes" : "meses"}`);
  return parts.length ? `dentro de ${parts.join(" y ")}` : "¡ya has llegado!";
}
