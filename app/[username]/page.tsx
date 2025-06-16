import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ShopPage } from "@/components/shop/shop-page";

interface ShopPageProps {
  params: Promise<{ username: string }>;
}

export default async function PublicShopPage({ params }: ShopPageProps) {
  const { username } = await params;
  const supabase = await createClient();

  // Get shop by username
  const { data: shop } = await supabase
    .from('shops')
    .select(`
      *,
      profiles!shops_user_id_fkey(username, display_name, bio, avatar_url),
      products(*)
    `)
    .eq('slug', username.toLowerCase())
    .eq('is_active', true)
    .single();

  if (!shop) {
    notFound();
  }

  return <ShopPage shop={shop} />;
}

export async function generateMetadata({ params }: ShopPageProps) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: shop } = await supabase
    .from('shops')
    .select(`
      *,
      profiles!shops_user_id_fkey(display_name),
      products(name, description)
    `)
    .eq('slug', username.toLowerCase())
    .eq('is_active', true)
    .single();

  if (!shop) {
    return {
      title: 'Shop Not Found',
    };
  }

  const product = shop.products?.[0];
  const displayName = shop.profiles?.display_name || username;

  return {
    title: `${displayName}'s Shop | SingleShop`,
    description: product?.description || shop.description || `Check out ${displayName}'s product on SingleShop`,
    openGraph: {
      title: `${displayName}'s Shop`,
      description: product?.description || shop.description,
      url: `https://singleshop.com/${username}`,
      siteName: 'SingleShop',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${displayName}'s Shop`,
      description: product?.description || shop.description,
    },
  };
}