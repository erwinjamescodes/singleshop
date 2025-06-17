import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ProductManagePage from '@/components/dashboard/product-manage-page';

export default async function DashboardProductManagePage() {
  const supabase = await createClient();

  // Check if user is authenticated
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/auth/login');
  }

  // Get user's shop and product
  const { data: shop } = await supabase
    .from('shops')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!shop) {
    redirect('/setup');
  }

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('shop_id', shop.id)
    .single();

  return <ProductManagePage product={product} shop={shop} />;
}

export const metadata = {
  title: 'Product Management - SingleShop Dashboard',
  description: 'Manage your product details, pricing, and inventory',
};