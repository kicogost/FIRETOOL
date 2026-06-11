import Link from "next/link";

export function Nav({ active }: { active: "dashboard" | "accounts" }) {
  const item = (href: string, label: string, key: string) => (
    <Link
      href={href}
      className={`text-sm font-medium ${
        active === key ? "text-emerald-700" : "text-gray-400"
      }`}
    >
      {label}
    </Link>
  );
  return (
    <header className="flex items-center justify-between py-2">
      <span className="text-base font-bold">FIRE Tracker</span>
      <nav className="flex gap-4">
        {item("/", "Inicio", "dashboard")}
        {item("/accounts", "Cuentas", "accounts")}
      </nav>
    </header>
  );
}
