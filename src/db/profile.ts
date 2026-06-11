import { cache } from "react";
import { createClient, isAuthEnabled } from "@/lib/supabase/server";
import { SINGLE_PROFILE_ID } from "./constants";

/**
 * The profile id for the current request.
 *  - Auth enabled  → the authenticated Supabase user's id (multi-user).
 *  - Auth disabled → the single fixed profile (local/dev/tests, unchanged).
 *
 * Wrapped in React `cache` so repeated calls within one request hit Supabase
 * `getUser()` only once.
 */
export const currentProfileId = cache(async (): Promise<string> => {
  if (!isAuthEnabled()) return SINGLE_PROFILE_ID;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");
  return user.id;
});
