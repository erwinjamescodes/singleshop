import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's shops
    const { data: shops, error: shopsError } = await supabase
      .from('shops')
      .select('id')
      .eq('user_id', user.id);

    if (shopsError) {
      console.error('Shops query error:', shopsError);
      return NextResponse.json(
        { error: 'Failed to fetch shops' },
        { status: 500 }
      );
    }

    if (!shops || shops.length === 0) {
      return NextResponse.json({
        views: 0,
        revenue: 0,
        conversion_rate: 0,
        recent_events: [],
        daily_stats: [],
      });
    }

    const shopIds = shops.map(shop => shop.id);

    // Get URL parameters for date range
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get analytics events
    const { data: events, error: eventsError } = await supabase
      .from('analytics_events')
      .select('*')
      .in('shop_id', shopIds)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (eventsError) {
      console.error('Events query error:', eventsError);
      return NextResponse.json(
        { error: 'Failed to fetch analytics events' },
        { status: 500 }
      );
    }

    // Get orders for revenue calculation
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('amount_cents, status, created_at')
      .in('shop_id', shopIds)
      .gte('created_at', startDate.toISOString());

    if (ordersError) {
      console.error('Orders query error:', ordersError);
    }

    // Calculate statistics
    const stats = {
      views: 0,
      revenue: 0,
      conversion_rate: 0,
      recent_events: [] as any[],
      daily_stats: [] as any[],
    };

    if (events) {
      // Count page views
      stats.views = events.filter(e => e.event_type === 'shop_view' || e.event_type === 'product_view').length;
      
      // Get recent events (last 10)
      stats.recent_events = events.slice(0, 10).map(event => ({
        id: event.id,
        type: event.event_type,
        timestamp: event.created_at,
        metadata: event.metadata
      }));
    }

    if (orders) {
      // Calculate revenue from paid orders
      stats.revenue = orders
        .filter(order => order.status === 'paid' || order.status === 'shipped' || order.status === 'delivered')
        .reduce((sum, order) => sum + order.amount_cents, 0);

      // Calculate conversion rate
      const purchaseEvents = events?.filter(e => e.event_type === 'purchase_completed').length || 0;
      stats.conversion_rate = stats.views > 0 ? (purchaseEvents / stats.views) * 100 : 0;
    }

    // Generate daily stats
    const dailyMap = new Map();
    const today = new Date();
    
    // Initialize all days with 0 values
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dailyMap.set(dateStr, {
        date: dateStr,
        views: 0,
        orders: 0,
        revenue: 0,
      });
    }

    // Populate with actual data
    if (events) {
      events.forEach(event => {
        const dateStr = event.created_at.split('T')[0];
        const dayStats = dailyMap.get(dateStr);
        if (dayStats) {
          if (event.event_type === 'shop_view' || event.event_type === 'product_view') {
            dayStats.views++;
          }
        }
      });
    }

    if (orders) {
      orders.forEach(order => {
        const dateStr = order.created_at.split('T')[0];
        const dayStats = dailyMap.get(dateStr);
        if (dayStats) {
          if (order.status === 'paid' || order.status === 'shipped' || order.status === 'delivered') {
            dayStats.orders++;
            dayStats.revenue += order.amount_cents;
          }
        }
      });
    }

    stats.daily_stats = Array.from(dailyMap.values());

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Analytics dashboard error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}