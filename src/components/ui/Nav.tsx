import Link from "next/link";
import { isAuthEnabled } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";

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
      <nav className="flex items-center gap-4">
        {item("/", "Inicio", "dashboard")}
        {item("/accounts", "Cuentas", "accounts")}
        {item("/coaching", "Aprende", "coaching")}
        {isAuthEnabled() && (
          <form action={signOut}>
            <button type="submit" className="text-sm font-medium text-gray-400">
              Salir
            </button>
          </form>
        )}
      </nav>
    </header>
  );
}
