import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { paymentProvider } from '@/lib/payment-provider';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // If no payment account exists
    if (!profile.payment_account_id) {
      return NextResponse.json({
        has_account: false,
        account_id: null,
        details_submitted: false,
        payouts_enabled: false,
        charges_enabled: false,
        onboarding_link: null
      });
    }

    try {
      // Get account status from payment provider
      const account = await paymentProvider.retrieveAccount(profile.payment_account_id);

      // Update profile if status changed
      if (account.details_submitted !== profile.payment_onboarded) {
        await supabase
          .from('profiles')
          .update({
            payment_onboarded: account.details_submitted,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);
      }

      // Generate onboarding link if needed
      const onboardingLink = !account.details_submitted 
        ? paymentProvider.generateOnboardingLink(account.id)
        : null;

      return NextResponse.json({
        has_account: true,
        account_id: account.id,
        details_submitted: account.details_submitted,
        payouts_enabled: account.payouts_enabled,
        charges_enabled: account.charges_enabled,
        onboarding_link: onboardingLink
      });

    } catch (providerError: any) {
      console.error('Payment provider error:', providerError);
      return NextResponse.json(
        { error: 'Failed to retrieve account status' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Account status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}