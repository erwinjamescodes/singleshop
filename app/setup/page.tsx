import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SetupForm } from "@/components/setup-form";

export default async function SetupPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  // Check if user already has a profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', data.user.id)
    .single();

  // If profile exists, redirect to dashboard
  if (profile) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-singleshop-light-blue to-white">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to SingleShop! 🎉
          </h1>
          <p className="text-xl text-gray-600">
            Let&apos;s get your shop set up in just a few seconds
          </p>
        </div>
        
        <SetupForm user={data.user} />
      </div>
    </div>
  );
}