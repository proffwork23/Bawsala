"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function loginAction(prevState: any, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "يرجى إدخال البريد الإلكتروني وكلمة المرور." };
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session) {
    return { error: error?.message || "فشل تسجيل الدخول. تأكد من صحة البيانات." };
  }

  const cookieStore = await cookies();
  
  // Set httpOnly token cookie
  cookieStore.set("sb_access_token", data.session.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
    sameSite: "lax",
  });

  redirect("/admin");
}
