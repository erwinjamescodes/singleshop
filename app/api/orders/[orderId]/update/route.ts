import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface Context {
  params: {
    orderId: string;
  };
}

export async function PATCH(request: NextRequest, context: Context) {
  try {
    const supabase = await createClient();
    const { orderId } = context.params;
    const body = await request.json();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { status, tracking_number } = body;

    // Valid status transitions
    const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
    
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // First, verify the order belongs to the user
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        shops!inner (
          user_id
        )
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if user owns the shop
    if (order.shops.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (status) {
      updateData.status = status;
    }

    if (tracking_number !== undefined) {
      updateData.tracking_number = tracking_number;
    }

    // Update the order
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
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
      .single();

    if (updateError) {
      console.error('Order update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      );
    }

    // Track analytics event for status changes
    if (status) {
      await supabase
        .from('analytics_events')
        .insert({
          shop_id: order.shop_id,
          event_type: 'order_status_changed',
          metadata: {
            order_id: orderId,
            old_status: order.status,
            new_status: status,
            amount_cents: order.amount_cents,
            currency: order.currency
          }
        });
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder
    });

  } catch (error) {
    console.error('Order update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}