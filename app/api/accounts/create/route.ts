import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { paymentProvider } from '@/lib/payment-provider';

export async function POST(request: NextRequest) {
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

    // Check if user already has a payment account
    if (profile.payment_account_id) {
      return NextResponse.json(
        { error: 'Payment account already exists' },
        { status: 400 }
      );
    }

    try {
      // Create payment account with provider
      const account = await paymentProvider.createAccount({
        email: user.email!,
        type: 'express'
      });

      // Update profile with payment account ID
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          payment_account_id: account.id,
          payment_onboarded: account.details_submitted,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Profile update error:', updateError);
        return NextResponse.json(
          { error: 'Failed to update profile' },
          { status: 500 }
        );
      }

      // Generate onboarding link
      const onboardingLink = paymentProvider.generateOnboardingLink(account.id);

      return NextResponse.json({
        account_id: account.id,
        onboarding_link: onboardingLink,
        details_submitted: account.details_submitted,
        payouts_enabled: account.payouts_enabled,
        charges_enabled: account.charges_enabled
      });

    } catch (providerError: any) {
      console.error('Payment provider error:', providerError);
      return NextResponse.json(
        { error: providerError.message || 'Failed to create payment account' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Account creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}