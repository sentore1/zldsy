import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/client';

// GET /api/subscriptions/plans - Get all subscription plans
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);

    const billing_cycle = searchParams.get('billing_cycle');
    const is_active = searchParams.get('is_active');
    const is_featured = searchParams.get('is_featured');

    let query = supabase
      .from('subscription_plans')
      .select(`
        *,
        service:services(*)
      `)
      .order('display_order', { ascending: true })
      .order('price', { ascending: true });

    // Apply filters
    if (billing_cycle) {
      query = query.eq('billing_cycle', billing_cycle);
    }
    if (is_active !== null) {
      query = query.eq('is_active', is_active === 'true');
    }
    if (is_featured !== null) {
      query = query.eq('is_featured', is_featured === 'true');
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching subscription plans:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Calculate active subscription counts for each plan
    const plansWithCounts = await Promise.all(
      data.map(async (plan) => {
        const { count } = await supabase
          .from('customer_subscriptions')
          .select('*', { count: 'exact', head: true })
          .eq('subscription_plan_id', plan.id)
          .eq('status', 'active');

        return {
          ...plan,
          active_subscriptions_count: count || 0,
        };
      })
    );

    return NextResponse.json(plansWithCounts);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/subscriptions/plans - Create a new subscription plan
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await request.json();

    const {
      name,
      description,
      service_id,
      billing_cycle,
      price,
      setup_fee = 0,
      included_visits,
      visit_duration,
      priority_level = 'standard',
      discount_percentage = 0,
      promotional_price,
      promotion_valid_until,
      minimum_commitment_months = 0,
      cancellation_notice_days = 30,
      auto_renewal = true,
      is_active = true,
      is_featured = false,
      display_order = 0,
    } = body;

    // Validate required fields
    if (!name || !billing_cycle || !price) {
      return NextResponse.json(
        { error: 'Name, billing cycle, and price are required' },
        { status: 400 }
      );
    }

    // Validate billing cycle
    const validBillingCycles = ['weekly', 'monthly', 'yearly', 'permanent'];
    if (!validBillingCycles.includes(billing_cycle)) {
      return NextResponse.json(
        { error: 'Invalid billing cycle' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('subscription_plans')
      .insert({
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
      })
      .select(`
        *,
        service:services(*)
      `)
      .single();

    if (error) {
      console.error('Error creating subscription plan:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
