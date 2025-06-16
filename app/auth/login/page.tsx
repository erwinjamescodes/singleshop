import { LoginForm } from "@/components/login-form";
import Link from "next/link";

export default function Page() {
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
