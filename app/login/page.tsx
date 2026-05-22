import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="flex-1">
      <main className="mx-auto flex min-h-[70vh] w-full max-w-6xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <LoginForm />
      </main>
    </div>
  );
}

