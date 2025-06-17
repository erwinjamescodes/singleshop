import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Store, Plus } from "lucide-react";

export default function ShopNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-singleshop-light-blue to-white flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        {/* Shop Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Store className="w-12 h-12 text-gray-400" />
          </div>
          <div className="text-4xl font-bold text-gray-300 mb-2">🏪</div>
        </div>

        {/* Content */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            This shop does not exist
          </h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            The shop you're looking for hasn't been created yet, or the username
            might be incorrect.
          </p>
          <p className="text-sm text-gray-500">
            Double-check the username in the URL, or explore other shops on
            SingleShop.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
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
            <Link href="/auth/sign-up">
              <Plus className="w-4 h-4 mr-2" />
              Create This Shop
            </Link>
          </Button>
        </div>

        {/* Suggestion */}
        <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600">
            <strong>Want to claim this username?</strong>
            <br />
            Sign up now and create your own shop with this URL!
          </p>
        </div>
      </div>
    </div>
  );
}
