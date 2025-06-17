'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Download,
  CreditCard,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface RevenueTrackingProps {
  analytics: any;
}

export default function RevenueTracking({ analytics }: RevenueTrackingProps) {
  const [payoutStatus, setPayoutStatus] = useState({
    available_balance: 0,
    pending_balance: 0,
    last_payout: null as Date | null,
    next_payout: null as Date | null,
  });

  useEffect(() => {
    // Calculate mock payout data
    const totalRevenue = analytics.revenue || 0;
    const platformFee = totalRevenue * 0.05; // 5% platform fee
    const availableBalance = totalRevenue - platformFee;
    
    setPayoutStatus({
      available_balance: availableBalance,
      pending_balance: 0,
      last_payout: totalRevenue > 0 ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) : null,
      next_payout: totalRevenue > 0 ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null,
    });
  }, [analytics]);

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Revenue & Payouts</h2>
        <p className="text-muted-foreground">Track your earnings and payout schedule</p>
      </div>

      {/* Revenue Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(analytics.revenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(payoutStatus.available_balance)}
            </div>
            <p className="text-xs text-muted-foreground">
              Ready for payout
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Fees</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency((analytics.revenue || 0) * 0.05)}
            </div>
            <p className="text-xs text-muted-foreground">
              5% transaction fee
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(payoutStatus.available_balance)}
            </div>
            <p className="text-xs text-muted-foreground">
              After fees
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payout Information */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Payout Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Payout Frequency</span>
              <Badge variant="outline">Weekly</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Last Payout</span>
              <span className="text-sm font-medium">
                {formatDate(payoutStatus.last_payout)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Next Payout</span>
              <span className="text-sm font-medium">
                {formatDate(payoutStatus.next_payout)}
              </span>
            </div>

            {payoutStatus.available_balance > 0 ? (
              <div className="pt-4 border-t">
                <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-800">
                    {formatCurrency(payoutStatus.available_balance)} will be paid out on {formatDate(payoutStatus.next_payout)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="pt-4 border-t">
                <div className="flex items-center space-x-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <Clock className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-800">
                    No pending payouts
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3 p-4 border rounded-lg">
              <CreditCard className="h-8 w-8 text-gray-400" />
              <div className="flex-1">
                <div className="font-medium">Bank Account</div>
                <div className="text-sm text-muted-foreground">••••••1234</div>
              </div>
              <Badge variant="default" className="bg-green-100 text-green-800">
                Verified
              </Badge>
            </div>

            <div className="text-sm text-muted-foreground">
              <p>Payouts are automatically sent to your connected bank account.</p>
              <p className="mt-2">
                <strong>Processing time:</strong> 1-3 business days
              </p>
            </div>

            <Button variant="outline" className="w-full">
              Update Payment Method
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Breakdown */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Revenue Breakdown</CardTitle>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold">{analytics.views || 0}</div>
                <div className="text-sm text-muted-foreground">Total Views</div>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold">
                  {analytics.conversion_rate ? analytics.conversion_rate.toFixed(1) : 0}%
                </div>
                <div className="text-sm text-muted-foreground">Conversion Rate</div>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold">
                  {formatCurrency(analytics.revenue || 0)}
                </div>
                <div className="text-sm text-muted-foreground">Average Order Value</div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-3">Fee Breakdown</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Gross Revenue</span>
                  <span>{formatCurrency(analytics.revenue || 0)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Platform Fee (5%)</span>
                  <span>-{formatCurrency((analytics.revenue || 0) * 0.05)}</span>
                </div>
                <div className="flex justify-between font-medium pt-2 border-t">
                  <span>Net Revenue</span>
                  <span>{formatCurrency(payoutStatus.available_balance)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Demo Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-blue-900">Demo Mode</h4>
              <p className="text-sm text-blue-800">
                This is a simulated revenue tracking system for portfolio demonstration. 
                In production, this would integrate with real payment processors and banking systems.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}