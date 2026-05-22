import sanitizeHtml from "sanitize-html";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/config";

export type PostCategory = "literature" | "tech" | "science" | "art";

export type Post = {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: PostCategory;
  cover_image: string | null;
  created_at: string;
};

const categoryLabelMap: Record<PostCategory, string> = {
  literature: "الأدب",
  tech: "التقنية",
  science: "العِلم",
  art: "الفن",
};

const categoryGlowMap: Record<PostCategory, "var(--glow-adab)" | "var(--glow-tech)" | "var(--glow-ilm)" | "var(--glow-art)"> =
  {
    literature: "var(--glow-adab)",
    tech: "var(--glow-tech)",
    science: "var(--glow-ilm)",
    art: "var(--glow-art)",
  };

export async function getLatestPosts(limit = 6): Promise<Post[]> {
  if (!hasSupabaseEnv()) return [];
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("posts")
    .select("id,title,slug,content,category,cover_image,created_at")
    .neq("slug", "__site_settings__")
    .order("position", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return [];
  }
  return (data ?? []) as Post[];
}

export async function getPostsByCategory(category: PostCategory, limit = 24): Promise<Post[]> {
  if (!hasSupabaseEnv()) return [];
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("posts")
    .select("id,title,slug,content,category,cover_image,created_at")
    .eq("category", category)
    .neq("slug", "__site_settings__")
    .order("position", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return [];
  }
  return (data ?? []) as Post[];
}

export async function getLatestPostInCategory(category: PostCategory): Promise<Post | null> {
  const posts = await getPostsByCategory(category, 1);
  return posts.length > 0 ? posts[0] : null;
}


export async function getPostBySlug(
  category: PostCategory,
  slug: string,
): Promise<Post | null> {
  if (!hasSupabaseEnv()) return null;
  const decodedSlug = decodeURIComponent(slug);
  console.log(`[getPostBySlug] CATEGORY: ${category} | RAW SLUG: ${slug} | DECODED SLUG: ${decodedSlug}`);

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("posts")
    .select("id,title,slug,content,category,cover_image,created_at")
    .eq("category", category)
    .eq("slug", decodedSlug)
    .maybeSingle();

  if (error) {
    console.error(`[getPostBySlug] Supabase Error:`, error);
    return null;
  }
  
  if (!data) {
    console.log(`[getPostBySlug] No post found for slug: ${decodedSlug}`);
    return null;
  }

  return data as Post;
}

export function toSnippetCard(post: Post) {
  return {
    id: post.id,
    category: categoryLabelMap[post.category],
    title: post.title,
    excerpt: htmlToExcerpt(post.content),
    img:
      post.cover_image ||
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
    glow: categoryGlowMap[post.category],
    href: post.category === "art" ? "/art" : `/${post.category}/${encodeURIComponent(post.slug)}`,
  };
}

export function sanitizeTipTapHtml(html: string) {
  return sanitizeHtml(html, {
    allowedTags: [
      "p",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "ul",
      "ol",
      "li",
      "strong",
      "em",
      "s",
      "blockquote",
      "code",
      "pre",
      "a",
      "img",
      "br",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "title"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        rel: "noopener noreferrer",
        target: "_blank",
      }),
    },
  });
}

function htmlToExcerpt(html: string, maxLength = 120) {
  const plain = sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/g, " ")
    .trim();

  if (plain.length <= maxLength) return plain || "بدون ملخّص.";
  return `${plain.slice(0, maxLength)}...`;
}

