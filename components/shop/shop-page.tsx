"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  Heart,
  Share2,
  Star,
  Shield,
  Truck,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { BuyButton } from "./buy-button";
import SocialSharing from "./social-sharing";

interface ShopPageProps {
  shop: any;
}

export function ShopPage({ shop }: ShopPageProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const product = shop.products?.[0];
  const profile = shop.profiles;

  // Track analytics
  useEffect(() => {
    const trackPageView = async () => {
      try {
        // Get or create visitor ID
        let visitorId = localStorage.getItem("singleshop_visitor_id");
        if (!visitorId) {
          visitorId = `visitor_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 9)}`;
          localStorage.setItem("singleshop_visitor_id", visitorId);
        }

        await fetch("/api/analytics/track", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            shop_id: shop.id,
            event_type: "shop_view",
            visitor_id: visitorId,
            metadata: {
              page: "shop",
              product_id: product?.id,
              referrer: document.referrer || null,
              user_agent: navigator.userAgent,
            },
          }),
        });
      } catch (error) {
        console.error("Failed to track page view:", error);
      }
    };

    trackPageView();
  }, [shop.id, product?.id]);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {profile?.avatar_url && (
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name || shop.slug}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-md"
                />
              )}
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {profile?.display_name || shop.slug}
                </h1>
                <p className="text-sm text-gray-500">Premium Shop</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button className="p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
                <Heart className="h-5 w-5" />
              </button>
              {/* <button className="p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
                <Share2 className="h-5 w-5" />
              </button> */}
              <SocialSharing
                productName={product.name}
                productDescription={product.description || ""}
                productPrice={product.price_cents}
                shopUrl={`/${shop.slug}`}
                productImage={product.image_urls?.[0]}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Product Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-6">
            {images.length > 0 ? (
              <>
                {/* Main Image */}
                <div className="aspect-square bg-white  shadow-sm overflow-hidden border border-gray-100 rounded-none">
                  <img
                    src={images[selectedImageIndex]}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Thumbnail Images */}
                {images.length > 1 && (
                  <div className="flex space-x-3 overflow-x-auto pb-2">
                    {images.map((image: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-3 transition-all duration-200 ${
                          selectedImageIndex === index
                            ? "border-black shadow-lg scale-105"
                            : "border-gray-200 hover:border-gray-300"
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
              <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center shadow-inner">
                <ShoppingCart className="h-20 w-20 text-gray-400" />
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            {/* Product Header */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge
                  variant={product.is_available ? "default" : "secondary"}
                  className="px-4 py-1 text-sm font-medium"
                >
                  {product.is_available ? "✨ In Stock" : "❌ Sold Out"}
                </Badge>
                <div className="flex items-center space-x-1 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                  <span className="text-sm text-gray-600 ml-2">(4.9)</span>
                </div>
              </div>

              <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                {product.name}
              </h1>

              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-bold text-black">${price}</span>
                <span className="text-lg text-gray-500 line-through">
                  ${((product.price_cents / 100) * 1.3).toFixed(2)}
                </span>
                <Badge variant="destructive" className="ml-2">
                  23% OFF
                </Badge>
              </div>

              {product.description && (
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed text-lg">
                    {product.description}
                  </p>
                </div>
              )}
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-4 py-6 border-y border-gray-100">
              <div className="text-center">
                <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Secure</p>
                <p className="text-xs text-gray-600">Payment</p>
              </div>
              <div className="text-center">
                <Truck className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Fast</p>
                <p className="text-xs text-gray-600">Delivery</p>
              </div>
              <div className="text-center">
                <RotateCcw className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Easy</p>
                <p className="text-xs text-gray-600">Returns</p>
              </div>
            </div>

            {/* Purchase Section */}
            <div className="bg-white  shadow-sm border border-gray-100 p-8 rounded-none">
              <div className="space-y-6">
                {product.inventory_count !== null && (
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      Stock Level
                    </p>
                    <p
                      className={`text-sm font-medium ${
                        product.inventory_count > 10
                          ? "text-green-600"
                          : product.inventory_count > 0
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {product.inventory_count > 0
                        ? `${product.inventory_count} available`
                        : "Out of stock"}
                    </p>
                  </div>
                )}

                <BuyButton
                  product={product}
                  shop={shop}
                  disabled={
                    !product.is_available || product.inventory_count === 0
                  }
                />

                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Secure checkout</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Instant confirmation</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Direct from seller</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span>Money-back guarantee</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Sharing */}
            {/* <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Share this product</h3>
              <SocialSharing
                productName={product.name}
                productDescription={product.description || ''}
                productPrice={product.price_cents}
                shopUrl={`/${shop.slug}`}
                productImage={product.image_urls?.[0]}
              />
            </div> */}

            {/* Seller Info */}
            {profile?.bio && (
              <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
                <div className="flex items-start space-x-4">
                  {profile?.avatar_url && (
                    <img
                      src={profile.avatar_url}
                      alt={profile.display_name || shop.slug}
                      className="w-16 h-16 rounded-full object-cover ring-4 ring-white shadow-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      About {profile.display_name || shop.slug}
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {profile.bio}
                    </p>
                    <div className="mt-4 flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Verified Seller</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Star className="w-4 h-4 fill-current text-yellow-400" />
                        <span>4.9 Rating</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-black text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <div className="mb-6">
            <h3 className="text-2xl font-bold mb-2">
              Create Your Premium Shop
            </h3>
            <p className="text-gray-300 text-lg">
              Join thousands of sellers creating beautiful product pages
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center px-8 py-4 bg-white text-black font-semibold rounded-full hover:bg-gray-100 transition-colors shadow-lg"
          >
            Start Your Shop →
          </Link>
          <p className="text-gray-400 mt-6 text-sm">
            Powered by SingleShop - The future of single product commerce
          </p>
        </div>
      </footer>
    </div>
  );
}
