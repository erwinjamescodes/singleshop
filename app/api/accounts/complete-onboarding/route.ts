import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { paymentProvider } from '@/lib/payment-provider';
import { redirect } from 'next/navigation';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const formData = await request.formData();
    const accountId = formData.get('account_id') as string;
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }

    try {
      // Complete onboarding with payment provider
      const account = await paymentProvider.completeAccountOnboarding(accountId);

      // Update profile with completed onboarding status
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          payment_onboarded: account.details_submitted,
          updated_at: new Date().toISOString()
        })
        .eq('payment_account_id', accountId);

      if (updateError) {
        console.error('Profile update error:', updateError);
        return NextResponse.json(
          { error: 'Failed to update profile' },
          { status: 500 }
        );
      }

      // Redirect to dashboard with success message
      return redirect('/dashboard?onboarding=complete');

    } catch (providerError: any) {
      console.error('Payment provider error:', providerError);
      return NextResponse.json(
        { error: providerError.message || 'Failed to complete onboarding' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Onboarding completion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}