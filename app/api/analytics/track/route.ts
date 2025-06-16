import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    
    const {
      shop_id,
      event_type,
      visitor_id,
      metadata = {}
    } = body;

    // Validate required fields
    if (!shop_id || !event_type) {
      return NextResponse.json(
        { error: 'Missing required fields: shop_id and event_type' },
        { status: 400 }
      );
    }

    // Valid event types
    const validEventTypes = [
      'shop_view',
      'product_view', 
      'purchase_initiated',
      'purchase_completed',
      'purchase_failed'
    ];

    if (!validEventTypes.includes(event_type)) {
      return NextResponse.json(
        { error: 'Invalid event type' },
        { status: 400 }
      );
    }

    // Verify shop exists
    const { data: shop, error: shopError } = await supabase
      .from('shops')
      .select('id')
      .eq('id', shop_id)
      .single();

    if (shopError || !shop) {
      return NextResponse.json(
        { error: 'Shop not found' },
        { status: 404 }
      );
    }

    // Generate visitor ID if not provided
    const finalVisitorId = visitor_id || `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Insert analytics event
    const { data: event, error: insertError } = await supabase
      .from('analytics_events')
      .insert({
        shop_id,
        event_type,
        visitor_id: finalVisitorId,
        metadata
      })
      .select()
      .single();

    if (insertError) {
      console.error('Analytics insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to track event' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      event_id: event.id,
      visitor_id: finalVisitorId
    });

  } catch (error) {
    console.error('Analytics tracking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}