"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface SetupFormProps {
  user: User;
}

export function SetupForm({ user }: SetupFormProps) {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const checkUsername = async (value: string) => {
    if (!value || value.length < 3) {
      setUsernameStatus('idle');
      return;
    }

    // Basic validation
    if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
      setUsernameStatus('idle');
      return;
    }

    setUsernameStatus('checking');
    
    const supabase = createClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', value.toLowerCase())
      .single();

    if (error && error.code === 'PGRST116') {
      // No rows returned means username is available
      setUsernameStatus('available');
    } else if (data) {
      setUsernameStatus('taken');
    } else {
      setUsernameStatus('idle');
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-zA-Z0-9_-]/g, '');
    setUsername(value);
    
    // Debounce username check
    const timeoutId = setTimeout(() => checkUsername(value), 500);
    return () => clearTimeout(timeoutId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (usernameStatus !== 'available') {
      setError('Please choose an available username');
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      
      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          username: username.toLowerCase(),
          display_name: displayName || username,
        });

      if (profileError) throw profileError;

      // Create shop
      const { error: shopError } = await supabase
        .from('shops')
        .insert({
          user_id: user.id,
          slug: username.toLowerCase(),
          title: `${displayName || username}'s Shop`,
          description: 'Welcome to my shop!',
        });

      if (shopError) throw shopError;

      router.push('/dashboard');
    } catch (error: any) {
      setError(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const getUsernameStatusIcon = () => {
    switch (usernameStatus) {
      case 'checking':
        return <Loader2 className="h-4 w-4 animate-spin text-gray-400" />;
      case 'available':
        return <CheckCircle className="h-4 w-4 text-singleshop-green" />;
      case 'taken':
        return <AlertCircle className="h-4 w-4 text-singleshop-red" />;
      default:
        return null;
    }
  };

  const getUsernameStatusText = () => {
    switch (usernameStatus) {
      case 'checking':
        return 'Checking availability...';
      case 'available':
        return 'Username is available!';
      case 'taken':
        return 'Username is already taken';
      default:
        return '';
    }
  };

  return (
    <Card className="border-0 shadow-xl bg-white rounded-2xl">
      <CardHeader className="text-center pb-8">
        <CardTitle className="text-2xl font-bold text-gray-900">
          Claim Your Shop URL
        </CardTitle>
      </CardHeader>
      <CardContent className="px-8 pb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="username" className="text-sm font-medium text-gray-700">
              Choose your shop username
            </Label>
            <div className="relative">
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-lg border-2 border-r-0 border-gray-200 bg-gray-50 text-gray-500 text-sm">
                  singleshop.com/
                </span>
                <Input
                  id="username"
                  type="text"
                  placeholder="yourname"
                  value={username}
                  onChange={handleUsernameChange}
                  className="h-12 rounded-l-none border-2 border-gray-200 focus:border-singleshop-blue focus:ring-2 focus:ring-singleshop-blue/20 focus:ring-offset-0"
                  required
                  minLength={3}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {getUsernameStatusIcon()}
                </div>
              </div>
              {usernameStatus !== 'idle' && (
                <p className={`text-xs mt-1 ${
                  usernameStatus === 'available' ? 'text-singleshop-green' : 
                  usernameStatus === 'taken' ? 'text-singleshop-red' : 'text-gray-500'
                }`}>
                  {getUsernameStatusText()}
                </p>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Your shop will be available at singleshop.com/{username || 'yourname'}
            </p>
          </div>

          <div className="space-y-3">
            <Label htmlFor="displayName" className="text-sm font-medium text-gray-700">
              Display name (optional)
            </Label>
            <Input
              id="displayName"
              type="text"
              placeholder="Your Name or Business"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="h-12 px-4 border-2 border-gray-200 rounded-lg focus:border-singleshop-blue focus:ring-2 focus:ring-singleshop-blue/20 focus:ring-offset-0"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading || usernameStatus !== 'available' || !username}
            className="w-full h-12 bg-gradient-to-r from-singleshop-blue to-blue-600 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:animate-lift disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Creating Your Shop...
              </>
            ) : (
              'Create My Shop'
            )}
          </Button>
        </form>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">What happens next?</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>✓ Your shop URL will be reserved</li>
            <li>✓ You'll get access to your dashboard</li>
            <li>✓ You can add your first product immediately</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}