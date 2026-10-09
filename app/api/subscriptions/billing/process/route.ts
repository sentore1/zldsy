import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/client';

// POST /api/subscriptions/billing/process - Process recurring billing for subscriptions
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await request.json();

    const { subscription_id, payment_method } = body;

    // If subscription_id provided, process single subscription
    // Otherwise, process all due subscriptions
    if (subscription_id) {
      const result = await processSingleSubscription(
        supabase,
        subscription_id,
        payment_method
      );
      return NextResponse.json(result);
    } else {
      const results = await processDueSubscriptions(supabase);
      return NextResponse.json(results);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function processSingleSubscription(
  supabase: any,
  subscription_id: string,
  payment_method?: string
) {
  try {
    // Get subscription details
    const { data: subscription, error: subError } = await supabase
      .from('customer_subscriptions')
      .select(`
        *,
        subscription_plan:subscription_plans(*),
        customer:customers(*)
      `)
      .eq('id', subscription_id)
      .single();

    if (subError || !subscription) {
      return { error: 'Subscription not found', success: false };
    }

    if (subscription.status !== 'active') {
      return { 
        error: 'Subscription is not active', 
        success: false,
        subscription_id 
      };
    }

    const now = new Date();
    const billingPeriodStart = subscription.last_billing_date 
      ? new Date(subscription.last_billing_date)
      : new Date(subscription.start_date);
    
    const billingPeriodEnd = new Date(now);

    // Calculate amounts
    const amount = subscription.current_price;
    const discount = amount * (subscription.discount_applied / 100);
    const subtotal = amount - discount;
    const tax = subtotal * 0.1; // 10% tax, adjust as needed
    const total = subtotal + tax;

    // Create billing record
    const { data: billing, error: billingError } = await supabase
      .from('subscription_billing')
      .insert({
        subscription_id,
        billing_date: now.toISOString(),
        billing_period_start: billingPeriodStart.toISOString(),
        billing_period_end: billingPeriodEnd.toISOString(),
        amount,
        discount_amount: discount,
        tax_amount: tax,
        total_amount: total,
        status: 'pending',
        payment_method: payment_method || subscription.payment_method,
      })
      .select()
      .single();

    if (billingError) {
      return { 
        error: 'Failed to create billing record', 
        success: false,
        details: billingError.message 
      };
    }

    // TODO: Integrate with actual payment processor
    // For now, mark as paid
    const { error: updateBillingError } = await supabase
      .from('subscription_billing')
      .update({
        status: 'paid',
        payment_date: now.toISOString(),
        transaction_id: `TXN-${Date.now()}`,
      })
      .eq('id', billing.id);

    if (updateBillingError) {
      return { 
        error: 'Failed to update billing status', 
        success: false 
      };
    }

    // Create invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        invoice_number: `INV-SUB-${billing.id.slice(0, 8)}`,
        total_amount: amount,
        discount: discount,
        tax: tax,
        final_amount: total,
        status: 'paid',
        due_date: billingPeriodEnd.toISOString(),
        paid_date: now.toISOString(),
        payment_method: payment_method || subscription.payment_method,
      })
      .select()
      .single();

    if (!invoiceError) {
      // Link invoice to billing record
      await supabase
        .from('subscription_billing')
        .update({ invoice_id: invoice.id })
        .eq('id', billing.id);
    }

    return {
      success: true,
      subscription_id,
      billing_id: billing.id,
      invoice_id: invoice?.id,
      amount: total,
      message: 'Billing processed successfully',
    };
  } catch (error) {
    console.error('Error processing subscription:', error);
    return { 
      error: 'Failed to process subscription', 
      success: false,
      subscription_id 
    };
  }
}

async function processDueSubscriptions(supabase: any) {
  try {
    const now = new Date();

    // Get all active subscriptions due for billing
    const { data: subscriptions, error } = await supabase
      .from('customer_subscriptions')
      .select(`
        *,
        subscription_plan:subscription_plans(*)
      `)
      .eq('status', 'active')
      .lte('next_billing_date', now.toISOString())
      .not('next_billing_date', 'is', null);

    if (error) {
      return { 
        error: 'Failed to fetch due subscriptions', 
        success: false,
        details: error.message 
      };
    }

    const results = {
      total: subscriptions?.length || 0,
      processed: 0,
      failed: 0,
      details: [] as any[],
    };

    if (subscriptions && subscriptions.length > 0) {
      for (const subscription of subscriptions) {
        const result = await processSingleSubscription(
          supabase,
          subscription.id
        );
        
        if (result.success) {
          results.processed++;
        } else {
          results.failed++;
        }
        
        results.details.push(result);
      }
    }

    return {
      success: true,
      message: `Processed ${results.processed} of ${results.total} subscriptions`,
      results,
    };
  } catch (error) {
    console.error('Error processing due subscriptions:', error);
    return { 
      error: 'Failed to process due subscriptions', 
      success: false 
    };
  }
}

// GET /api/subscriptions/billing/process - Get upcoming billing summary
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    
    const days = parseInt(searchParams.get('days') || '7');
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const { data, error } = await supabase
      .from('customer_subscriptions')
      .select(`
        id,
        next_billing_date,
        current_price,
        customer:customers(name),
        subscription_plan:subscription_plans(name)
      `)
      .eq('status', 'active')
      .lte('next_billing_date', futureDate.toISOString())
      .not('next_billing_date', 'is', null)
      .order('next_billing_date', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const summary = {
      count: data?.length || 0,
      total_amount: data?.reduce((sum, sub) => sum + (sub.current_price || 0), 0) || 0,
      subscriptions: data || [],
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
