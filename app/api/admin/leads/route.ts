import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || 'inclusy2026';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const auth = request.headers.get('x-admin-passcode') || searchParams.get('passcode');

  if (auth !== ADMIN_PASSCODE) {
    return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('leads')
      .select('*')
      .order('last_active', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ leads: data || [] });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to fetch leads';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const auth = request.headers.get('x-admin-passcode');

  if (auth !== ADMIN_PASSCODE) {
    return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, status, notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Lead ID is required.' }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};
    if (status !== undefined) updates.status = status;
    if (notes !== undefined) updates.notes = notes;

    const { data, error } = await supabaseAdmin
      .from('leads')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ lead: data });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to update lead';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
