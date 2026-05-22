"use client";

import { useTransition } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createPost } from "@/app/admin/actions";
import { PostCategory } from "@/lib/posts";

export function CreatePostButton({ category }: { category: PostCategory }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleCreate = () => {
    startTransition(async () => {
      try {
        const result = await createPost(category);
        if (result.success) {
          router.push(`/${category}/${result.slug}`);
        }
      } catch (err) {
        console.error(err);
        alert("فشل إنشاء المقال");
      }
    });
  };

  return (
    <Button 
      onClick={handleCreate} 
      disabled={isPending}
      className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg"
    >
      <Plus className="ml-2 h-4 w-4" />
      {isPending ? "جاري الإنشاء..." : "إضافة مقال جديد"}
    </Button>
  );
}
