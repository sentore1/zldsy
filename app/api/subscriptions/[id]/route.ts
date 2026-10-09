import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/client';

// GET /api/subscriptions/[id] - Get subscription by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseAdmin();
    const { id } = params;

    const { data, error } = await supabase
      .from('customer_subscriptions')
      .select(`
        *,
        subscription_plan:subscription_plans(*),
        customer:customers(*),
        schedules:subscription_schedules(*, job:jobs(*)),
        billing_history:subscription_billing(*),
        addons:subscription_addon_usage(*, addon:subscription_addons(*)),
        pauses:subscription_pauses(*),
        contract:contracts(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching subscription:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/subscriptions/[id] - Update subscription
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseAdmin();
    const { id } = params;
    const body = await request.json();

    const { status, payment_method, notes, admin_notes } = body;

    const updates: any = {};
    if (status) updates.status = status;
    if (payment_method) updates.payment_method = payment_method;
    if (notes !== undefined) updates.notes = notes;
    if (admin_notes !== undefined) updates.admin_notes = admin_notes;

    const { data, error } = await supabase
      .from('customer_subscriptions')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        subscription_plan:subscription_plans(*),
        customer:customers(*)
      `)
      .single();

    if (error) {
      console.error('Error updating subscription:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/subscriptions/[id] - Cancel subscription
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseAdmin();
    const { id } = params;
    const { searchParams } = new URL(request.url);

    const immediate = searchParams.get('immediate') === 'true';
    const reason = searchParams.get('reason');

    // Get subscription details
    const { data: subscription, error: fetchError } = await supabase
      .from('customer_subscriptions')
      .select('*, subscription_plan:subscription_plans(*)')
      .eq('id', id)
      .single();

    if (fetchError || !subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    const now = new Date();
    const cancellationDate = immediate 
      ? now.toISOString()
      : subscription.next_billing_date || now.toISOString();

    // Update subscription status
    const { data, error } = await supabase
      .from('customer_subscriptions')
      .update({
        status: immediate ? 'cancelled' : 'active',
        cancelled_at: now.toISOString(),
        cancelled_by: 'admin', // TODO: Get from auth context
        cancellation_reason: reason,
        cancellation_effective_date: cancellationDate,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error cancelling subscription:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Cancel future schedules if immediate
    if (immediate) {
      await supabase
        .from('subscription_schedules')
        .update({ status: 'cancelled' })
        .eq('subscription_id', id)
        .gte('scheduled_date', now.toISOString())
        .eq('status', 'scheduled');
    }

    return NextResponse.json({
      message: immediate 
        ? 'Subscription cancelled immediately' 
        : 'Subscription will be cancelled at end of billing period',
      data,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
