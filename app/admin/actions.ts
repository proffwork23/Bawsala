"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import { supabaseAnonKey, supabaseUrl, supabaseServiceKey } from "@/lib/supabase/config";

type CreatePostState = {
  ok: boolean;
  message: string;
};

export async function createPostAction(
  _prevState: CreatePostState,
  formData: FormData,
): Promise<CreatePostState> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("sb_access_token")?.value;

  if (!accessToken) {
    return { ok: false, message: "الجلسة غير صالحة. سجل الدخول مجدداً." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const coverImageFile = formData.get("coverImageFile") as File | null;
  const coverImageUrl = String(formData.get("coverImageUrl") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();

  if (!title || !content || !category) {
    return { ok: false, message: "يرجى ملء العنوان والتصنيف والمحتوى." };
  }

  if (!["literature", "tech", "science", "art"].includes(category)) {
    return { ok: false, message: "تصنيف غير صالح." };
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data: authData, error: authError } = await supabase.auth.getUser(accessToken);
  if (authError || !authData?.user) {
    return { ok: false, message: "فشل التحقق من هوية المدير." };
  }

  // رفع الصورة إذا كانت موجودة، وإلا استخدام الرابط المباشر
  let finalCoverImageUrl = coverImageUrl || null;
  if (coverImageFile && coverImageFile.size > 0 && coverImageFile.name && coverImageFile.name !== "undefined") {
    const fileExt = coverImageFile.name.split('.').pop() || 'png';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('covers')
      .upload(fileName, coverImageFile, {
        contentType: coverImageFile.type,
        upsert: false,
      });

    if (uploadError) {
      return { ok: false, message: `فشل رفع الصورة: ${uploadError.message}` };
    }

    const { data: publicUrlData } = supabaseAdmin.storage.from('covers').getPublicUrl(fileName);
    finalCoverImageUrl = publicUrlData.publicUrl;
  }

  // توليد رابط نظيف وفريد
  const slug = await buildUniqueSlug(supabase, slugify(title));

  const { error } = await supabase.from("posts").insert({
    title,
    slug,
    content,
    category,
    cover_image: finalCoverImageUrl,
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/");
  revalidatePath(`/${category}`);
  if (category !== "art") revalidatePath(`/${category}/${slug}`);

  return { ok: true, message: "تم نشر المقال بنجاح." };
}

export async function updatePostAction(formData: FormData) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("sb_access_token")?.value;

  if (!accessToken) throw new Error("Unauthorized");

  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const coverImageFile = formData.get("coverImageFile") as File | null;
  const coverImageUrl = String(formData.get("coverImageUrl") ?? "").trim();

  if (!id) throw new Error("Post ID is missing");

  // رفع الصورة إذا كانت موجودة، وإلا استخدام الرابط المباشر
  let finalCoverImageUrl = coverImageUrl || null;
  if (coverImageFile && coverImageFile.size > 0 && coverImageFile.name && coverImageFile.name !== "undefined") {
    const fileExt = coverImageFile.name.split('.').pop() || 'png';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { error: uploadError } = await supabaseAdmin.storage
      .from('covers')
      .upload(fileName, coverImageFile, {
        contentType: coverImageFile.type,
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`فشل رفع الصورة: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabaseAdmin.storage.from('covers').getPublicUrl(fileName);
    finalCoverImageUrl = publicUrlData.publicUrl;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const updateData: any = { title, content };
  if (finalCoverImageUrl) {
    updateData.cover_image = finalCoverImageUrl;
  }

  const { error } = await supabase.from("posts").update(updateData).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
  return { success: true };
}

export async function updateProfileAction(formData: FormData) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("sb_access_token")?.value;

  if (!accessToken) throw new Error("Unauthorized");

  const bio = String(formData.get("bio") ?? "").trim();
  const coverImageFile = formData.get("coverImageFile") as File | null;
  const coverImageUrl = String(formData.get("coverImageUrl") ?? "").trim();

  // Handle Image Upload
  let finalCoverImageUrl = coverImageUrl || null;
  if (coverImageFile && coverImageFile.size > 0 && coverImageFile.name && coverImageFile.name !== "undefined") {
    const fileExt = coverImageFile.name.split('.').pop() || 'png';
    const fileName = `avatar-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { error: uploadError } = await supabaseAdmin.storage
      .from('covers')
      .upload(fileName, coverImageFile, {
        contentType: coverImageFile.type,
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`فشل رفع الصورة: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabaseAdmin.storage.from('covers').getPublicUrl(fileName);
    finalCoverImageUrl = publicUrlData.publicUrl;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const updateData: any = { content: bio };
  if (finalCoverImageUrl) {
    updateData.cover_image = finalCoverImageUrl;
  }

  // Check if settings post exists
  const { data: existing } = await supabase
    .from("posts")
    .select("id")
    .eq("slug", "__site_settings__")
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("posts")
      .update(updateData)
      .eq("id", existing.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase
      .from("posts")
      .insert({
        title: "خالد مصطفى أنور",
        slug: "__site_settings__",
        content: bio,
        category: "art", // Needs to be a valid category
        cover_image: finalCoverImageUrl,
      });
    if (error) throw new Error(error.message);
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function createPost(category: string) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("sb_access_token")?.value;

  if (!accessToken) throw new Error("Unauthorized");

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const title = "مقال جديد";
  const slug = await buildUniqueSlug(supabase, `new-post-${Date.now()}`);

  const { data, error } = await supabase.from("posts").insert({
    title,
    slug,
    content: "<p>محتوى المقال...</p>",
    category,
  }).select("slug").single();

  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
  return { success: true, slug: data.slug as string };
}

export async function deletePostAction(id: string) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("sb_access_token")?.value;

  if (!accessToken) throw new Error("Unauthorized");

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
  return { success: true };
}

export async function updatePostsOrderAction(orderedIds: string[]) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("sb_access_token")?.value;

  if (!accessToken) throw new Error("Unauthorized");

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Supabase updateMany or loop
  // To avoid hitting limits for a small amount of posts, we'll run sequentially or use Promise.all
  await Promise.all(
    orderedIds.map((id, index) => 
      supabase.from("posts").update({ position: index }).eq("id", id)
    )
  );

  revalidatePath("/", "layout");
  return { success: true };
}

export async function adminLogoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  cookieStore.delete("sb_access_token");
  redirect("/login");
}

function slugify(input: string) {
  const normalized = input
    .toLowerCase()
    .trim()
    // 1. حذف التشكيل العربي
    .replace(/[\u064B-\u0652]/g, "") 
    // 2. الحفاظ فقط على الحروف (عربي/إنجليزي) والأرقام والشرطات، وحذف أي رموز أخرى كعلامات الاستفهام
    .replace(/[^\u0621-\u064A\u0660-\u0669a-z0-9\s-]/g, "") 
    // 3. تحويل المسافات لشرطات
    .replace(/\s+/g, "-")
    // 4. منع تكرار الشرطات
    .replace(/-+/g, "-");

  const cleaned = normalized.replace(/^-+|-+$/g, "");
  return cleaned || `post-${Date.now()}`;
}

async function buildUniqueSlug(supabase: any, baseSlug: string) {
  let candidate = baseSlug;
  let suffix = 2;

  for (;;) {
    const { data, error } = await supabase
      .from("posts")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();

    if (error) {
      return `${baseSlug}-${Date.now()}`;
    }

    if (!data) return candidate;
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}