import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import OrdersPage from '@/components/dashboard/orders-page';

export default async function DashboardOrdersPage() {
  const supabase = await createClient();

  // Check if user is authenticated
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/auth/login');
  }

  return <OrdersPage />;
}

export const metadata = {
  title: 'Orders - SingleShop Dashboard',
  description: 'Manage your orders and track sales',
};