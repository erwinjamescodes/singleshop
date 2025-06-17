'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  DollarSign, 
  Eye, 
  Edit3,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Users,
  ShoppingCart,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';

interface ProductManagePageProps {
  product: any;
  shop: any;
}

export default function ProductManagePage({ product, shop }: ProductManagePageProps) {
  const [analytics, setAnalytics] = useState({
    views: 0,
    revenue: 0,
    conversion_rate: 0,
    daily_stats: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/analytics/dashboard?days=30');
        if (response.ok) {
          const data = await response.json();
          setAnalytics(data);
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const toggleProductAvailability = async () => {
    try {
      const response = await fetch('/api/products/toggle-availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: product.id,
          is_available: !product.is_available,
        }),
      });

      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to toggle availability:', error);
    }
  };

  if (!product) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Product Management</h1>
          <p className="text-muted-foreground">Manage your product details and performance</p>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Product Yet</h3>
            <p className="text-gray-600 text-center mb-6 max-w-md">
              Create your first product to start selling on SingleShop. It only takes a few minutes to get started.
            </p>
            <Button asChild size="lg">
              <Link href="/dashboard/product/new">
                <Package className="h-4 w-4 mr-2" />
                Create Product
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Product Management</h1>
          <p className="text-muted-foreground">Manage your product details and performance</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" asChild>
            <Link href={`/${shop.slug}`} target="_blank">
              <Eye className="h-4 w-4 mr-2" />
              View Shop
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/product/edit">
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Product
            </Link>
          </Button>
        </div>
      </div>

      {/* Product Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Product Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-6">
            <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
              {product.image_urls?.[0] ? (
                <img
                  src={product.image_urls[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package className="h-12 w-12 text-gray-400" />
              )}
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-bold">{product.name}</h2>
                <p className="text-muted-foreground mt-1">{product.description}</p>
              </div>

              <div className="flex items-center space-x-6">
                <div>
                  <Label className="text-sm text-muted-foreground">Price</Label>
                  <div className="text-2xl font-bold">${(product.price_cents / 100).toFixed(2)}</div>
                </div>
                
                <div>
                  <Label className="text-sm text-muted-foreground">Status</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant={product.is_available ? "default" : "secondary"}>
                      {product.is_available ? "Active" : "Inactive"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleProductAvailability}
                    >
                      {product.is_available ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground">Inventory</Label>
                  <div className="text-lg font-semibold">
                    {product.inventory_count === null ? 'Unlimited' : product.inventory_count}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : analytics.views.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : `$${(analytics.revenue / 100).toFixed(2)}`}
            </div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : `${analytics.conversion_rate.toFixed(1)}%`}
            </div>
            <p className="text-xs text-muted-foreground">
              Views to purchases
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(product.price_cents / 100).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Single product price
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <Button variant="outline" className="justify-start" asChild>
                <Link href="/dashboard/product/edit">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Product Details
                </Link>
              </Button>
              
              <Button variant="outline" className="justify-start" asChild>
                <Link href="/dashboard/orders">
                  <Package className="h-4 w-4 mr-2" />
                  View Orders
                </Link>
              </Button>
              
              <Button variant="outline" className="justify-start" asChild>
                <Link href="/dashboard/settings">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Shop Settings
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {product.inventory_count !== null ? (
              <>
                <div className="flex items-center justify-between">
                  <span>Current Stock</span>
                  <span className="font-semibold">{product.inventory_count} units</span>
                </div>
                
                {product.inventory_count <= 5 && product.inventory_count > 0 && (
                  <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm text-yellow-800">Low stock warning</span>
                  </div>
                )}
                
                {product.inventory_count === 0 && (
                  <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-800">Out of stock</span>
                  </div>
                )}
              </>
            ) : (
              <div className="text-sm text-muted-foreground">
                Inventory tracking is disabled for this product
              </div>
            )}
            
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/product/edit">
                <Package className="h-4 w-4 mr-2" />
                Manage Inventory
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Product Images */}
      {product.image_urls && product.image_urls.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Product Images</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {product.image_urls.map((url: string, index: number) => (
                <div key={index} className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={url}
                    alt={`${product.name} - Image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}