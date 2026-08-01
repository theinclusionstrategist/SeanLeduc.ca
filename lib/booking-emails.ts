export interface BookingDetails {
  clientName: string;
  clientEmail: string;
  meetingType: string;
  startTimeIso: string;
}

function formatBookingTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    timeZone: 'America/Toronto', // Eastern Time (Carleton Place / Ottawa)
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }) + ' (EST)';
}

async function sendEmailViaResend({
  to,
  subject,
  html,
}: {
  to: string[];
  subject: string;
  html: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[Booking Emails] RESEND_API_KEY missing. Email skipped.');
    return;
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || 'Sean Leduc <sean@seanleduc.ca>',
        to,
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error('[Resend Booking Email Error]:', err);
    }
  } catch (error) {
    console.error('[Resend Dispatch Error]:', error);
  }
}

// 1. Instant Booking Confirmation Email
export async function sendBookingConfirmation(booking: BookingDetails) {
  const formattedTime = formatBookingTime(booking.startTimeIso);

  // Email to Client
  const clientHtml = `
    <div style="font-family: Arial, sans-serif; background-color: #020617; color: #f8fafc; padding: 32px; border-radius: 16px;">
      <div style="background-color: #0f172a; border: 1px solid #1e293b; padding: 24px; border-radius: 12px;">
        <h2 style="color: #ffffff; margin-top: 0;">Consultation Confirmed</h2>
        <p style="color: #cbd5e1; font-size: 14px;">Hi ${booking.clientName},</p>
        <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
          Your <strong>${booking.meetingType}</strong> with Sean Leduc has been scheduled.
        </p>

        <div style="background-color: #020617; border: 1px solid #334155; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <div style="color: #38bdf8; font-weight: bold; font-size: 14px;">📅 Date & Time:</div>
          <div style="color: #ffffff; font-size: 16px; font-weight: bold; margin-top: 4px;">${formattedTime}</div>
        </div>

        <p style="color: #94a3b8; font-size: 13px;">
          I look forward to discussing your strategy goals. If you need to reschedule prior to our session, simply reply to this email.
        </p>

        <div style="margin-top: 24px; pt-16 border-t border-slate-800; font-size: 12px; color: #64748b;">
          Sean Leduc • The Inclusion Strategist<br />
          Carleton Place, Ontario
        </div>
      </div>
    </div>
  `;

  await sendEmailViaResend({
    to: [booking.clientEmail],
    subject: `Confirmed: ${booking.meetingType} with Sean Leduc`,
    html: clientHtml,
  });
}

// 2. Automated Meeting Reminder Email (24h or 1h before)
export async function sendBookingReminder(
  booking: BookingDetails,
  timeframe: '24 Hours' | '1 Hour'
) {
  const formattedTime = formatBookingTime(booking.startTimeIso);

  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #020617; color: #f8fafc; padding: 32px; border-radius: 16px;">
      <div style="background-color: #0f172a; border: 1px solid #1e293b; padding: 24px; border-radius: 12px;">
        <span style="background-color: #2563eb; color: #ffffff; font-size: 11px; font-weight: bold; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase;">
          Upcoming Session Reminder
        </span>
        <h2 style="color: #ffffff; margin-top: 16px;">Starting in ${timeframe}</h2>
        <p style="color: #cbd5e1; font-size: 14px;">Hi ${booking.clientName},</p>
        <p style="color: #cbd5e1; font-size: 14px;">
          This is a friendly automated reminder that your <strong>${booking.meetingType}</strong> with Sean Leduc is scheduled for:
        </p>

        <div style="background-color: #020617; border: 1px solid #38bdf8; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <div style="color: #ffffff; font-size: 16px; font-weight: bold;">${formattedTime}</div>
        </div>

        <p style="color: #94a3b8; font-size: 13px;">
          Talk to you soon!
        </p>
      </div>
    </div>
  `;

  await sendEmailViaResend({
    to: [booking.clientEmail],
    subject: `Reminder (${timeframe}): ${booking.meetingType} with Sean Leduc`,
    html,
  });
}
