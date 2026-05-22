import { cookies } from "next/headers";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * Checks if the user has a valid Supabase session via the `sb_access_token` cookie.
 * @returns boolean `true` if logged in, `false` otherwise
 */
export async function checkIsAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("sb_access_token");

    if (!token?.value) {
      return false;
    }

    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase.auth.getUser(token.value);

    if (error || !data?.user) {
      return false;
    }

    // Optionally check if the user's email is specifically the admin email if needed.
    // Right now, any valid logged-in user is considered an admin per the current logic.

    return true;
  } catch (err) {
    console.error("[checkIsAdmin] Error verifying auth state:", err);
    return false;
  }
}
