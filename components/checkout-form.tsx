'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CreditCard, Lock } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price_cents: number;
  currency: string;
  image_urls: string[];
}

interface Shop {
  id: string;
  title: string;
  slug: string;
}

interface OrderDetails {
  id: string;
  product_name: string;
  shop_name: string;
  amount_cents: number;
  currency: string;
  customer_email: string;
  status: string;
}

interface CheckoutFormProps {
  product: Product;
  shop: Shop;
  onSuccess: (orderDetails: OrderDetails) => void;
  onError: (error: string) => void;
}

export default function CheckoutForm({ product, shop, onSuccess, onError }: CheckoutFormProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'details' | 'payment'>('details');
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  
  const [customerDetails, setCustomerDetails] = useState({
    email: '',
    name: '',
    phone: '',
  });

  const [shippingAddress, setShippingAddress] = useState({
    line1: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'US',
  });

  const [paymentMethod, setPaymentMethod] = useState({
    number: '',
    exp_month: '',
    exp_year: '',
    cvc: '',
  });

  const formatPrice = (cents: number) => {
    return (cents / 100).toFixed(2);
  };

  const handleCustomerDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Create order and payment intent
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shop_id: shop.id,
          product_id: product.id,
          customer_email: customerDetails.email,
          customer_name: customerDetails.name,
          customer_phone: customerDetails.phone,
          shipping_address: shippingAddress,
          amount_cents: product.price_cents,
          currency: product.currency,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order');
      }

      setPaymentIntentId(data.payment_intent.id);
      setCurrentStep('payment');
    } catch (error) {
      onError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      if (!paymentIntentId) {
        throw new Error('Payment intent not found');
      }

      // Confirm payment
      const response = await fetch('/api/orders/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_intent_id: paymentIntentId,
          payment_method: {
            type: 'card',
            card: {
              number: paymentMethod.number,
              exp_month: parseInt(paymentMethod.exp_month),
              exp_year: parseInt(paymentMethod.exp_year),
              cvc: paymentMethod.cvc,
            },
          },
          return_url: window.location.origin + '/order-confirmation',
        }),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess(data.order_details);
      } else {
        throw new Error(data.error || 'Payment failed');
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-3">
            {product.image_urls[0] && (
              <img
                src={product.image_urls[0]}
                alt={product.name}
                className="w-16 h-16 object-cover rounded-lg"
              />
            )}
            <div className="flex-1">
              <h3 className="font-medium">{product.name}</h3>
              <p className="text-sm text-muted-foreground">{shop.title}</p>
            </div>
          </div>
          <div className="flex justify-between items-center pt-2 border-t">
            <span className="font-medium">Total</span>
            <span className="font-bold text-lg">
              ${formatPrice(product.price_cents)} {product.currency.toUpperCase()}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Customer Details Form */}
      {currentStep === 'details' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Customer Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCustomerDetailsSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={customerDetails.email}
                  onChange={(e) =>
                    setCustomerDetails({ ...customerDetails, email: e.target.value })
                  }
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  required
                  value={customerDetails.name}
                  onChange={(e) =>
                    setCustomerDetails({ ...customerDetails, name: e.target.value })
                  }
                  placeholder="John Doe"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={customerDetails.phone}
                  onChange={(e) =>
                    setCustomerDetails({ ...customerDetails, phone: e.target.value })
                  }
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="space-y-3">
                <Label>Shipping Address</Label>
                <Input
                  placeholder="Street Address"
                  value={shippingAddress.line1}
                  onChange={(e) =>
                    setShippingAddress({ ...shippingAddress, line1: e.target.value })
                  }
                  required
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="City"
                    value={shippingAddress.city}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, city: e.target.value })
                    }
                    required
                  />
                  <Input
                    placeholder="State"
                    value={shippingAddress.state}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, state: e.target.value })
                    }
                    required
                  />
                </div>
                <Input
                  placeholder="ZIP Code"
                  value={shippingAddress.postal_code}
                  onChange={(e) =>
                    setShippingAddress({ ...shippingAddress, postal_code: e.target.value })
                  }
                  required
                />
              </div>

              <Button type="submit" disabled={isProcessing} className="w-full" size="lg">
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Continue to Payment'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Payment Form */}
      {currentStep === 'payment' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <CreditCard className="mr-2 h-5 w-5" />
              Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center">
                <Lock className="mr-2 h-4 w-4 text-amber-600" />
                <span className="text-sm text-amber-800">
                  <Badge variant="secondary" className="mr-2">DEMO MODE</Badge>
                  This is a mock payment system for portfolio demonstration
                </span>
              </div>
            </div>

            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm text-blue-800">
                <strong>Test Cards:</strong>
                <ul className="mt-1 space-y-1">
                  <li>• 4242424242424242 (Success)</li>
                  <li>• 4000000000000002 (Decline)</li>
                  <li>• Any valid future date and 3-digit CVC</li>
                </ul>
              </div>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <Label htmlFor="card-number">Card Number</Label>
                <Input
                  id="card-number"
                  type="text"
                  required
                  maxLength={19}
                  value={paymentMethod.number}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
                    setPaymentMethod({ ...paymentMethod, number: value });
                  }}
                  placeholder="4242 4242 4242 4242"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="exp-month">Month</Label>
                  <Input
                    id="exp-month"
                    type="text"
                    required
                    maxLength={2}
                    value={paymentMethod.exp_month}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (parseInt(value) <= 12) {
                        setPaymentMethod({ ...paymentMethod, exp_month: value });
                      }
                    }}
                    placeholder="MM"
                  />
                </div>
                <div>
                  <Label htmlFor="exp-year">Year</Label>
                  <Input
                    id="exp-year"
                    type="text"
                    required
                    maxLength={4}
                    value={paymentMethod.exp_year}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setPaymentMethod({ ...paymentMethod, exp_year: value });
                    }}
                    placeholder="YYYY"
                  />
                </div>
                <div>
                  <Label htmlFor="cvc">CVC</Label>
                  <Input
                    id="cvc"
                    type="text"
                    required
                    maxLength={4}
                    value={paymentMethod.cvc}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setPaymentMethod({ ...paymentMethod, cvc: value });
                    }}
                    placeholder="123"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep('details')}
                  className="w-full"
                >
                  Back to Details
                </Button>
                <Button type="submit" disabled={isProcessing} className="w-full" size="lg">
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    `Pay $${formatPrice(product.price_cents)} ${product.currency.toUpperCase()}`
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}