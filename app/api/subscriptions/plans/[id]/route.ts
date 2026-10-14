import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/client';

// GET /api/subscriptions/plans/[id] - Get a single subscription plan
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseAdmin();
    const { id } = await params;

    const { data, error } = await supabase
      .from('subscription_plans')
      .select(`
        *,
        service:services(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching subscription plan:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Subscription plan not found' },
        { status: 404 }
      );
    }

    // Get active subscriptions count
    const { count } = await supabase
      .from('customer_subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('subscription_plan_id', id)
      .eq('status', 'active');

    return NextResponse.json({
      ...data,
      active_subscriptions_count: count || 0,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/subscriptions/plans/[id] - Update a subscription plan
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseAdmin();
    const { id } = await params;
    const body = await request.json();

    const {
      name,
      description,
      service_id,
      billing_cycle,
      price,
      setup_fee,
      included_visits,
      visit_duration,
      priority_level,
      discount_percentage,
      promotional_price,
      promotion_valid_until,
      minimum_commitment_months,
      cancellation_notice_days,
      auto_renewal,
      is_active,
      is_featured,
      display_order,
    } = body;

    // Build update object with only provided fields
    const updates: any = { updated_at: new Date().toISOString() };

    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (service_id !== undefined) updates.service_id = service_id;
    if (billing_cycle !== undefined) {
      const validBillingCycles = ['weekly', 'monthly', 'yearly', 'permanent'];
      if (!validBillingCycles.includes(billing_cycle)) {
        return NextResponse.json(
          { error: 'Invalid billing cycle' },
          { status: 400 }
        );
      }
      updates.billing_cycle = billing_cycle;
    }
    if (price !== undefined) updates.price = price;
    if (setup_fee !== undefined) updates.setup_fee = setup_fee;
    if (included_visits !== undefined) updates.included_visits = included_visits;
    if (visit_duration !== undefined) updates.visit_duration = visit_duration;
    if (priority_level !== undefined) updates.priority_level = priority_level;
    if (discount_percentage !== undefined) updates.discount_percentage = discount_percentage;
    if (promotional_price !== undefined) updates.promotional_price = promotional_price;
    if (promotion_valid_until !== undefined) updates.promotion_valid_until = promotion_valid_until;
    if (minimum_commitment_months !== undefined) updates.minimum_commitment_months = minimum_commitment_months;
    if (cancellation_notice_days !== undefined) updates.cancellation_notice_days = cancellation_notice_days;
    if (auto_renewal !== undefined) updates.auto_renewal = auto_renewal;
    if (is_active !== undefined) updates.is_active = is_active;
    if (is_featured !== undefined) updates.is_featured = is_featured;
    if (display_order !== undefined) updates.display_order = display_order;

    const { data, error } = await supabase
      .from('subscription_plans')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        service:services(*)
      `)
      .single();

    if (error) {
      console.error('Error updating subscription plan:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Subscription plan not found' },
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

// DELETE /api/subscriptions/plans/[id] - Delete a subscription plan
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseAdmin();
    const { id } = await params;

    // Check if plan has active subscriptions
    const { count } = await supabase
      .from('customer_subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('subscription_plan_id', id)
      .eq('status', 'active');

    if (count && count > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete plan with ${count} active subscription(s). Please deactivate the plan instead.`,
        },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('subscription_plans')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting subscription plan:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Subscription plan deleted successfully',
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
