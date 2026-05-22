import { adminLogoutAction } from "@/app/admin/actions";
import { CreatePostForm } from "@/components/admin/create-post-form";
import { Button } from "@/components/ui/button";

export default function AdminPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="mb-6 glass-panel rounded-3xl p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-heading font-extrabold tracking-tight">
              لوحة التحكم
            </h1>
            <p className="mt-2 text-sm text-white/75">
              إدارة المحتوى — إنشاء وتنسيق المقالات قبل ربط الحفظ بقاعدة البيانات.
            </p>
          </div>

          <form action={adminLogoutAction}>
            <Button type="submit" variant="outline" className="bg-white/10 text-white">
              تسجيل الخروج
            </Button>
          </form>
        </div>
      </section>

      <CreatePostForm />
    </main>
  );
}

