import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/client';

// GET /api/external-links/[id] - Get external link by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseAdmin();
    const { id } = params;

    const { data, error } = await supabase
      .from('external_links')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching external link:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json(
        { error: 'External link not found' },
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

// PATCH /api/external-links/[id] - Update external link
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseAdmin();
    const { id } = params;
    const body = await request.json();

    const {
      title,
      description,
      url,
      category,
      icon,
      is_active,
      display_order,
      open_in_new_tab,
      show_in_footer,
      show_in_customer_portal,
    } = body;

    // Validate URL if provided
    if (url) {
      try {
        new URL(url);
      } catch {
        return NextResponse.json(
          { error: 'Invalid URL format' },
          { status: 400 }
        );
      }
    }

    const updates: any = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (url !== undefined) updates.url = url;
    if (category !== undefined) updates.category = category;
    if (icon !== undefined) updates.icon = icon;
    if (is_active !== undefined) updates.is_active = is_active;
    if (display_order !== undefined) updates.display_order = display_order;
    if (open_in_new_tab !== undefined) updates.open_in_new_tab = open_in_new_tab;
    if (show_in_footer !== undefined) updates.show_in_footer = show_in_footer;
    if (show_in_customer_portal !== undefined) 
      updates.show_in_customer_portal = show_in_customer_portal;

    const { data, error } = await supabase
      .from('external_links')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating external link:', error);
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

// DELETE /api/external-links/[id] - Delete external link
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseAdmin();
    const { id } = params;

    const { error } = await supabase
      .from('external_links')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting external link:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'External link deleted successfully' });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
