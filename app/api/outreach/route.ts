import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { contact, newStage } = await req.json();

    if (!contact) {
      return NextResponse.json({ error: 'No contact data provided' }, { status: 400 });
    }

    // 1. Stage-Specific Trigger Rules
    if (newStage === 'New Lead' && contact.email) {
      await resend.emails.send({
        from: 'Sean LeDuc <contact@seanleduc.ca>',
        to: [contact.email],
        subject: 'Welcome to TIS CRM - Next Steps',
        html: `<p>Hi ${contact.name},</p><p>Thanks for getting in touch! We received your profile and will be reaching out shortly.</p>`,
      });
    } else if (newStage === 'Exp Pres: Attended' && contact.email) {
      await resend.emails.send({
        from: 'Sean LeDuc <contact@seanleduc.ca>',
        to: [contact.email],
        subject: 'Thank you for attending the Overview Session!',
        html: `<p>Hi ${contact.name},</p><p>Great having you on the session. What time works best for our follow-up intro meeting?</p>`,
      });
    }

    return NextResponse.json({ success: true, stage: newStage });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
