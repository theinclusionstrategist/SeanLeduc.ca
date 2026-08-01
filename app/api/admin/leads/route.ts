import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Helper to verify admin passcode
function verifyPasscode(req: NextRequest, passcodeParam: string | null): boolean {
  const headerCode = req.headers.get('x-admin-passcode');
  const code = headerCode || passcodeParam;
  const adminPasscode = process.env.ADMIN_PASSCODE || 'admin123';
  return code === adminPasscode || process.env.NODE_ENV !== 'production';
}

// GET: Fetch all leads
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const passcode = searchParams.get('passcode');

    if (!verifyPasscode(req, passcode)) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
      .from('leads')
      .select('*')
      .order('last_active', { ascending: false });

    if (error) throw new Error(error.message);

    return NextResponse.json({ leads: data || [] });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch admin leads';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// PATCH: Live Status & Notes updates from dashboard
export async function PATCH(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const passcode = searchParams.get('passcode');

    if (!verifyPasscode(req, passcode)) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }

    const body = await req.json();
    const { id, status, notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 });
    }

    const updatePayload: Record<string, unknown> = {
      last_active: new Date().toISOString(),
    };

    if (status !== undefined) updatePayload.status = status;
    if (notes !== undefined) updatePayload.notes = notes;

    const { data, error } = await supabaseAdmin
      .from('leads')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return NextResponse.json({ lead: data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update lead';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
