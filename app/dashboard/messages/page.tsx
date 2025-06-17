import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import CustomerMessaging from '@/components/dashboard/customer-messaging';

export default async function MessagesPage() {
  const supabase = await createClient();

  // Check if user is authenticated
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/auth/login');
  }

  // Get user's shop
  const { data: shop } = await supabase
    .from('shops')
    .select('id')
    .eq('user_id', user.id)
    .single();

  return <CustomerMessaging shopId={shop?.id} />;
}

export const metadata = {
  title: 'Messages - SingleShop Dashboard',
  description: 'Manage customer messages and support requests',
};