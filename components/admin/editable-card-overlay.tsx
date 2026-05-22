"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deletePostAction } from "@/app/admin/actions";

export function EditableCardOverlay({ 
  articleId, 
  title 
}: { 
  articleId: string;
  title: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm(`هل أنت متأكد من حذف مقال "${title}"؟`)) {
      startTransition(async () => {
        try {
          await deletePostAction(articleId);
        } catch (err) {
          console.error(err);
          alert("فشل الحذف");
        }
      });
    }
  };

  return (
    <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button
        variant="destructive"
        size="icon"
        className="rounded-full h-8 w-8 shadow-xl"
        onClick={handleDelete}
        disabled={isPending}
        title="حذف المقال"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
