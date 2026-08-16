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

    const query = supabase.from('job_equipment') as any
    const { data, error } = await query
      .insert({
        job_id: jobId,
        equipment_id: body.equipment_id,
        fuel_used: body.fuel_used || 0,
        fuel_cost: body.fuel_cost || 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Equipment assignment error:', error);
      throw new Error('Failed to add equipment');
    }

    // Update equipment status to in_use
    const equipmentQuery = supabase.from('equipment') as any
    await equipmentQuery
      .update({ status: 'in_use' })
      .eq('id', body.equipment_id);

    return NextResponse.json({ equipment: data }, { status: 201 });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
