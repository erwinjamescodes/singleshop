// Payment Provider Abstraction Layer
// This allows seamless switching between mock and real payment systems

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  client_secret: string;
  customer_email?: string;
  created: number;
  metadata: Record<string, string>;
}

export interface PaymentMethod {
  type: 'card';
  card: {
    number: string;
    exp_month: number;
    exp_year: number;
    cvc: string;
  };
}

export interface CreatePaymentIntentParams {
  amount: number;
  currency?: string;
  customer_email?: string;
  metadata?: Record<string, string>;
}

export interface ConfirmPaymentIntentParams {
  payment_method: PaymentMethod;
  return_url?: string;
}

export interface PaymentAccount {
  id: string;
  email: string;
  details_submitted: boolean;
  payouts_enabled: boolean;
  charges_enabled: boolean;
  created: number;
}

export interface CreateAccountParams {
  email: string;
  type: 'express';
}

export abstract class PaymentProvider {
  abstract createPaymentIntent(params: CreatePaymentIntentParams): Promise<PaymentIntent>;
  abstract confirmPaymentIntent(id: string, params: ConfirmPaymentIntentParams): Promise<PaymentIntent>;
  abstract retrievePaymentIntent(id: string): Promise<PaymentIntent>;
  abstract generateReceiptUrl(paymentIntent: PaymentIntent): string;
  
  abstract createAccount(params: CreateAccountParams): Promise<PaymentAccount>;
  abstract retrieveAccount(id: string): Promise<PaymentAccount>;
  abstract completeAccountOnboarding(id: string): Promise<PaymentAccount>;
  abstract generateOnboardingLink(id: string): string;
}

// Mock Payment Provider Implementation
import { mockStripe, mockAccounts, MockPaymentIntent, MockAccount } from './mock-stripe';

class MockPaymentProvider extends PaymentProvider {
  async createPaymentIntent(params: CreatePaymentIntentParams): Promise<PaymentIntent> {
    const mockIntent = await mockStripe.createPaymentIntent(params);
    return this.transformMockPaymentIntent(mockIntent);
  }

  async confirmPaymentIntent(id: string, params: ConfirmPaymentIntentParams): Promise<PaymentIntent> {
    const mockIntent = await mockStripe.confirmPaymentIntent(id, params);
    return this.transformMockPaymentIntent(mockIntent);
  }

  async retrievePaymentIntent(id: string): Promise<PaymentIntent> {
    const mockIntent = await mockStripe.retrievePaymentIntent(id);
    return this.transformMockPaymentIntent(mockIntent);
  }

  generateReceiptUrl(paymentIntent: PaymentIntent): string {
    return mockStripe.generateMockReceipt(paymentIntent as MockPaymentIntent);
  }

  async createAccount(params: CreateAccountParams): Promise<PaymentAccount> {
    const mockAccount = await mockAccounts.create(params);
    return this.transformMockAccount(mockAccount);
  }

  async retrieveAccount(id: string): Promise<PaymentAccount> {
    const mockAccount = await mockAccounts.retrieve(id);
    return this.transformMockAccount(mockAccount);
  }

  async completeAccountOnboarding(id: string): Promise<PaymentAccount> {
    const mockAccount = await mockAccounts.completeOnboarding(id);
    return this.transformMockAccount(mockAccount);
  }

  generateOnboardingLink(id: string): string {
    return mockAccounts.generateOnboardingLink(id);
  }

  private transformMockPaymentIntent(mockIntent: MockPaymentIntent): PaymentIntent {
    return {
      id: mockIntent.id,
      amount: mockIntent.amount,
      currency: mockIntent.currency,
      status: mockIntent.status,
      client_secret: mockIntent.client_secret,
      customer_email: mockIntent.customer_email,
      created: mockIntent.created,
      metadata: mockIntent.metadata,
    };
  }

  private transformMockAccount(mockAccount: MockAccount): PaymentAccount {
    return {
      id: mockAccount.id,
      email: mockAccount.email,
      details_submitted: mockAccount.details_submitted,
      payouts_enabled: mockAccount.payouts_enabled,
      charges_enabled: mockAccount.charges_enabled,
      created: mockAccount.created,
    };
  }
}

// Real Stripe Provider Implementation (for future use)
class StripePaymentProvider extends PaymentProvider {
  private stripe: any; // Would be Stripe instance

  constructor(secretKey: string) {
    super();
    // this.stripe = new Stripe(secretKey);
    throw new Error('Stripe provider not implemented yet. Use MockPaymentProvider for development.');
  }

  async createPaymentIntent(params: CreatePaymentIntentParams): Promise<PaymentIntent> {
    // Real Stripe implementation would go here
    throw new Error('Not implemented');
  }

  async confirmPaymentIntent(id: string, params: ConfirmPaymentIntentParams): Promise<PaymentIntent> {
    // Real Stripe implementation would go here
    throw new Error('Not implemented');
  }

  async retrievePaymentIntent(id: string): Promise<PaymentIntent> {
    // Real Stripe implementation would go here
    throw new Error('Not implemented');
  }

  generateReceiptUrl(paymentIntent: PaymentIntent): string {
    // Real Stripe implementation would go here
    throw new Error('Not implemented');
  }

  async createAccount(params: CreateAccountParams): Promise<PaymentAccount> {
    // Real Stripe implementation would go here
    throw new Error('Not implemented');
  }

  async retrieveAccount(id: string): Promise<PaymentAccount> {
    // Real Stripe implementation would go here
    throw new Error('Not implemented');
  }

  async completeAccountOnboarding(id: string): Promise<PaymentAccount> {
    // Real Stripe implementation would go here
    throw new Error('Not implemented');
  }

  generateOnboardingLink(id: string): string {
    // Real Stripe implementation would go here
    throw new Error('Not implemented');
  }
}

// Factory function to get the appropriate payment provider
export function getPaymentProvider(): PaymentProvider {
  const provider = process.env.PAYMENT_PROVIDER || 'mock';
  
  switch (provider) {
    case 'stripe':
      if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error('STRIPE_SECRET_KEY is required for Stripe provider');
      }
      return new StripePaymentProvider(process.env.STRIPE_SECRET_KEY);
    
    case 'mock':
    default:
      return new MockPaymentProvider();
  }
}

// Export the provider instance
export const paymentProvider = getPaymentProvider();