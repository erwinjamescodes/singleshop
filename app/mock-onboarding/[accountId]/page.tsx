import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, CreditCard, Building, User, FileText } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { paymentProvider } from '@/lib/payment-provider';
import { redirect } from 'next/navigation';

interface PageProps {
  params: {
    accountId: string;
  };
}

export default async function MockOnboardingPage({ params }: PageProps) {
  const { accountId } = params;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Account Setup</h1>
          <p className="text-lg text-gray-600">Complete your seller account to start receiving payments</p>
          <Badge variant="secondary" className="mt-2">DEMO MODE</Badge>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="mr-2 h-5 w-5 text-amber-600" />
              Mock Onboarding Process
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800">
                This is a simulated payment account setup process for portfolio demonstration. 
                In a real application, this would integrate with Stripe Connect or similar payment processors.
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm">Account created successfully</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm">Business information verified</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm">Bank account linked</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm">Identity verification completed</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <User className="mr-2 h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Full Name</span>
                <span className="text-green-600">✓ Verified</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date of Birth</span>
                <span className="text-green-600">✓ Verified</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Address</span>
                <span className="text-green-600">✓ Verified</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phone Number</span>
                <span className="text-green-600">✓ Verified</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Building className="mr-2 h-5 w-5" />
                Business Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Business Type</span>
                <span className="text-green-600">✓ Individual</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax ID</span>
                <span className="text-green-600">✓ Verified</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Website</span>
                <span className="text-green-600">✓ Provided</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Product Category</span>
                <span className="text-green-600">✓ E-commerce</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Bank Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Account Holder</span>
              <span className="text-green-600">✓ Verified</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Routing Number</span>
              <span className="text-green-600">✓ Valid</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Account Number</span>
              <span className="text-green-600">✓ Verified</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Account Type</span>
              <span className="text-green-600">✓ Checking</span>
            </div>
          </CardContent>
        </Card>

        <form action={`/api/accounts/complete-onboarding`} method="POST">
          <input type="hidden" name="account_id" value={accountId} />
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-green-800">
                  Verification Complete!
                </h3>
                <p className="text-gray-600">
                  Your payment account has been successfully set up. You can now start accepting payments.
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-green-800 font-medium">Ready to accept payments</span>
                  </div>
                </div>
                <Button type="submit" size="lg" className="w-full">
                  Complete Setup & Return to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}