"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function BackButton({ href, label }: { href: string; label?: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/60 px-4 py-2 text-sm font-semibold text-soul-fg backdrop-blur hover:bg-white/75 transition"
    >
      <ArrowRight className="h-4 w-4" />
      {label ?? "رجوع"}
    </Link>
  );
}

