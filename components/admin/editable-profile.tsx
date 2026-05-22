"use client";

import { useState, useTransition } from "react";
import { Edit3, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateProfileAction } from "@/app/admin/actions";
import { SiteSettings } from "@/lib/settings";

type EditableProfileProps = {
  isAdmin: boolean;
  settings: SiteSettings;
  children: React.ReactNode;
};

export function EditableProfile({ isAdmin, settings, children }: EditableProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState(settings.bio);
  const [coverImage, setCoverImage] = useState(settings.avatar_url || "");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isAdmin) {
    return <>{children}</>;
  }

  if (!isEditing) {
    return (
      <div className="relative group">
        <div className="absolute top-0 right-0 z-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <Button
            size="icon"
            variant="default"
            className="rounded-full shadow-lg h-10 w-10 p-0"
            onClick={() => setIsEditing(true)}
            title="تعديل الملف الشخصي"
          >
            <Edit3 className="h-4 w-4" />
          </Button>
        </div>
        {children}
      </div>
    );
  }

  const handleSave = () => {
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("bio", bio);
        if (coverImage) formData.append("coverImageUrl", coverImage);
        if (coverFile) formData.append("coverImageFile", coverFile);

        await updateProfileAction(formData);
        setIsEditing(false);
      } catch (err) {
        console.error(err);
        alert("فشل تحديث الملف الشخصي");
      }
    });
  };

  return (
    <div className="glass-panel mx-auto max-w-3xl rounded-3xl p-6 sm:p-8 space-y-6">
      <div className="flex justify-between items-center border-b border-white/10 pb-4">
        <h2 className="text-xl font-bold font-heading">تعديل الملف الشخصي</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsEditing(false)} disabled={isPending}>
            <X className="mr-2 h-4 w-4" /> إلغاء
          </Button>
          <Button variant="default" size="sm" onClick={handleSave} disabled={isPending}>
            <Check className="mr-2 h-4 w-4" /> {isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="block pr-1">النبذة الشخصية (Bio)</Label>
          <Textarea 
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="min-h-[120px] text-right"
            dir="rtl"
          />
        </div>

        <div className="space-y-4 rounded-xl border border-white/20 bg-black/5 p-4 dark:bg-white/5">
          <h3 className="font-semibold px-1">الصورة الشخصية (Avatar)</h3>
          
          <div className="space-y-2">
            <Label className="block pr-1">رفع صورة من الجهاز</Label>
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
              placeholder="https://example.com/avatar.jpg"
              disabled={!!coverFile}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
