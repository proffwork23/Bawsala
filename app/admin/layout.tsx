import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sb_access_token");

  if (!token?.value) {
    redirect("/login");
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.auth.getUser(token.value);

  if (error || !data?.user) {
    redirect("/login");
  }

  return (
    <div className="flex-1">
      {children}
    </div>
  );
}

