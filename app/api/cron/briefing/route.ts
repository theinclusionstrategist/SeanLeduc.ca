import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

// Prevent Next.js from prerendering or evaluating this route statically during build time
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Check authorization header if CRON_SECRET is configured
  const authHeader = request.headers.get('authorization');
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'RESEND_API_KEY environment variable is not set.' },
      { status: 500 }
    );
  }

  try {
    const resend = new Resend(apiKey);
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch quick summary count for daily briefing
    const { count: totalContacts } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true });

    // Send daily executive briefing email
    await resend.emails.send({
      from: 'Sean Leduc <sean@seanleduc.ca>',
      to: ['sean@seanleduc.ca'],
      subject: `Executive Daily Briefing - ${new Date().toLocaleDateString()}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
          <h2>Daily Platform Overview</h2>
          <p>Here is your daily platform summary for <strong>${new Date().toLocaleDateString()}</strong>:</p>
          <ul>
            <li><strong>Total Active Contacts in CRM:</strong> ${totalContacts ?? 0}</li>
          </ul>
          <p><a href="https://agentportal.seanleduc.ca" style="color: #2563eb;">Open Agent Portal</a></p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: 'Briefing sent successfully.',
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
