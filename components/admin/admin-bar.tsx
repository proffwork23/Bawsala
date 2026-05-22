"use client";

import { useTransition } from "react";
import { LogOut, PenTool } from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminLogoutAction } from "@/app/admin/actions";

export function AdminBar() {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-4 rounded-full border border-black/10 bg-white/80 px-4 py-2 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-black/50">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <PenTool className="h-4 w-4" />
        <span>وضع التعديل المباشر</span>
      </div>
      <div className="h-4 w-px bg-slate-300 dark:bg-slate-700" />
      <Button
        variant="ghost"
        size="sm"
        className="h-8 rounded-full px-3 text-rose-600 hover:bg-rose-100 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-900/30"
        onClick={() => startTransition(() => adminLogoutAction())}
        disabled={isPending}
      >
        <LogOut className="mr-2 h-4 w-4" />
        خروج
      </Button>
    </div>
  );
}
