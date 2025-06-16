import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { paymentProvider } from '@/lib/payment-provider';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    
    const {
      shop_id,
      product_id,
      customer_email,
      customer_name,
      customer_phone,
      shipping_address,
      amount_cents,
      currency = 'USD'
    } = body;

    // Validate required fields
    if (!shop_id || !product_id || !customer_email || !amount_cents) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify the product exists and get its details
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*, shops!inner(*)')
      .eq('id', product_id)
      .eq('shop_id', shop_id)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if product is available
    if (!product.is_available) {
      return NextResponse.json(
        { error: 'Product is not available' },
        { status: 400 }
      );
    }

    // Check inventory if tracked
    if (product.inventory_count !== null && product.inventory_count <= 0) {
      return NextResponse.json(
        { error: 'Product is out of stock' },
        { status: 400 }
      );
    }

    // Verify the amount matches the product price
    if (amount_cents !== product.price_cents) {
      return NextResponse.json(
        { error: 'Amount does not match product price' },
        { status: 400 }
      );
    }

    // Create payment intent
    const paymentIntent = await paymentProvider.createPaymentIntent({
      amount: amount_cents,
      currency: currency.toLowerCase(),
      customer_email,
      metadata: {
        shop_id,
        product_id,
        product_name: product.name,
        shop_name: product.shops.title,
      }
    });

    // Create order in database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        shop_id,
        product_id,
        payment_intent_id: paymentIntent.id,
        customer_email,
        customer_name,
        customer_phone,
        shipping_address,
        amount_cents,
        currency,
        status: 'pending'
      })
      .select()
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }

    // Track analytics event
    await supabase
      .from('analytics_events')
      .insert({
        shop_id,
        event_type: 'purchase_initiated',
        metadata: {
          product_id,
          order_id: order.id,
          amount_cents,
          currency
        }
      });

    return NextResponse.json({
      order_id: order.id,
      payment_intent: {
        id: paymentIntent.id,
        client_secret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status
      }
    });

  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}