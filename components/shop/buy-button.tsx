"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import CheckoutModal from "@/components/checkout-modal";

interface Product {
  id: string;
  name: string;
  price_cents: number;
  inventory_count: number | null;
  is_available: boolean;
}

interface Shop {
  id: string;
  title: string;
  slug: string;
}

interface BuyButtonProps {
  product: Product;
  shop: Shop;
  disabled?: boolean;
}

export function BuyButton({ product, shop, disabled }: BuyButtonProps) {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Check if product is out of stock
  const isOutOfStock = disabled || 
    (product.inventory_count !== null && product.inventory_count <= 0) ||
    !product.is_available;

  const handleBuyNow = () => {
    setIsCheckoutOpen(true);
  };

  return (
    <>
      <Button
        onClick={handleBuyNow}
        disabled={isOutOfStock}
        className="w-full h-12 bg-gradient-to-r from-singleshop-blue to-blue-600 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:animate-lift"
        size="lg"
      >
        {isOutOfStock ? (
          'Out of Stock'
        ) : (
          <>
            <ShoppingCart className="h-4 w-4 mr-2" />
            Buy Now - ${(product.price_cents / 100).toFixed(2)}
          </>
        )}
      </Button>

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        product={product}
        shop={shop}
      />
    </>
  );
}