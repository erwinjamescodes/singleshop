import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  // Check if user has completed profile setup
  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', data.user.id)
    .single();

  // If no profile exists, redirect to setup
  if (!profile) {
    redirect("/setup");
  }

  // If profile exists, redirect to dashboard
  redirect("/dashboard");
}
