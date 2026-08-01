import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  try {
    // 1. Fetch Hot Leads & Due Tasks
    const { data: hotLeads } = await supabase
      .from('contacts')
      .select('name, agent, priority, NBA')
      .in('priority', ['SUPER HOT', 'Hot']);

    const hotListHtml = hotLeads?.length
      ? hotLeads.map((l) => `<li><b>${l.name}</b> (${l.agent}) - ${l.priority} | NBA: ${l.NBA || 'Call Now'}</li>`).join('')
      : '<li>No hot leads currently.</li>';

    // 2. Dispatch Daily Briefing Email to Leadership
    await resend.emails.send({
      from: 'TIS CRM Engine <crm@seanleduc.ca>',
      to: ['TheInclusionStrategist@seanLeduc.ca', 'ShaunBisson1@gmail.com'],
      subject: `⚡ TIS CRM Morning Briefing - ${new Date().toLocaleDateString()}`,
      html: `
        <h2>⚡ Daily CRM Morning Briefing</h2>
        <h3>🔥 High Priority Leads (${hotLeads?.length || 0}):</h3>
        <ul>${hotListHtml}</ul>
      `,
    });

    return NextResponse.json({ success: true, dispatched: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
