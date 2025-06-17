import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-singleshop-light-blue to-white flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        {/* 404 Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-12 h-12 text-gray-400" />
          </div>
          <h1 className="text-6xl font-bold text-gray-300 mb-2">404</h1>
        </div>

        {/* Content */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Sorry, we couldn't find the page you're looking for. It might have
            been moved, deleted, or you entered the wrong URL.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            asChild
            variant="outline"
            className="border-2 border-singleshop-blue text-singleshop-blue hover:bg-singleshop-blue hover:text-white"
          >
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Link>
          </Button>
          <Button
            asChild
            className="bg-singleshop-blue hover:bg-blue-700 text-white"
          >
            <Link href="/auth/sign-up">Create Your Shop</Link>
          </Button>
        </div>

        {/* Help Text */}
        <p className="text-sm text-gray-500 mt-8">
          Looking for a specific shop? Make sure you have the correct username.
        </p>
      </div>
    </div>
  );
}
