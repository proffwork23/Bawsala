import { createServerSupabaseClient } from "@/lib/supabase/server";

export type SiteSettings = {
  name: string;
  bio: string;
  avatar_url: string;
};

const defaultSettings: SiteSettings = {
  name: "بوصلة",
  bio: "مساعد التخطيط التعليمي الذكي للمعلمين لتصميم خطط دراسية متكاملة.",
  avatar_url: "",
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("posts")
    .select("title, content, cover_image")
    .eq("slug", "__site_settings__")
    .maybeSingle();

  if (error || !data) {
    return defaultSettings;
  }

  return {
    name: data.title || defaultSettings.name,
    bio: data.content || defaultSettings.bio,
    avatar_url: data.cover_image || defaultSettings.avatar_url,
  };
}
