import { AuthButton } from "@/components/auth-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Zap, Globe } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Navigation */}
      <nav className="w-full border-b border-border/40 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-singleshop mx-auto flex justify-between items-center p-4 px-6">
          <Link href="/" className="text-xl font-bold text-singleshop-blue">
            SingleShop
          </Link>
          <div className="flex items-center gap-4">
            {!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-singleshop-light-blue to-white py-section">
        <div className="max-w-singleshop mx-auto px-6 text-center">
          <div className="animate-fade-in">
            <h1 className="text-hero font-extrabold text-gray-900 mb-6 leading-tight">
              Sell anything with just a link
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Turn your product into profit in 60 seconds. No store setup, no monthly fees, 
              just your own custom URL and instant sales.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-singleshop-blue to-blue-600 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:animate-lift"
              >
                <Link href="/auth/sign-up">
                  Start Selling Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-singleshop-blue text-singleshop-blue hover:bg-singleshop-blue hover:text-white px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-200"
              >
                See Live Example
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-singleshop mx-auto px-6 text-center">
          <p className="text-sm text-gray-600 mb-6">Trusted by 1,000+ creators, makers, and entrepreneurs</p>
          <div className="flex justify-center items-center gap-8 text-gray-400">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span className="text-sm font-medium">Artists</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              <span className="text-sm font-medium">Makers</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              <span className="text-sm font-medium">Coaches</span>
            </div>
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-section">
        <div className="max-w-singleshop mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-section text-gray-900 mb-6">
              Selling online shouldn't be this complicated
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center p-6 rounded-2xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-red-100 text-singleshop-red rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold">$</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Shopify is overkill</h3>
              <p className="text-gray-600">You have one product, not 1,000. Why pay $29/month for features you&apos;ll never use?</p>
            </div>
            
            <div className="text-center p-6 rounded-2xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-red-100 text-singleshop-red rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold">⏰</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Etsy takes forever</h3>
              <p className="text-gray-600">Set up your store, wait for approval, compete with millions of sellers. Just to sell your cookies?</p>
            </div>
            
            <div className="text-center p-6 rounded-2xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-red-100 text-singleshop-red rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold">📱</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Social links are clunky</h3>
              <p className="text-gray-600">Instagram bio links are clunky. TikTok doesn&apos;t let you sell. Twitter is just... Twitter.</p>
            </div>
          </div>

          <div className="text-center">
            <div className="inline-block p-8 bg-gradient-to-r from-singleshop-light-blue to-white rounded-2xl shadow-lg">
              <h3 className="text-2xl font-bold text-singleshop-blue mb-2">
                SingleShop gives you one simple link to sell anything
              </h3>
              <p className="text-lg text-gray-600">Share it everywhere, get paid instantly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-section bg-gray-50">
        <div className="max-w-singleshop mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-section text-gray-900 mb-6">
              From idea to income in 3 steps
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center animate-slide-up">
              <div className="w-16 h-16 bg-singleshop-blue text-white rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Claim your link</h3>
              <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300 mb-4">
                <code className="text-singleshop-blue font-mono">singleshop.com/yourname</code>
              </div>
              <p className="text-gray-600">Pick your custom URL in seconds</p>
            </div>
            
            <div className="text-center animate-slide-up" style={{animationDelay: '0.1s'}}>
              <div className="w-16 h-16 bg-singleshop-blue text-white rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Add your product</h3>
              <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300 mb-4">
                <div className="w-full h-20 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                  📸 Upload Photo
                </div>
              </div>
              <p className="text-gray-600">Photo, description, price. That&apos;s it.</p>
            </div>
            
            <div className="text-center animate-slide-up" style={{animationDelay: '0.2s'}}>
              <div className="w-16 h-16 bg-singleshop-blue text-white rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Share and sell</h3>
              <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300 mb-4">
                <div className="flex justify-center gap-2">
                  <span className="text-blue-500">📘</span>
                  <span className="text-pink-500">📷</span>
                  <span className="text-blue-400">🐦</span>
                </div>
              </div>
              <p className="text-gray-600">Post everywhere. Get paid automatically.</p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Button
              asChild
              size="lg"
              className="bg-singleshop-blue hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Link href="/auth/sign-up">Try it free right now</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-section bg-singleshop-blue text-white">
        <div className="max-w-singleshop mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to turn your product into profit?</h2>
          <p className="text-xl text-blue-100 mb-8">Join 1,000+ creators already selling with SingleShop</p>
          <Button
            asChild
            size="lg"
            className="bg-white text-singleshop-blue hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Link href="/auth/sign-up">Start Your Shop Now - It's Free</Link>
          </Button>
          <div className="flex justify-center gap-6 mt-6 text-sm text-blue-200">
            <span>✓ No credit card required</span>
            <span>✓ Set up in 60 seconds</span>
            <span>✓ Cancel anytime</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-900 text-white">
        <div className="max-w-singleshop mx-auto px-6 text-center">
          <p className="text-gray-400">
            © 2024 SingleShop. Built with ❤️ for creators everywhere.
          </p>
        </div>
      </footer>
    </main>
  );
}
