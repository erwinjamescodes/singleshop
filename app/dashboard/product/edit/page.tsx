import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ProductEditForm from '@/components/dashboard/product-edit-form';

export default async function ProductEditPage() {
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

  if (!product) {
    redirect('/dashboard/product/new');
  }

  return <ProductEditForm product={product} shop={shop} />;
}

export const metadata = {
  title: 'Edit Product - SingleShop Dashboard',
  description: 'Edit your product details, pricing, and images',
};