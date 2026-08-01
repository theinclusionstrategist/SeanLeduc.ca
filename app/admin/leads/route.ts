import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const passcode = searchParams.get('passcode');

    const adminPasscode = process.env.ADMIN_PASSCODE || 'admin123';
    if (passcode !== adminPasscode && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
      .from('leads')
      .select('*')
      .order('last_active', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ leads: data || [] });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch admin leads';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
