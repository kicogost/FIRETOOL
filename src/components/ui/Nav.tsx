import { isAuthEnabled } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";

/**
 * Top bar: brand + sign-out. Primary navigation lives in the bottom nav
 * (3 pillars). `active` is accepted for backwards-compat but unused.
 */
export function Nav({ active }: { active?: string }) {
  void active;
  return (
    <header className="flex items-center justify-between py-2">
      <span className="text-base font-bold tracking-tight">FIRE Tracker</span>
      {isAuthEnabled() && (
        <form action={signOut}>
          <button type="submit" className="text-xs font-bold text-ink/40">
            Salir
          </button>
        </form>
      )}
    </header>
  );
}
