import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/client';

// POST /api/subscriptions/[id]/pause - Pause a subscription
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseAdmin();
    const { id } = params;
    const body = await request.json();

    const {
      pause_start_date,
      pause_end_date,
      reason,
      billing_suspended = true,
    } = body;

    // Validate required fields
    if (!pause_start_date) {
      return NextResponse.json(
        { error: 'Pause start date is required' },
        { status: 400 }
      );
    }

    // Check if subscription exists and is active
    const { data: subscription, error: fetchError } = await supabase
      .from('customer_subscriptions')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    if (subscription.status !== 'active') {
      return NextResponse.json(
        { error: 'Only active subscriptions can be paused' },
        { status: 400 }
      );
    }

    // Create pause record
    const { data: pause, error: pauseError } = await supabase
      .from('subscription_pauses')
      .insert({
        subscription_id: id,
        pause_start_date,
        pause_end_date,
        reason,
        billing_suspended,
        status: 'active',
        requested_by: 'admin', // TODO: Get from auth context
      })
      .select()
      .single();

    if (pauseError) {
      console.error('Error creating pause:', pauseError);
      return NextResponse.json({ error: pauseError.message }, { status: 500 });
    }

    // Update subscription status
    const { data: updatedSubscription, error: updateError } = await supabase
      .from('customer_subscriptions')
      .update({ status: 'paused' })
      .eq('id', id)
      .select(`
        *,
        subscription_plan:subscription_plans(*),
        customer:customers(*)
      `)
      .single();

    if (updateError) {
      console.error('Error updating subscription:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Cancel schedules during pause period
    if (pause_end_date) {
      await supabase
        .from('subscription_schedules')
        .update({ status: 'cancelled' })
        .eq('subscription_id', id)
        .gte('scheduled_date', pause_start_date)
        .lte('scheduled_date', pause_end_date)
        .eq('status', 'scheduled');
    }

    return NextResponse.json({
      message: 'Subscription paused successfully',
      subscription: updatedSubscription,
      pause,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/subscriptions/[id]/pause - Resume a paused subscription
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseAdmin();
    const { id } = params;

    // Get active pause
    const { data: pause, error: pauseError } = await supabase
      .from('subscription_pauses')
      .select('*')
      .eq('subscription_id', id)
      .eq('status', 'active')
      .single();

    if (pauseError || !pause) {
      return NextResponse.json(
        { error: 'No active pause found for this subscription' },
        { status: 404 }
      );
    }

    // Mark pause as completed
    await supabase
      .from('subscription_pauses')
      .update({ status: 'completed' })
      .eq('id', pause.id);

    // Resume subscription
    const { data: updatedSubscription, error: updateError } = await supabase
      .from('customer_subscriptions')
      .update({ status: 'active' })
      .eq('id', id)
      .select(`
        *,
        subscription_plan:subscription_plans(*),
        customer:customers(*)
      `)
      .single();

    if (updateError) {
      console.error('Error updating subscription:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Subscription resumed successfully',
      subscription: updatedSubscription,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
