import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = supabaseAdmin;
    const { id: jobId } = await params;
    const body = await request.json();

    const { data, error } = await supabase
      .from('job_materials')
      .insert({
        job_id: jobId,
        inventory_id: body.inventory_id,
        quantity: body.quantity,
        cost: body.cost,
      })
      .select()
      .single();

    if (error) {
      console.error('Material assignment error:', error);
      throw new Error('Failed to add material');
    }

    // Update inventory quantity
    await supabase.rpc('update_inventory_quantity', {
      p_inventory_id: body.inventory_id,
      p_quantity_change: -body.quantity,
    });

    return NextResponse.json({ material: data }, { status: 201 });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
