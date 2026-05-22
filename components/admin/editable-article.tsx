"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Edit3, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updatePostAction } from "@/app/admin/actions";
import { TipTapEditor } from "@/components/tiptap-editor";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type EditableArticleProps = {
  isAdmin: boolean;
  articleId: string;
  initialTitle: string;
  initialContentHtml: string;
  initialCover: string | null;
  children: React.ReactNode;
};

export function EditableArticle({
  isAdmin,
  articleId,
  initialTitle,
  initialContentHtml,
  initialCover,
  children,
}: EditableArticleProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [coverImage, setCoverImage] = useState(initialCover || "");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [content, setContent] = useState(initialContentHtml);
  const [isPending, startTransition] = useTransition();

  if (!isAdmin) {
    return <>{children}</>;
  }

  if (!isEditing) {
    return (
      <div className="group relative">
        {/* Floating Edit Button */}
        <div className="absolute left-0 top-0 z-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <Button
            size="sm"
            variant="default"
            className="rounded-full shadow-lg h-10 w-10 p-0"
            onClick={() => setIsEditing(true)}
            title="تعديل المقال"
          >
            <Edit3 className="h-4 w-4" />
          </Button>
        </div>
        {children}
      </div>
    );
  }

  const handleSave = async () => {
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("id", articleId);
        formData.append("title", title);
        formData.append("content", content);
        if (coverImage) formData.append("coverImageUrl", coverImage);
        if (coverFile) formData.append("coverImageFile", coverFile);

        await updatePostAction(formData);
        setIsEditing(false);
        router.refresh();
      } catch (err) {
        console.error(err);
        alert("فشل الحفظ");
      }
    });
  };

  return (
    <div className="rounded-xl border-2 border-indigo-500/50 bg-white/50 p-6 backdrop-blur-sm dark:bg-black/50 space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <h2 className="font-heading text-xl font-bold">تعديل المقال المباشر</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsEditing(false)} disabled={isPending}>
            <X className="mr-2 h-4 w-4" />
            إلغاء
          </Button>
          <Button variant="default" size="sm" onClick={handleSave} disabled={isPending}>
            <Check className="mr-2 h-4 w-4" />
            {isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-right block">عنوان المقال</Label>
        <Input 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          className="text-right font-heading text-lg"
          dir="rtl"
        />
      </div>

      <div className="space-y-4 rounded-xl border border-white/20 bg-black/5 p-4 dark:bg-white/5">
        <h3 className="font-semibold px-1">صورة الغلاف (اختر إما رابط أو رفع ملف)</h3>
        
        <div className="space-y-2">
          <Label className="block pr-1"> رفع صورة من الجهاز</Label>
          <Input 
            type="file"
            accept="image/*"
            onChange={(e) => setCoverFile(e.target.files?.[0] || null)} 
            className="cursor-pointer file:text-indigo-600 file:bg-indigo-50 hover:file:bg-indigo-100"
            dir="rtl"
          />
        </div>

        <div className="space-y-2">
          <Label className="block pr-1">أو رابط الصورة الخارجي</Label>
          <Input 
            value={coverImage} 
            onChange={(e) => setCoverImage(e.target.value)} 
            className="text-left"
            dir="ltr"
            placeholder="https://example.com/image.jpg"
            disabled={!!coverFile}
          />
          {coverFile && <p className="text-xs text-slate-500 pr-1">الرابط معطل لأنه تم اختيار ملف للرفع.</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-right block">المحتوى</Label>
        <TipTapEditor value={content} onChange={setContent} />
      </div>
    </div>
  );
}
