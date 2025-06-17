"use client";

import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";
import { User, ShoppingBag, BarChart3, Settings, Package } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface DashboardNavProps {
  user: SupabaseUser;
}

export function DashboardNav({ user }: DashboardNavProps) {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-singleshop mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="text-xl font-bold text-singleshop-blue">
              SingleShop
            </Link>
            
            <div className="hidden md:flex space-x-6">
              <Link 
                href="/dashboard" 
                className="flex items-center space-x-2 text-gray-600 hover:text-singleshop-blue transition-colors"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              <Link 
                href="/dashboard/product/manage" 
                className="flex items-center space-x-2 text-gray-600 hover:text-singleshop-blue transition-colors"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Product</span>
              </Link>
              <Link 
                href="/dashboard/orders" 
                className="flex items-center space-x-2 text-gray-600 hover:text-singleshop-blue transition-colors"
              >
                <Package className="h-4 w-4" />
                <span>Orders</span>
              </Link>
              <Link 
                href="/dashboard/settings" 
                className="flex items-center space-x-2 text-gray-600 hover:text-singleshop-blue transition-colors"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-3">
              <User className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">{user.email}</span>
            </div>
            <LogoutButton />
          </div>
        </div>
      </div>
    </nav>
  );
}