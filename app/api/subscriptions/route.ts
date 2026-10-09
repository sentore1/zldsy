import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/client';

// GET /api/subscriptions - Get all subscriptions with optional filters
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);

    const customer_id = searchParams.get('customer_id');
    const status = searchParams.get('status');
    const plan_id = searchParams.get('plan_id');
    const billing_cycle = searchParams.get('billing_cycle');

    let query = supabase
      .from('customer_subscriptions')
      .select(`
        *,
        subscription_plan:subscription_plans(*),
        customer:customers(id, name, email, phone)
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (customer_id) {
      query = query.eq('customer_id', customer_id);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (plan_id) {
      query = query.eq('subscription_plan_id', plan_id);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching subscriptions:', error);
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

// POST /api/subscriptions - Create a new subscription
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await request.json();

    const {
      customer_id,
      subscription_plan_id,
      start_date = new Date().toISOString(),
      payment_method,
      is_trial = false,
      trial_end_date,
      notes,
    } = body;

    // Validate required fields
    if (!customer_id || !subscription_plan_id) {
      return NextResponse.json(
        { error: 'Customer ID and Subscription Plan ID are required' },
        { status: 400 }
      );
    }

    // Get plan details
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', subscription_plan_id)
      .single();

    if (planError || !plan) {
      return NextResponse.json(
        { error: 'Subscription plan not found' },
        { status: 404 }
      );
    }

    // Calculate pricing
    const current_price = plan.promotional_price && 
      plan.promotion_valid_until && 
      new Date(plan.promotion_valid_until) > new Date()
      ? plan.promotional_price
      : plan.price;

    // Calculate next billing date
    const startDate = new Date(start_date);
    let next_billing_date;

    switch (plan.billing_cycle) {
      case 'weekly':
        next_billing_date = new Date(startDate.setDate(startDate.getDate() + 7));
        break;
      case 'monthly':
        next_billing_date = new Date(startDate.setMonth(startDate.getMonth() + 1));
        break;
      case 'yearly':
        next_billing_date = new Date(startDate.setFullYear(startDate.getFullYear() + 1));
        break;
      case 'permanent':
        next_billing_date = null;
        break;
      default:
        next_billing_date = null;
    }

    // Create subscription
    const { data: subscription, error: subscriptionError } = await supabase
      .from('customer_subscriptions')
      .insert({
        customer_id,
        subscription_plan_id,
        status: is_trial ? 'pending' : 'active',
        start_date,
        next_billing_date: next_billing_date?.toISOString(),
        current_price,
        discount_applied: plan.discount_percentage,
        visits_remaining: plan.included_visits,
        payment_method,
        is_trial,
        trial_end_date,
        notes,
      })
      .select(`
        *,
        subscription_plan:subscription_plans(*),
        customer:customers(*)
      `)
      .single();

    if (subscriptionError) {
      console.error('Error creating subscription:', subscriptionError);
      return NextResponse.json(
        { error: subscriptionError.message },
        { status: 500 }
      );
    }

    // Generate initial schedules (first 3 months or 12 occurrences)
    if (plan.billing_cycle !== 'permanent') {
      const scheduleCount = plan.billing_cycle === 'weekly' ? 12 : 
                           plan.billing_cycle === 'monthly' ? 3 : 
                           1;

      await supabase.rpc('generate_subscription_schedules', {
        p_subscription_id: subscription.id,
        p_start_date: start_date,
        p_occurrences: scheduleCount,
      });
    }

    return NextResponse.json(subscription, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
