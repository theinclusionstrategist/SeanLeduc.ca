'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export interface InboundLeadPayload {
  name: string;
  email: string;
  phone?: string;
  pillar: string;
  message?: string;
  honeypot?: string; // Anti-bot field
}

export async function submitPublicLead(payload: InboundLeadPayload) {
  try {
    // 1. Anti-Bot Honeypot Check
    if (payload.honeypot && payload.honeypot.trim() !== '') {
      return { success: true, message: 'Inquiry received.' }; // Silent discard for bots
    }

    if (!payload.name || !payload.email) {
      return { success: false, error: 'Name and email are required.' };
    }

    // 2. Derive Intent Tags & Score
    const intentTags: string[] = [payload.pillar];
    let initialScore = 50;

    if (payload.pillar.includes('Corporate')) {
      initialScore += 30;
      intentTags.push('High-Value Corporate');
    }
    if (payload.pillar.includes('RDSP')) {
      initialScore += 25;
      intentTags.push('Disability Tax Credit');
    }
    if (payload.phone && payload.phone.length > 7) {
      initialScore += 15;
    }

    const sessionId = `pub-lead-${Date.now()}`;

    // 3. Upsert Lead directly into Supabase
    const { error: dbError } = await supabase.from('leads').upsert(
      {
        session_id: sessionId,
        name: payload.name,
        email: payload.email,
        phone: payload.phone || null,
        intent_tags: intentTags,
        score: initialScore,
        notes: `Pillar Interest: ${payload.pillar}\nMessage: ${payload.message || 'None provided'}`,
        status: 'New Lead',
        last_active: new Date().toISOString(),
      },
      { onConflict: 'session_id' }
    );

    if (dbError) throw new Error(dbError.message);

    revalidatePath('/portal');
    revalidatePath('/admin/leads');

    return {
      success: true,
      message:
        'Thank you! Your inquiry has been routed to Sean Leduc. We will connect with you within 24 business hours.',
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Server processing failed.';
    return { success: false, error: errorMsg };
  }
}
