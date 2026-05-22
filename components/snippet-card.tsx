import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { EditableCardOverlay } from "@/components/admin/editable-card-overlay";


export type SnippetCardData = {
  id: string;
  category: string;
  title: string;
  excerpt: string;
  img: string;
  glow: "var(--glow-adab)" | "var(--glow-tech)" | "var(--glow-ilm)" | "var(--glow-art)";
  href?: string;
};

export function SnippetCard({ data, isAdmin }: { data: SnippetCardData; isAdmin?: boolean }) {
  const baseProps = {
    className:
      "group relative flex flex-col overflow-hidden rounded-3xl transition will-change-transform hover:-translate-y-0.5 h-full border border-white/10 backdrop-blur-[18px]",
    style: {
      ["--glow" as never]: data.glow,
      background: "rgba(10, 15, 30, 0.55)",
      boxShadow: "0 1px 0 rgba(255,255,255,0.06) inset, 0 0 0 1px rgba(148,163,184,0.12) inset, 0 20px 60px rgba(0,0,0,0.35)",
    } as React.CSSProperties,
  };

  const content = (
    <>
      <div className="relative h-44">
        <Image
          src={data.img}
          alt={data.title}
          fill
          className="object-cover opacity-90"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-3 right-3 rounded-full bg-black/40 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/15">
          {data.category}
        </div>
        {isAdmin && <EditableCardOverlay articleId={data.id} title={data.title} />}
      </div>

      {/* Text area - grows to fill remaining space */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-heading font-extrabold leading-snug text-white/95 line-clamp-2">
          {data.title}
        </h3>
        <p className="mt-2 text-sm leading-6 text-white/70 line-clamp-3 flex-1">{data.excerpt}</p>

        <div className="mt-4 h-px w-full bg-white/10" />
        <div className="mt-4 text-sm font-semibold text-white/80">قراءة…</div>
      </div>

      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div
          className="absolute -inset-8"
          style={{
            background:
              "radial-gradient(500px 260px at 50% 0%, color-mix(in oklab, var(--glow), transparent 55%), transparent 60%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            boxShadow:
              "0 0 0 1px color-mix(in oklab, var(--glow), transparent 55%), 0 0 42px -10px color-mix(in oklab, var(--glow), transparent 25%)",
          }}
        />
      </div>
    </>
  );

  if (data.href) {
    return (
      <Link href={data.href} {...baseProps}>
        {content}
      </Link>
    );
  }

  return <article {...baseProps}>{content}</article>;
}

