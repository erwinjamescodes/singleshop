"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Heart, Share2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { BuyButton } from "./buy-button";

interface ShopPageProps {
  shop: any;
}

export function ShopPage({ shop }: ShopPageProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const product = shop.products?.[0];
  const profile = shop.profiles;

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {profile?.display_name || shop.slug}&apos;s Shop
          </h1>
          <p className="text-gray-600">No products available at the moment.</p>
        </div>
      </div>
    );
  }

  const images = product.image_urls || [];
  const price = (product.price_cents / 100).toFixed(2);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-singleshop-blue">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Back to SingleShop</span>
            </Link>
            
            <div className="text-center">
              <h1 className="font-bold text-gray-900">
                {profile?.display_name || shop.slug}
              </h1>
              <p className="text-sm text-gray-600">singleshop.com/{shop.slug}</p>
            </div>
            
            <button className="p-2 text-gray-600 hover:text-singleshop-blue">
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Product Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            {images.length > 0 ? (
              <>
                {/* Main Image */}
                <div className="aspect-square bg-white rounded-2xl shadow-lg overflow-hidden">
                  <img
                    src={images[selectedImageIndex]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Thumbnail Images */}
                {images.length > 1 && (
                  <div className="flex space-x-2 overflow-x-auto">
                    {images.map((image: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                          selectedImageIndex === index 
                            ? 'border-singleshop-blue' 
                            : 'border-gray-200'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="aspect-square bg-gray-200 rounded-2xl flex items-center justify-center">
                <ShoppingCart className="h-16 w-16 text-gray-400" />
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Badge variant={product.is_available ? "default" : "secondary"}>
                  {product.is_available ? "Available" : "Sold Out"}
                </Badge>
                <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                  <Heart className="h-5 w-5" />
                </button>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              
              <div className="text-3xl font-bold text-singleshop-blue mb-4">
                ${price}
              </div>

              {product.description && (
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-600 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}
            </div>

            {/* Purchase Section */}
            <Card className="border-2 border-gray-200">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {product.inventory_count !== null && (
                    <p className="text-sm text-gray-600">
                      {product.inventory_count > 0 
                        ? `${product.inventory_count} left in stock`
                        : 'Out of stock'
                      }
                    </p>
                  )}
                  
                  <BuyButton 
                    product={product}
                    shop={shop}
                    disabled={!product.is_available || product.inventory_count === 0}
                  />
                  
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>✓ Secure checkout</p>
                    <p>✓ Instant confirmation</p>
                    <p>✓ Direct from seller</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seller Info */}
            {profile?.bio && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    About {profile.display_name || shop.slug}
                  </h3>
                  <p className="text-gray-600">{profile.bio}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <p className="text-gray-600 mb-2">
            Powered by{" "}
            <Link href="/" className="font-semibold text-singleshop-blue hover:text-blue-700">
              SingleShop
            </Link>
          </p>
          <p className="text-sm text-gray-500">
            Create your own shop in 60 seconds
          </p>
        </div>
      </footer>
    </div>
  );
}