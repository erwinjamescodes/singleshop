import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardContent } from "@/components/dashboard/dashboard-content";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  if (!profile) {
    redirect("/setup");
  }

  // Get user's shop
  const { data: shop } = await supabase
    .from('shops')
    .select('*')
    .eq('user_id', data.user.id)
    .single();

  // Get shop's product
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('shop_id', shop?.id)
    .single();

  return <DashboardContent profile={profile} shop={shop} product={product} />;
}