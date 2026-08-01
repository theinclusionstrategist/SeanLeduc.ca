import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { leadId, newStage, agentId } = await request.json();

    if (!leadId || !newStage) {
      return NextResponse.json({ error: 'Missing leadId or newStage' }, { status: 400 });
    }

    // 1. Fetch next scheduled nurture template delay for this stage
    const { data: template } = await supabase
      .from('nurture_templates')
      .select('delay_days')
      .eq('stage', newStage)
      .eq('active', true)
      .order('delay_days', { ascending: true })
      .limit(1)
      .single();

    // Calculate next follow-up timestamp (defaults to 3 days if no specific template found)
    const delayDays = template?.delay_days || 3;
    const nextFollowup = new Date();
    nextFollowup.setDate(nextFollowup.getDate() + delayDays);

    // 2. Update lead status in Supabase
    const { data: updatedLead, error } = await supabase
      .from('leads')
      .update({
        stage: newStage,
        assigned_agent_id: agentId || undefined,
        last_contacted_at: new Date().toISOString(),
        next_followup_at: nextFollowup.toISOString(),
      })
      .eq('id', leadId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, lead: updatedLead });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
