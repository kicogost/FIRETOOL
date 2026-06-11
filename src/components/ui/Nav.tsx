import Link from "next/link";
import { isAuthEnabled } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";

/**
 * Top bar: brand + settings + sign-out. Primary navigation lives in the bottom
 * nav (3 pillars). `active` is accepted for backwards-compat but unused.
 */
export function Nav({ active }: { active?: string }) {
  void active;
  return (
    <header className="flex items-center justify-between py-2">
      <span className="text-base font-bold tracking-tight">FIRE Tracker</span>
      <div className="flex items-center gap-4">
        <Link href="/ajustes" className="text-xs font-bold text-ink/60" aria-label="Ajustes">
          Ajustes
        </Link>
        {isAuthEnabled() && (
          <form action={signOut}>
            <button type="submit" className="text-xs font-bold text-ink/60">
              Salir
            </button>
          </form>
        )}
      </div>
    </header>
  );
}
