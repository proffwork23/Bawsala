"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { createPostAction } from "@/app/admin/actions";
import { TipTapEditor } from "@/components/tiptap-editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CreatePostForm() {
  const router = useRouter();
  const [state, action, isPending] = useActionState(
    createPostAction,
    { ok: false, message: "" },
  );
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("literature");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [content, setContent] = useState("<p>ابدأ كتابة المقال هنا...</p>");

  useEffect(() => {
    if (state.ok) {
      setTitle("");
      setCategory("literature");
      setCoverImageUrl("");
      setContent("<p>ابدأ كتابة المقال هنا...</p>");
      router.refresh();
    }
  }, [state.ok, router]);

  return (
    <Card className="border-slate-200 bg-white text-slate-900">
      <CardHeader>
        <CardTitle className="text-2xl font-heading">إنشاء مقال جديد</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="title">العنوان</Label>
              <Input
                id="title"
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="عنوان المقال"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>التصنيف</Label>
              <Select
                value={category}
                onValueChange={(value) => setCategory(value ?? "literature")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر التصنيف" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="literature">الأدب</SelectItem>
                  <SelectItem value="tech">التقنية</SelectItem>
                  <SelectItem value="science">العِلم</SelectItem>
                  <SelectItem value="art">الفن</SelectItem>
                </SelectContent>
              </Select>
              <input type="hidden" name="category" value={category} />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cover-image-file">رفع صورة الغلاف (من الجهاز)</Label>
                <Input
                  key={state.ok ? `file-reset-${Date.now()}` : "file-input"}
                  id="cover-image-file"
                  name="coverImageFile"
                  type="file"
                  accept="image/*"
                  className="file:me-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-indigo-950 dark:file:text-indigo-300"
                />
              </div>

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                <span className="flex-shrink-0 px-2 text-xs text-slate-400">أو</span>
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cover-image-url">رابط صورة الغلاف (خارجي)</Label>
                <Input
                  id="cover-image-url"
                  name="coverImageUrl"
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>المحتوى</Label>
            <TipTapEditor value={content} onChange={setContent} />
            <input type="hidden" name="content" value={content} />
          </div>

          {state.message ? (
            <p className={state.ok ? "text-sm text-emerald-700" : "text-sm text-rose-700"}>
              {state.message}
            </p>
          ) : null}

          <div className="flex justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending ? "جارِ الحفظ..." : "حفظ المقال"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

