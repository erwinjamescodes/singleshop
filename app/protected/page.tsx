"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ProtectedPage() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      try {
        const supabase = createClient();

        const { data, error } = await supabase.auth.getUser();
        if (error || !data?.user) {
          router.push("/auth/login");
          return;
        }

        // Check if user has completed profile setup
        const { data: profile } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", data.user.id)
          .single();

        // If no profile exists, redirect to setup
        if (!profile) {
          router.push("/setup");
          return;
        }

        // If profile exists, redirect to dashboard
        router.push("/dashboard");
      } catch (error) {
        console.error("Auth check error:", error);
        router.push("/auth/login");
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center ">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
          <p className="text-gray-500 text-sm mt-2">
            Checking authentication status
          </p>
        </div>
      </div>
    );
  }

  // This should rarely be seen since we redirect, but just in case
  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="text-center">
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
