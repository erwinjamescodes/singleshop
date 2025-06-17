import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import SettingsPage from '@/components/dashboard/settings-page';

export default async function DashboardSettingsPage() {
  const supabase = await createClient();

  // Check if user is authenticated
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/auth/login');
  }

  // Get user profile and shop data
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const { data: shop } = await supabase
    .from('shops')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return <SettingsPage user={user} profile={profile} shop={shop} />;
}

export const metadata = {
  title: 'Settings - SingleShop Dashboard',
  description: 'Manage your profile and shop settings',
};