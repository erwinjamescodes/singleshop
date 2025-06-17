# SingleShop PRD & Implementation Plan

## Product Overview

**Product Name:** SingleShop  
**Tagline:** "Your product, your link, your success"  
**Vision:** Enable anyone to sell their single product online with a custom URL in under 60 seconds

### Problem Statement

- **For Creators:** Shopify is overkill and expensive for selling one product
- **For Small Sellers:** Etsy takes huge cuts and you don't own your audience
- **For Influencers:** Limited monetization options beyond affiliate links
- **For Everyone:** Setting up e-commerce is too complex for simple sales

### Solution

A dead-simple platform where users get their own custom shop URL (`singleshop.com/username`) to sell one product with zero setup complexity.

---

## Target Users

### Primary: Creator Economy

- **Digital Creators:** Selling courses, ebooks, templates
- **Physical Product Makers:** Handmade items, art prints, specialty foods
- **Service Providers:** Consultations, coaching sessions
- **Influencers:** Monetizing their audience with signature products

### Secondary: Small Business Testing

- **New Entrepreneurs:** Testing product-market fit
- **Existing Businesses:** Testing new products
- **Event-based Sales:** Limited edition or seasonal items

---

## Core Features & User Stories

### Seller Journey

```
As a seller, I want to:
- Create my shop in under 2 minutes
- Get a clean, professional storefront at singleshop.com/myname
- Upload my product with photos and description
- Set my price and connect my payment method
- Share my link and start selling immediately
- Get notified when someone buys
- Track my sales and earnings
- Get paid directly to my bank account
```

### Buyer Journey

```
As a buyer, I want to:
- Discover products through social media links
- See a clean, mobile-friendly product page
- Trust the checkout process
- Pay quickly with Apple Pay/Google Pay/Card
- Get immediate confirmation and receipts
- Receive order updates and tracking
- Have a way to contact the seller if needed
```

---

## Technical Architecture

### Tech Stack

- **Frontend/Backend:** Next.js 14 (App Router) with TypeScript
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Payments:** Mock Stripe System (production-ready architecture)
- **File Storage:** Supabase Storage
- **Deployment:** Vercel
- **Styling:** Tailwind CSS
- **Forms:** React Hook Form + Zod validation

### Database Schema

```sql
-- Users table (managed by Supabase Auth)
-- Additional user data
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  payment_account_id TEXT, -- Mock payment account ID
  payment_onboarded BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shops table
CREATE TABLE shops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL, -- the username part of URL
  title TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table (one per shop for MVP)
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL, -- store in cents
  currency TEXT DEFAULT 'USD',
  image_urls TEXT[], -- array of image URLs
  is_available BOOLEAN DEFAULT TRUE,
  inventory_count INTEGER, -- NULL = unlimited
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID REFERENCES shops(id),
  product_id UUID REFERENCES products(id),
  payment_intent_id TEXT UNIQUE NOT NULL, -- Mock payment intent ID
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,
  shipping_address JSONB, -- store full address as JSON
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending', -- pending, paid, shipped, delivered, cancelled
  tracking_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics table (for seller dashboard)
CREATE TABLE analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID REFERENCES shops(id),
  event_type TEXT NOT NULL, -- 'view', 'add_to_cart', 'purchase', etc.
  visitor_id TEXT, -- anonymous visitor tracking
  metadata JSONB, -- flexible event data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### App Structure

```
src/
├── app/
│   ├── (marketing)/
│   │   ├── page.tsx           # Landing page
│   │   ├── pricing/
│   │   ├── features/
│   │   ├── examples/
│   │   └── about/
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   ├── shop/
│   │   └── orders/
│   ├── [username]/
│   │   └── page.tsx        # Public shop pages
│   ├── api/
│   │   ├── stripe/
│   │   └── webhooks/
│   └── globals.css
├── components/
│   ├── ui/                 # Reusable UI components
│   ├── marketing/          # Landing page components
│   ├── shop/              # Shop-specific components
│   └── dashboard/         # Dashboard components
├── lib/
│   ├── supabase.ts
│   ├── mock-stripe.ts       # Mock payment system
│   ├── payment-provider.ts  # Payment abstraction layer
│   └── utils.ts
└── types/
    └── database.ts
```

---

## Implementation Plan

## Phase 1: Foundation (Week 1-2)

**Goal:** Basic shop creation and product display

### Week 1: Setup & Landing Page

- [x] Next.js 14 project setup with TypeScript
- [x] Supabase project setup and database schema
- [x] Landing page design and development
- [x] Marketing site pages (pricing, features, examples)
- [x] Responsive design and mobile optimization
- [x] SEO optimization and meta tags

### Week 2: Auth & Shop Creation

- [x] Supabase Auth integration (email/password)
- [x] Basic UI components with Tailwind
- [x] User profile creation flow
- [x] Username validation and reservation
- [x] Shop creation form and validation
- [x] Product creation form with image upload

**Deliverable:** Landing page, authentication system, and basic shop creation flow

---

## Phase 2: Payments & Orders (Week 3-4) ✅ COMPLETED

**Goal:** End-to-end purchase flow

### Week 3: Public Pages & Payment System

- [x] Public shop page (`/[username]`) development
- [x] Shop page responsive design and optimization
- [x] Mock Stripe payment system development
- [x] Payment provider abstraction layer
- [x] Seller payment account setup (simulated)
- [x] Basic image optimization and CDN setup

### Week 4: Purchase Flow & Orders

- [x] Product purchase flow with mock checkout
- [x] Payment confirmation handling
- [x] Order creation and tracking system
- [x] Automated email notifications (mock system with console logging)
- [x] Customer order confirmation pages
- [x] Basic error handling and loading states

**Deliverable:** Complete purchase flow from product view to payment confirmation ✅ **DELIVERED**

---

## Phase 3: Dashboard & Features (Week 5-6)

**Goal:** Seller tools and user experience polish

### Week 5: Seller Dashboard

- [x] Sales analytics dashboard
- [x] Revenue tracking and payouts
- [x] Product editing and management
- [x] Order fulfillment tools
- [x] Profile and shop customization

### Week 6: Enhanced Features

- [x] Multiple product images
- [x] Inventory management
- [x] Customer messaging system
- [x] Social sharing optimization
- [x] Mobile app-like experience (PWA)

**Deliverable:** Feature-complete seller dashboard with analytics

---

## Phase 4: Polish & Launch (Week 7-8)

**Goal:** Production-ready platform

### Week 7: Quality & Performance

- [ ] Comprehensive error handling
- [ ] Loading states and skeleton screens
- [ ] Image optimization and lazy loading
- [ ] SEO optimization for shop pages
- [ ] Performance monitoring setup

### Week 8: Launch Preparation

- [ ] Demo shops with sample products
- [ ] Landing page and marketing site
- [ ] Documentation and help center
- [ ] Beta user onboarding
- [ ] Monitoring and analytics setup

**Deliverable:** Production-ready platform with demo content

---

## Revenue Model

### Transaction Fees (Simulated for Demo)

- **Free Tier:** 5% per transaction (displayed in analytics)
- **Pro Tier:** 3% per transaction + $9/month

### Pro Features ($9/month)

- Custom domain mapping (`yourname.com` instead of `singleshop.com/yourname`)
- Advanced analytics and insights
- Priority customer support
- Remove SingleShop branding
- Multiple product variants (size, color)
- Automated follow-up emails

### Future Revenue Streams (Real Implementation)

- Integration with real payment processors (Stripe, PayMongo, etc.)
- Marketplace discovery features
- Advanced marketing tools
- Inventory management integrations
- White-label solutions

---

## Success Metrics

### MVP Success (First 3 Months)

- **100 active shops** created
- **$10,000 GMV** (Gross Merchandise Value) processed
- **10% month-over-month growth** in new shop creation
- **80% user retention** after first sale

### Growth Metrics

- **Conversion Rate:** Shop views → Purchases
- **Seller Retention:** Active shops after 30/60/90 days
- **Revenue per User:** Average monthly revenue per seller
- **Net Promoter Score:** User satisfaction and referrals

---

## Risk Assessment & Mitigation

### Technical Risks

- **Payment System Transition:** Mock to production payment processor migration strategy
- **Database Performance:** Supabase scaling, query optimization
- **Security Vulnerabilities:** Regular security audits, input validation

### Business Risks

- **Payment Processor Integration:** Plan for multiple payment providers (Stripe, PayMongo, etc.)
- **Competition from Shopify/Gumroad:** Focus on simplicity and single-product use case
- **Demo vs Production Gap:** Clear migration path from mock to real payments

### Mitigation Strategies

- Comprehensive error logging and monitoring
- Regular database backups
- Payment provider abstraction layer for easy swapping
- Environment-based configuration for demo/production modes
- User feedback loops and rapid iteration

---

## Launch Strategy

### Pre-Launch (Week 6-7)

- Build email waitlist
- Create demo shops in various niches
- Reach out to creator communities
- Content marketing (blog posts, tutorials)

### Soft Launch (Week 8)

- Invite 50 beta users from network
- Gather feedback and iterate
- Create case studies and testimonials
- Refine onboarding process

### Public Launch (Week 9-10)

- Product Hunt launch
- Social media campaign
- Influencer partnerships
- Press outreach to startup media

---

## Future Roadmap (Post-MVP)

### Phase 5: Advanced Features

- Multiple product support
- Subscription products
- Digital product delivery
- Affiliate program
- Mobile app

### Phase 6: Marketplace

- Product discovery features
- Category browsing
- Search functionality
- Featured products
- Seller verification badges

### Phase 7: Enterprise

- White-label solutions
- API for integrations
- Advanced analytics
- Multi-user accounts
- Enterprise support

---

## Mock Payment System Architecture

### Design Philosophy

The payment system is built with a clean abstraction layer that allows seamless transition from mock payments (for portfolio demonstration) to production payment processors. This approach demonstrates:

- **Production-ready architecture** without requiring live payment accounts
- **Clean separation of concerns** between business logic and payment processing
- **Easy testing and development** with realistic payment flows
- **Scalable design** that supports multiple payment providers

### Mock Payment Features

#### Realistic Payment Flow

- **Payment Intent Creation:** Simulates Stripe's payment intent pattern
- **Card Processing:** Mock credit card validation and processing delays
- **Success/Failure Scenarios:** 90% success rate with realistic error messages
- **Receipt Generation:** Mock receipt URLs and confirmation emails
- **Order Tracking:** Complete order lifecycle from payment to fulfillment

#### Seller Account Simulation

- **Account Creation:** Mock seller account setup process
- **Onboarding Flow:** Simulates KYC and verification requirements
- **Payout Tracking:** Mock earnings and payout schedules
- **Account Status:** Pending, active, and restricted account states

#### Demo-Friendly Features

- **Instant Processing:** No real API delays for better demo experience
- **Predictable Outcomes:** Controlled success/failure for demonstrations
- **Test Data Generation:** Automatic mock transaction history
- **Clear Demo Indicators:** Obvious visual cues that this is demo mode

### Implementation Benefits

#### For Portfolio Showcase

- **Complete E-commerce Flow:** Full purchase experience without real money
- **Architecture Demonstration:** Shows understanding of payment system design
- **Problem-Solving Skills:** Creative solution to geographic payment limitations
- **Production Mindset:** Built for easy migration to real payment systems

#### For Development

- **Fast Iteration:** No API rate limits or webhook setup required
- **Consistent Testing:** Predictable payment outcomes for testing
- **Offline Development:** Works without internet connectivity
- **Cost-Free:** No transaction fees during development

### Migration Strategy to Production

```typescript
// Environment-based payment provider selection
const paymentProvider =
  process.env.PAYMENT_PROVIDER === "stripe"
    ? new StripeProvider()
    : process.env.PAYMENT_PROVIDER === "paymongo"
    ? new PayMongoProvider()
    : new MockProvider();
```

**Migration Steps:**

1. **Environment Configuration:** Set production payment provider
2. **API Key Setup:** Add real payment processor credentials
3. **Webhook Configuration:** Set up real payment event handling
4. **Testing Phase:** Gradual rollout with test transactions
5. **Go Live:** Switch environment variables for production

This architecture ensures that moving from demo to production requires minimal code changes while maintaining the same user experience and business logic.
