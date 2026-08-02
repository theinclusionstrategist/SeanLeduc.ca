import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// 1. Initialize Supabase Admin Client (Service Role bypasses RLS for public inserts)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // VERY IMPORTANT: Use Service Role Key here
);

// 2. Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, phone, entity_pillar, subTrack } = body;

    if (!email || !firstName) {
      return NextResponse.json({ error: 'First name and email are required' }, { status: 400 });
    }

    // 3. Insert Lead into Supabase Database
    const { data: newLead, error: dbError } = await supabaseAdmin
      .from('leads')
      .insert([
        {
          first_name: firstName,
          last_name: lastName,
          email: email.toLowerCase().trim(),
          phone: phone || null,
          entity_pillar: entity_pillar,
          sub_track: subTrack,
          stage: 'new', // Automatically defaults to 'new' column in Kanban
          notes: 'Source: Public Landing Page Webform'
        }
      ])
      .select()
      .single();

    if (dbError) {
      console.error('Supabase Insert Error:', dbError);
      return NextResponse.json({ error: 'Database capture failed' }, { status: 500 });
    }

    // 4. Generate Dynamic Email Content based on Pillar
    let subject = 'Welcome to The Inclusion Strategist';
    let emailBody = `Hi ${firstName},<br/><br/>Thank you for reaching out.`;

    if (entity_pillar === 'financial') {
      subject = 'Your Financial Strategy Consultation - Next Steps';
      emailBody = `Hi ${firstName},<br/><br/>Thank you for requesting a wealth management consultation. Our executive financial team is reviewing your profile. You can access your secure client portal here to track your progress and book your meeting: <br/><br/><a href="https://seanleduc.ca/client-portal">Access Client Portal</a><br/><br/>Best,<br/>Sean Leduc & Team`;
    } else if (entity_pillar === 'speaking') {
      subject = 'Speaking Engagement Inquiry Received';
      emailBody = `Hi ${firstName},<br/><br/>Thank you for your interest in booking Sean Leduc for your upcoming event regarding ${subTrack}. Our booking coordinator will reach out within 24 hours to confirm availability and logistics.<br/><br/>Best,<br/>The Inclusion Strategist Team`;
    } else if (entity_pillar === 'charity') {
      subject = 'Foundation Partnership Request Received';
      emailBody = `Hi ${firstName},<br/><br/>Thank you for connecting with our philanthropy team. We are excited to explore a partnership regarding ${subTrack}. We will be in touch shortly.<br/><br/>Best,<br/>Sean Leduc`;
    }

    // 5. Fire Email via Resend
    try {
      await resend.emails.send({
        from: 'Sean Leduc <admin@seanleduc.ca>', // UPDATE TO YOUR VERIFIED DOMAIN
        to: [email.toLowerCase().trim()],
        subject: subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
            <h2 style="color: #0f172a;">The Inclusion Strategist</h2>
            <p style="color: #475569; font-size: 16px; line-height: 1.5;">
              ${emailBody}
            </p>
            <hr style="border: none; border-top: 1px solid #eaeaea; margin: 30px 0;" />
            <p style="color: #94a3b8; font-size: 12px; text-align: center;">
              © ${new Date().getFullYear()} Sean Leduc. Confidential Communication.
            </p>
          </div>
        `,
      });
    } catch (emailError) {
      // We don't want to fail the whole request if the email fails, but we should log it
      console.error('Resend Email Error:', emailError);
    }

    // 6. Return Success Response
    return NextResponse.json({ success: true, lead: newLead });

  } catch (error: any) {
    console.error('Lead Capture Pipeline Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
