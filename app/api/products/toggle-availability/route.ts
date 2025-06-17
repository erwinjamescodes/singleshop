import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { product_id, is_available } = body;

    if (!product_id || typeof is_available !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify the product belongs to the user
    const { data: product, error: productError } = await supabase
      .from('products')
      .select(`
        id,
        shops!inner (
          user_id
        )
      `)
      .eq('id', product_id)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if user owns the shop
    if ((product.shops as any).user_id !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Update product availability
    const { data: updatedProduct, error: updateError } = await supabase
      .from('products')
      .update({
        is_available,
        updated_at: new Date().toISOString(),
      })
      .eq('id', product_id)
      .select()
      .single();

    if (updateError) {
      console.error('Product update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update product' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      product: updatedProduct,
    });

  } catch (error) {
    console.error('Toggle availability error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}