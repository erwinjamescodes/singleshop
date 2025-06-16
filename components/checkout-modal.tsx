'use client';

import { useState } from 'react';
import { X, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CheckoutForm from './checkout-form';

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

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  shop: Shop;
}

export default function CheckoutModal({ isOpen, onClose, product, shop }: CheckoutModalProps) {
  const [checkoutState, setCheckoutState] = useState<'checkout' | 'success' | 'error'>('checkout');
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const handleSuccess = (details: OrderDetails) => {
    setOrderDetails(details);
    setCheckoutState('success');
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setCheckoutState('error');
  };

  const handleClose = () => {
    setCheckoutState('checkout');
    setOrderDetails(null);
    setError('');
    onClose();
  };

  const handleRetry = () => {
    setCheckoutState('checkout');
    setError('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">
            {checkoutState === 'checkout' && 'Checkout'}
            {checkoutState === 'success' && 'Order Confirmed!'}
            {checkoutState === 'error' && 'Payment Failed'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {checkoutState === 'checkout' && (
            <CheckoutForm
              product={product}
              shop={shop}
              onSuccess={handleSuccess}
              onError={handleError}
            />
          )}

          {checkoutState === 'success' && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  Payment Successful!
                </h3>
                <p className="text-gray-600">
                  Your order has been confirmed and you'll receive an email receipt shortly.
                </p>
              </div>

              {orderDetails && (
                <div className="bg-gray-50 rounded-lg p-4 text-left space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-mono text-sm">{orderDetails.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Product:</span>
                    <span>{orderDetails.product_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-semibold">
                      ${(orderDetails.amount_cents / 100).toFixed(2)} {orderDetails.currency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span>{orderDetails.customer_email}</span>
                  </div>
                </div>
              )}

              <Button onClick={handleClose} className="w-full" size="lg">
                Close
              </Button>
            </div>
          )}

          {checkoutState === 'error' && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-red-800 mb-2">
                  Payment Failed
                </h3>
                <p className="text-gray-600 mb-4">
                  {error || 'There was an issue processing your payment. Please try again.'}
                </p>
                
                <div className="space-y-3">
                  <Button onClick={handleRetry} className="w-full" size="lg">
                    Try Again
                  </Button>
                  <Button onClick={handleClose} variant="outline" className="w-full">
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}