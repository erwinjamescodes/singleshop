"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Plus, Eye, DollarSign, ShoppingBag, TrendingUp, Package, Users } from "lucide-react";
import Link from "next/link";
import AnalyticsChart from "./analytics-chart";
import RevenueTracking from "./revenue-tracking";

interface DashboardContentProps {
  profile: any;
  shop: any;
  product: any;
}

export function DashboardContent({ profile, shop, product }: DashboardContentProps) {
  const shopUrl = `https://singleshop.com/${profile.username}`;
  const [analytics, setAnalytics] = useState({
    views: 0,
    revenue: 0,
    conversion_rate: 0,
    recent_events: [],
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {profile.display_name || profile.username}!
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your shop at{" "}
            <Link 
              href={`/${profile.username}`} 
              className="text-singleshop-blue hover:underline font-medium"
              target="_blank"
            >
              singleshop.com/{profile.username}
              <ExternalLink className="inline h-3 w-3 ml-1" />
            </Link>
          </p>
        </div>
        
        {!product && (
          <Button asChild className="bg-singleshop-blue hover:bg-blue-700">
            <Link href="/dashboard/product/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Product
            </Link>
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
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
      </div>

      {/* Analytics Charts */}
      {!loading && analytics.daily_stats.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Analytics Overview</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <AnalyticsChart
              dailyStats={analytics.daily_stats}
              title="Page Views"
              metric="views"
            />
            <AnalyticsChart
              dailyStats={analytics.daily_stats}
              title="Orders"
              metric="orders"
            />
            <AnalyticsChart
              dailyStats={analytics.daily_stats}
              title="Revenue"
              metric="revenue"
            />
          </div>
        </div>
      )}

      {/* Product Status */}
      <Card>
        <CardHeader>
          <CardTitle>Your Product</CardTitle>
        </CardHeader>
        <CardContent>
          {product ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                  {product.image_urls?.[0] ? (
                    <img 
                      src={product.image_urls[0]} 
                      alt={product.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <ShoppingBag className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{product.name}</h3>
                  <p className="text-gray-600">${(product.price_cents / 100).toFixed(2)}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant={product.is_available ? "default" : "secondary"}>
                      {product.is_available ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" asChild>
                  <Link href={`/${profile.username}`} target="_blank">
                    <Eye className="h-4 w-4 mr-2" />
                    View Shop
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/dashboard/product/edit">
                    Edit Product
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No product yet
              </h3>
              <p className="text-gray-600 mb-4">
                Add your first product to start selling
              </p>
              <Button asChild className="bg-singleshop-blue hover:bg-blue-700">
                <Link href="/dashboard/product/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Product
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {product && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" asChild className="justify-start h-auto p-4">
                <Link href={`/${profile.username}`} target="_blank">
                  <div className="text-left">
                    <div className="flex items-center space-x-2 mb-1">
                      <ExternalLink className="h-4 w-4" />
                      <span className="font-medium">View Your Shop</span>
                    </div>
                    <p className="text-sm text-gray-600">See how customers see your store</p>
                  </div>
                </Link>
              </Button>
              
              <Button variant="outline" asChild className="justify-start h-auto p-4">
                <Link href="/dashboard/product/edit">
                  <div className="text-left">
                    <div className="flex items-center space-x-2 mb-1">
                      <ShoppingBag className="h-4 w-4" />
                      <span className="font-medium">Edit Product</span>
                    </div>
                    <p className="text-sm text-gray-600">Update photos, price, or description</p>
                  </div>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Revenue Tracking */}
      {analytics.revenue > 0 && (
        <div className="mt-8">
          <RevenueTracking analytics={analytics} />
        </div>
      )}
    </div>
  );
}