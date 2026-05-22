"use client";

import React from "react";
import Image from "next/image";
import { SiteSettings } from "@/lib/settings";
import { Post, toSnippetCard } from "@/lib/posts";
import { EditableProfile } from "@/components/admin/editable-profile";
import { SnippetGrid } from "@/components/snippet-grid";

interface HomeClassicProps {
  settings: SiteSettings;
  isAdmin: boolean;
  litPost: Post | null;
  techPost: Post | null;
  sciPost: Post | null;
}

export function HomeContent({ settings, isAdmin, litPost, techPost, sciPost }: HomeClassicProps) {
  // Collect all valid posts and convert to snippets
  const allPosts = [litPost, techPost, sciPost].filter(Boolean) as Post[];
  const snippets = allPosts.map(toSnippetCard);

  return (
    <div className="relative min-h-screen pb-20">

      <main className="relative mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8 space-y-12">
        
        {/* Profile Section */}
        <section className="glass-panel mx-auto max-w-3xl rounded-3xl p-6 sm:p-8">
          <EditableProfile isAdmin={isAdmin} settings={settings}>
            <div className="flex flex-col items-center text-center gap-6">
              <div className="relative h-36 w-36 overflow-hidden rounded-full ring-2 ring-white/20 shadow-xl">
                 {settings.avatar_url ? (
                   <Image src={settings.avatar_url} alt={settings.name} fill className="object-cover" />
                 ) : <div className="h-full w-full bg-slate-800" />}
              </div>
              <div className="space-y-4">
                <h1 className="text-3xl sm:text-4xl font-heading font-extrabold tracking-tight">
                  {settings.name}
                </h1>
                <p className="text-base sm:text-lg leading-relaxed opacity-80 max-w-2xl">
                  {settings.bio}
                </p>
              </div>

              {/* Contact Links */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                <a
                  className="glass-panel rounded-full px-5 py-2 text-sm font-semibold hover:bg-white/10 transition"
                  href="https://wa.me/201555394289"
                  target="_blank"
                  rel="noreferrer"
                >
                  واتساب
                </a>
                <a
                  className="glass-panel rounded-full px-5 py-2 text-sm font-semibold hover:bg-white/10 transition"
                  href="mailto:khalidmustafaanwar@gmail.com"
                >
                  البريد
                </a>
                <a
                  className="glass-panel rounded-full px-5 py-2 text-sm font-semibold hover:bg-white/10 transition"
                  href="https://www.facebook.com/khalidpr1"
                  target="_blank"
                  rel="noreferrer"
                >
                  فيسبوك
                </a>
              </div>
            </div>
          </EditableProfile>
        </section>

        {/* Snippets Section */}
        <section className="mt-12">
          <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-4">
            <h2 className="text-2xl font-heading font-bold">مقتطفات — أحدث الأعمال</h2>
            <p className="text-sm opacity-60 italic">معاينة مباشرة لأحدث التدوينات في كافة التصنيفات</p>
          </div>

          {snippets.length > 0 ? (
            <SnippetGrid items={snippets} />
          ) : (
            <div className="glass-panel rounded-2xl p-12 text-center opacity-50 italic">
              لا توجد مقالات منشورة بانتظارك حالياً...
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
