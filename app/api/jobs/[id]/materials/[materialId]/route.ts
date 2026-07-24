import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; materialId: string }> }
) {
  try {
    const supabase = supabaseAdmin;
    const { materialId } = await params;

    // Get material details before deleting
    const { data: material } = await supabase
      .from('job_materials')
      .select('inventory_id, quantity')
      .eq('id', materialId)
      .single();

    const { error } = await supabase
      .from('job_materials')
      .delete()
      .eq('id', materialId);

    if (error) {
      console.error('Material removal error:', error);
      throw new Error('Failed to remove material');
    }

    // Restore inventory quantity
    if (material) {
      await supabase.rpc('update_inventory_quantity', {
        p_inventory_id: material.inventory_id,
        p_quantity_change: material.quantity,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
