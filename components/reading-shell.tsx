import type * as React from "react";
import { BackButton } from "@/components/back-button";

export function ReadingShell({
  title,
  subtitle,
  backHref,
  children,
}: {
  title: string;
  subtitle?: string;
  backHref: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[calc(100vh-7rem)] w-full py-10 px-4 sm:px-6">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <BackButton href={backHref} />
          <div className="text-xs text-soul-fg/60 dark:text-white/60">وضع القراءة</div>
        </div>

        {/* Notebook Paper Concept */}
        <div className="relative overflow-hidden rounded-md bg-[#faf9f5] text-gray-900 shadow-2xl ring-1 ring-black/5 dark:bg-[#e4e2dd] dark:text-gray-900">
          
          {/* Notebook right margin (Red lines for RTL) */}
          <div className="absolute bottom-0 right-10 top-0 w-px bg-red-400/40" />
          <div className="absolute bottom-0 right-12 top-0 w-px bg-red-400/40" />

          {/* Fixed line height for the notebook lines to match text */}
          <div 
            className="relative px-8 pt-16 pb-24 sm:px-20"
            style={{
              lineHeight: "40px", // 40px exact line height
              backgroundImage: "repeating-linear-gradient(transparent, transparent 39px, rgba(0, 0, 0, 0.08) 40px)",
              backgroundSize: "100% 40px",
              backgroundPosition: "0 16px", // Align lines with text baseline
            }}
          >
            <header className="mb-10">
              <h1 className="font-heading text-3xl font-extrabold sm:text-4xl leading-tight text-black">
                {title}
              </h1>
              {subtitle ? (
                <p className="mt-4 font-sans text-sm font-semibold text-gray-600">
                  {subtitle}
                </p>
              ) : null}
            </header>

            <article className="font-[var(--font-amiri)] text-[20px] text-gray-800 prose prose-lg prose-slate max-w-none text-justify">
              {/* Resetting headings inside article so they align with the 40px grid as much as possible */}
              <style dangerouslySetInnerHTML={{ __html: `
                article h1, article h2, article h3, article p, article ul, article li {
                  line-height: 40px !important;
                  margin-top: 0 !important;
                  margin-bottom: 40px !important;
                }
                article img { 
                  margin-top: 40px; 
                  margin-bottom: 40px; 
                  border-radius: 8px; 
                  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
                  position: relative;
                  z-index: 10;
                }
              `}} />
              {children}
            </article>
          </div>
        </div>
      </div>
    </div>
  );
}
