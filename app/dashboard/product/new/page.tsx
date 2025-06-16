import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/dashboard/product-form";

export default async function NewProductPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  // Get user's shop
  const { data: shop } = await supabase
    .from('shops')
    .select('*')
    .eq('user_id', data.user.id)
    .single();

  if (!shop) {
    redirect("/setup");
  }

  // Check if shop already has a product
  const { data: existingProduct } = await supabase
    .from('products')
    .select('id')
    .eq('shop_id', shop.id)
    .single();

  if (existingProduct) {
    redirect("/dashboard/product/edit");
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Add Your First Product</h1>
        <p className="text-gray-600 mt-2">
          Tell us about what you&apos;re selling. You can always edit this later.
        </p>
      </div>
      
      <ProductForm shop={shop} />
    </div>
  );
}