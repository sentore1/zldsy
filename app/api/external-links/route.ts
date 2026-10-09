import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/client';

// GET /api/external-links - Get all external links
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);

    const category = searchParams.get('category');
    const show_in_footer = searchParams.get('show_in_footer');
    const show_in_customer_portal = searchParams.get('show_in_customer_portal');
    const is_active = searchParams.get('is_active');

    let query = supabase
      .from('external_links')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    // Apply filters
    if (category) {
      query = query.eq('category', category);
    }
    if (show_in_footer !== null) {
      query = query.eq('show_in_footer', show_in_footer === 'true');
    }
    if (show_in_customer_portal !== null) {
      query = query.eq('show_in_customer_portal', show_in_customer_portal === 'true');
    }
    if (is_active !== null) {
      query = query.eq('is_active', is_active === 'true');
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching external links:', error);
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

// POST /api/external-links - Create a new external link
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await request.json();

    const {
      title,
      description,
      url,
      category = 'other',
      icon,
      display_order = 0,
      open_in_new_tab = true,
      show_in_footer = true,
      show_in_customer_portal = true,
    } = body;

    // Validate required fields
    if (!title || !url) {
      return NextResponse.json(
        { error: 'Title and URL are required' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('external_links')
      .insert({
        title,
        description,
        url,
        category,
        icon,
        display_order,
        open_in_new_tab,
        show_in_footer,
        show_in_customer_portal,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating external link:', error);
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
