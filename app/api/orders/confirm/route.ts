import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { paymentProvider } from '@/lib/payment-provider';
import { emailService } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    
    const {
      payment_intent_id,
      payment_method,
      return_url
    } = body;

    // Validate required fields
    if (!payment_intent_id || !payment_method) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find the order by payment intent ID
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, products(*), shops(*)')
      .eq('payment_intent_id', payment_intent_id)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    try {
      // Confirm payment with provider
      const confirmedPayment = await paymentProvider.confirmPaymentIntent(
        payment_intent_id,
        {
          payment_method,
          return_url
        }
      );

      if (confirmedPayment.status === 'succeeded') {
        // Update order status to paid
        const { error: updateError } = await supabase
          .from('orders')
          .update({ 
            status: 'paid',
            updated_at: new Date().toISOString()
          })
          .eq('id', order.id);

        if (updateError) {
          console.error('Order update error:', updateError);
        }

        // Update product inventory if tracked
        if (order.products.inventory_count !== null) {
          await supabase
            .from('products')
            .update({ 
              inventory_count: Math.max(0, order.products.inventory_count - 1),
              updated_at: new Date().toISOString()
            })
            .eq('id', order.product_id);
        }

        // Track successful purchase event
        await supabase
          .from('analytics_events')
          .insert({
            shop_id: order.shop_id,
            event_type: 'purchase_completed',
            metadata: {
              product_id: order.product_id,
              order_id: order.id,
              amount_cents: order.amount_cents,
              currency: order.currency,
              payment_intent_id: confirmedPayment.id
            }
          });

        // Generate receipt URL
        const receiptUrl = paymentProvider.generateReceiptUrl(confirmedPayment);

        // Send email notifications
        try {
          // Send order confirmation to customer
          await emailService.sendOrderConfirmation({
            customer_email: order.customer_email,
            customer_name: order.customer_name || 'Customer',
            order_id: order.id,
            product_name: order.products.name,
            shop_name: order.shops.title,
            amount_cents: order.amount_cents,
            currency: order.currency,
            receipt_url: receiptUrl,
          });

          // Get seller email for notification
          const { data: seller } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', order.shops.user_id)
            .single();

          if (seller) {
            const { data: { user } } = await supabase.auth.admin.getUserById(seller.id);
            if (user?.email) {
              await emailService.sendSellerNotification({
                seller_email: user.email,
                shop_name: order.shops.title,
                order_id: order.id,
                product_name: order.products.name,
                customer_name: order.customer_name || 'Customer',
                customer_email: order.customer_email,
                amount_cents: order.amount_cents,
                currency: order.currency,
              });
            }
          }
        } catch (emailError) {
          console.error('Email notification error:', emailError);
          // Don't fail the order if email fails
        }

        return NextResponse.json({
          success: true,
          order_id: order.id,
          payment_intent: confirmedPayment,
          receipt_url: receiptUrl,
          order_details: {
            id: order.id,
            product_name: order.products.name,
            shop_name: order.shops.title,
            amount_cents: order.amount_cents,
            currency: order.currency,
            customer_email: order.customer_email,
            status: 'paid'
          }
        });

      } else {
        // Payment failed or requires further action
        return NextResponse.json({
          success: false,
          payment_intent: confirmedPayment,
          error: 'Payment confirmation failed'
        });
      }

    } catch (paymentError: any) {
      // Track failed payment event
      await supabase
        .from('analytics_events')
        .insert({
          shop_id: order.shop_id,
          event_type: 'purchase_failed',
          metadata: {
            product_id: order.product_id,
            order_id: order.id,
            amount_cents: order.amount_cents,
            currency: order.currency,
            payment_intent_id,
            error: paymentError.message
          }
        });

      return NextResponse.json({
        success: false,
        error: paymentError.message || 'Payment processing failed'
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Payment confirmation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}