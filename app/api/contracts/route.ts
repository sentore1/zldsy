import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/client';

// GET /api/contracts - Get all contracts
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);

    const customer_id = searchParams.get('customer_id');
    const status = searchParams.get('status');
    const contract_type = searchParams.get('contract_type');

    let query = supabase
      .from('contracts')
      .select(`
        *,
        customer:customers(id, name, email, phone),
        subscription:customer_subscriptions(*, subscription_plan:subscription_plans(*))
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (customer_id) {
      query = query.eq('customer_id', customer_id);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (contract_type) {
      query = query.eq('contract_type', contract_type);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching contracts:', error);
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

// POST /api/contracts - Create a new contract
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await request.json();

    const {
      customer_id,
      subscription_id,
      contract_type,
      title,
      description,
      start_date,
      end_date,
      signatory_name,
      signatory_title,
      witness_name,
      terms_and_conditions,
      special_clauses,
      total_value,
      payment_terms,
      auto_renewal = false,
      renewal_notice_days = 30,
    } = body;

    // Validate required fields
    if (!customer_id || !contract_type || !title || !start_date) {
      return NextResponse.json(
        { error: 'Customer ID, contract type, title, and start date are required' },
        { status: 400 }
      );
    }

    // Generate contract number
    const { count } = await supabase
      .from('contracts')
      .select('*', { count: 'exact', head: true });

    const contractNumber = `CNTR-${String((count || 0) + 1).padStart(6, '0')}`;

    const { data, error } = await supabase
      .from('contracts')
      .insert({
        contract_number: contractNumber,
        customer_id,
        subscription_id,
        contract_type,
        title,
        description,
        start_date,
        end_date,
        signatory_name,
        signatory_title,
        witness_name,
        terms_and_conditions,
        special_clauses,
        total_value,
        payment_terms,
        auto_renewal,
        renewal_notice_days,
        status: 'draft',
      })
      .select(`
        *,
        customer:customers(*),
        subscription:customer_subscriptions(*, subscription_plan:subscription_plans(*))
      `)
      .single();

    if (error) {
      console.error('Error creating contract:', error);
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
