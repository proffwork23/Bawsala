"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { loginAction } from "@/app/login/actions";

export function LoginForm() {
  const [state, action, isPending] = useActionState(loginAction, undefined);

  if (!hasSupabaseEnv()) {
    return (
      <Card className="w-full max-w-md border-white/20 bg-white/10 backdrop-blur-xl">
        <CardContent className="pt-6">
          <p className="text-sm text-center text-rose-600 dark:text-rose-200">
            يرجى ضبط مفاتيح Supabase في .env.local أولاً.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border-black/10 dark:border-white/20 bg-white/70 dark:bg-white/10 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-heading">دخول المدير</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="admin@example.com"
              required
              className="bg-white/90 text-slate-900"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">كلمة المرور</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              className="bg-white/90 text-slate-900"
            />
          </div>

          {state?.error ? <p className="text-sm text-rose-600 dark:text-rose-200">{state.error}</p> : null}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "جارِ تسجيل الدخول..." : "دخول"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
