import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; staffId: string }> }
) {
  try {
    const supabase = supabaseAdmin;
    const { staffId } = await params;

    const { error } = await supabase
      .from('job_staff')
      .delete()
      .eq('id', staffId);

    if (error) {
      console.error('Staff removal error:', error);
      throw new Error('Failed to remove staff');
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
