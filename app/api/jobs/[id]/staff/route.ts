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

    const query = supabase.from('job_staff') as any
    const { data, error } = await query
      .insert({
        job_id: jobId,
        staff_id: body.staff_id,
        hours_worked: body.hours_worked,
        labor_cost: body.labor_cost,
      })
      .select()
      .single();

    if (error) {
      console.error('Staff assignment error:', error);
      throw new Error('Failed to assign staff');
    }

    return NextResponse.json({ staff: data }, { status: 201 });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
