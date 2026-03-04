import { LoginForm } from "@/components/auth/login-form";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Flame } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sign In | Brodman KB" };

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/");

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        {/* Brand mark */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 shadow-lg">
            <Flame className="h-6 w-6 text-white" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Brodman KB</h1>
          <p className="mt-1 text-sm text-slate-500">
            Field operations knowledge base
          </p>
        </div>

        {/* Login card */}
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-center text-base font-semibold text-slate-900">
            Sign in to your account
          </h2>
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Internal use only · {new Date().getFullYear()} Brodman
        </p>
      </div>
    </div>
  );
}
