import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; equipmentId: string }> }
) {
  try {
    const supabase = supabaseAdmin;
    const { equipmentId } = await params;

    // Get equipment details before deleting
    const { data: jobEquipment } = await supabase
      .from('job_equipment')
      .select('equipment_id')
      .eq('id', equipmentId)
      .single();

    const { error } = await supabase
      .from('job_equipment')
      .delete()
      .eq('id', equipmentId);

    if (error) {
      console.error('Equipment removal error:', error);
      throw new Error('Failed to remove equipment');
    }

    // Update equipment status back to available
    if (jobEquipment) {
      await supabase
        .from('equipment')
        .update({ status: 'available' })
        .eq('id', jobEquipment.equipment_id);
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
