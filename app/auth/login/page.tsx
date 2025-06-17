"use client";

import { LoginForm } from "@/components/login-form";
import Link from "next/link";
import { useAuthRedirect } from "@/lib/hooks/useAuthRedirect";

export default function Page() {
  const { isLoading } = useAuthRedirect();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-singleshop-light-blue to-white">
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <Link href="/" className="text-xl font-bold text-singleshop-blue">
          SingleShop
        </Link>
        <Link
          href="/auth/sign-up"
          className="text-sm font-medium text-gray-600 hover:text-singleshop-blue transition-colors"
        >
          Need an account?
        </Link>
      </div>

      {/* Login Form */}
      <div className="flex items-center justify-center px-6 pb-12">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
