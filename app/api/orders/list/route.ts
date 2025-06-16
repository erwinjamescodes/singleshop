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
      return NextResponse.json({ orders: [] });
    }

    const shopIds = shops.map(shop => shop.id);

    // Get URL parameters for pagination and filtering
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('orders')
      .select(`
        *,
        products (
          id,
          name,
          price_cents,
          currency,
          image_urls
        ),
        shops (
          id,
          title,
          slug
        )
      `)
      .in('shop_id', shopIds)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Add status filter if provided
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: orders, error: ordersError } = await query;

    if (ordersError) {
      console.error('Orders query error:', ordersError);
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      );
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .in('shop_id', shopIds);

    if (status && status !== 'all') {
      countQuery = countQuery.eq('status', status);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      console.error('Count query error:', countError);
    }

    // Calculate summary statistics
    const { data: stats, error: statsError } = await supabase
      .from('orders')
      .select('status, amount_cents')
      .in('shop_id', shopIds);

    let summary = {
      total_orders: 0,
      total_revenue: 0,
      pending_orders: 0,
      paid_orders: 0,
      shipped_orders: 0,
    };

    if (stats && !statsError) {
      summary = stats.reduce((acc, order) => {
        acc.total_orders++;
        if (order.status === 'paid' || order.status === 'shipped' || order.status === 'delivered') {
          acc.total_revenue += order.amount_cents;
        }
        if (order.status === 'pending') acc.pending_orders++;
        if (order.status === 'paid') acc.paid_orders++;
        if (order.status === 'shipped') acc.shipped_orders++;
        return acc;
      }, summary);
    }

    return NextResponse.json({
      orders: orders || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
      summary,
    });

  } catch (error) {
    console.error('Orders list error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}