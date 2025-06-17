"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function useAuthRedirect() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.auth.getUser();

        if (!error && data?.user) {
          setIsAuthenticated(true);
          // Check if user has completed profile setup
          const { data: profile } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", data.user.id)
            .single();

          // If profile exists, redirect to dashboard
          if (profile) {
            router.push("/dashboard");
            return;
          } else {
            // If no profile, redirect to setup
            router.push("/setup");
            return;
          }
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();
  }, [router]);

  return { isLoading, isAuthenticated };
}
