// Mock Stripe Payment System
// This simulates Stripe's API patterns for portfolio demonstration

export interface MockPaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'succeeded' | 'canceled';
  client_secret: string;
  customer_email?: string;
  created: number;
  metadata: Record<string, string>;
}

export interface MockPaymentMethod {
  id: string;
  type: 'card';
  card: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
}

export interface CreatePaymentIntentParams {
  amount: number;
  currency?: string;
  customer_email?: string;
  metadata?: Record<string, string>;
}

export interface ConfirmPaymentIntentParams {
  payment_method: {
    type: 'card';
    card: {
      number: string;
      exp_month: number;
      exp_year: number;
      cvc: string;
    };
  };
  return_url?: string;
}

// Global storage for payment intents (simulates a database/cache)
const globalPaymentIntents = new Map<string, MockPaymentIntent>();

export class MockStripe {
  private static instance: MockStripe;

  static getInstance(): MockStripe {
    if (!MockStripe.instance) {
      MockStripe.instance = new MockStripe();
    }
    return MockStripe.instance;
  }

  // Simulate payment intent creation
  async createPaymentIntent(params: CreatePaymentIntentParams): Promise<MockPaymentIntent> {
    const id = `pi_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const client_secret = `${id}_secret_${Math.random().toString(36).substr(2, 16)}`;

    const paymentIntent: MockPaymentIntent = {
      id,
      amount: params.amount,
      currency: params.currency || 'usd',
      status: 'requires_payment_method',
      client_secret,
      customer_email: params.customer_email,
      created: Date.now(),
      metadata: params.metadata || {},
    };

    globalPaymentIntents.set(id, paymentIntent);
    console.log('Created payment intent:', id);
    console.log('Total payment intents stored:', globalPaymentIntents.size);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return paymentIntent;
  }

  // Simulate payment confirmation
  async confirmPaymentIntent(
    paymentIntentId: string,
    params: ConfirmPaymentIntentParams
  ): Promise<MockPaymentIntent> {
    console.log('Confirming payment intent:', paymentIntentId);
    console.log('Available payment intents:', Array.from(globalPaymentIntents.keys()));
    
    // Use retrievePaymentIntent which handles reconstruction
    const intent = await this.retrievePaymentIntent(paymentIntentId);

    // Simulate card validation
    const { card } = params.payment_method;
    
    // Mock card validation rules
    const isValidCard = this.validateMockCard(card);
    
    if (!isValidCard) {
      intent.status = 'requires_payment_method';
      throw new Error('Your card was declined');
    }

    // Simulate processing time
    intent.status = 'processing';
    globalPaymentIntents.set(paymentIntentId, intent);
    
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if it's a test card that should have predictable behavior
    const testCards = {
      '4242424242424242': 'always_succeeds',
      '4000000000000002': 'always_fails',
      '4000000000009995': 'always_fails',
      '5555555555554444': 'always_succeeds',
    };

    const testCardBehavior = testCards[card.number as keyof typeof testCards];
    console.log('Card number received:', card.number);
    console.log('Card number type:', typeof card.number);
    console.log('Card number length:', card.number.length);
    console.log('Test card behavior:', testCardBehavior);
    console.log('Available test cards:', Object.keys(testCards));
    
    if (testCardBehavior === 'always_fails') {
      intent.status = 'requires_payment_method';
      console.log('❌ Card configured to always fail');
      throw new Error('Your card was declined.');
    } else if (testCardBehavior === 'always_succeeds') {
      intent.status = 'succeeded';
      console.log('✅ Card configured to always succeed - PAYMENT SHOULD WORK');
    } else {
      // For non-test cards, use 90% success rate
      const isSuccessful = Math.random() > 0.1;
      console.log('🎲 Non-test card, random success:', isSuccessful);
      
      if (isSuccessful) {
        intent.status = 'succeeded';
        console.log('✅ Random success - payment succeeds');
      } else {
        intent.status = 'requires_payment_method';
        console.log('❌ Random failure - payment fails');
        throw new Error('Payment failed. Please try again.');
      }
    }

    console.log('Final payment intent status:', intent.status);

    globalPaymentIntents.set(paymentIntentId, intent);
    return intent;
  }

  // Get payment intent by ID
  async retrievePaymentIntent(paymentIntentId: string): Promise<MockPaymentIntent> {
    let intent = globalPaymentIntents.get(paymentIntentId);
    
    // If not found in memory, try to reconstruct from payment_intent_id pattern
    if (!intent) {
      console.log('Payment intent not found in memory, reconstructing...');
      
      // Extract timestamp and random part from the payment intent ID
      const match = paymentIntentId.match(/^pi_mock_(\d+)_(.+)$/);
      if (match) {
        const [, timestamp, randomPart] = match;
        
        // Reconstruct the payment intent (this is for demo purposes)
        intent = {
          id: paymentIntentId,
          amount: 0, // Will be overridden in confirmPaymentIntent
          currency: 'usd',
          status: 'requires_payment_method',
          client_secret: `${paymentIntentId}_secret_${randomPart}`,
          created: parseInt(timestamp),
          metadata: {},
        };
        
        // Store it back in memory
        globalPaymentIntents.set(paymentIntentId, intent);
        console.log('Reconstructed payment intent:', paymentIntentId);
      } else {
        throw new Error('Payment intent not found');
      }
    }
    
    return intent;
  }

  // Mock card validation - only checks basic format, not success/failure
  private validateMockCard(card: { number: string; exp_month: number; exp_year: number; cvc: string }): boolean {
    console.log('Validating card:', {
      number: card.number,
      exp_month: card.exp_month,
      exp_year: card.exp_year,
      cvc: card.cvc
    });

    // Basic validation only - success/failure logic is handled in confirmPaymentIntent
    const currentYear = new Date().getFullYear();
    console.log('Current year:', currentYear);
    
    if (card.number.length < 13 || card.number.length > 19) {
      console.log('❌ Card number length invalid:', card.number.length);
      return false;
    }
    if (card.exp_month < 1 || card.exp_month > 12) {
      console.log('❌ Expiry month invalid:', card.exp_month);
      return false;
    }
    if (card.exp_year < currentYear) {
      console.log('❌ Expiry year invalid - card expired:', card.exp_year, 'vs current:', currentYear);
      return false;
    }
    if (card.cvc.length < 3 || card.cvc.length > 4) {
      console.log('❌ CVC length invalid:', card.cvc.length);
      return false;
    }

    console.log('✅ Card validation passed');
    return true;
  }

  // Generate mock receipt
  generateMockReceipt(paymentIntent: MockPaymentIntent): string {
    return `https://mock-receipts.singleshop.com/receipt/${paymentIntent.id}`;
  }
}

// Export singleton instance
export const mockStripe = MockStripe.getInstance();

// Mock account management for sellers
export interface MockAccount {
  id: string;
  email: string;
  details_submitted: boolean;
  payouts_enabled: boolean;
  charges_enabled: boolean;
  created: number;
}

export class MockAccounts {
  private accounts: Map<string, MockAccount> = new Map();

  async create(params: { email: string; type: 'express' }): Promise<MockAccount> {
    const id = `acct_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const account: MockAccount = {
      id,
      email: params.email,
      details_submitted: false,
      payouts_enabled: false,
      charges_enabled: false,
      created: Date.now(),
    };

    this.accounts.set(id, account);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return account;
  }

  async retrieve(accountId: string): Promise<MockAccount> {
    const account = this.accounts.get(accountId);
    if (!account) {
      throw new Error('Account not found');
    }
    return account;
  }

  // Simulate account onboarding completion
  async completeOnboarding(accountId: string): Promise<MockAccount> {
    const account = this.accounts.get(accountId);
    if (!account) {
      throw new Error('Account not found');
    }

    account.details_submitted = true;
    account.payouts_enabled = true;
    account.charges_enabled = true;
    
    this.accounts.set(accountId, account);
    return account;
  }

  // Generate mock onboarding link
  generateOnboardingLink(accountId: string): string {
    return `/mock-onboarding/${accountId}`;
  }
}

export const mockAccounts = new MockAccounts();