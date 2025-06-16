"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Loader2 } from "lucide-react";

interface BuyButtonProps {
  product: any;
  shop: any;
  disabled?: boolean;
}

export function BuyButton({ product, shop, disabled }: BuyButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleBuyNow = async () => {
    setIsLoading(true);
    
    // For Phase 1, we'll just show an alert
    // In Phase 2, this will trigger the mock payment flow
    setTimeout(() => {
      alert("Payment system coming in Phase 2! 🚀\n\nThis will integrate with our mock Stripe system to demonstrate the complete purchase flow.");
      setIsLoading(false);
    }, 1000);
  };

  return (
    <Button
      onClick={handleBuyNow}
      disabled={disabled || isLoading}
      className="w-full h-12 bg-gradient-to-r from-singleshop-blue to-blue-600 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:animate-lift"
      size="lg"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Processing...
        </>
      ) : disabled ? (
        'Out of Stock'
      ) : (
        <>
          <ShoppingCart className="h-4 w-4 mr-2" />
          Buy Now - ${(product.price_cents / 100).toFixed(2)}
        </>
      )}
    </Button>
  );
}