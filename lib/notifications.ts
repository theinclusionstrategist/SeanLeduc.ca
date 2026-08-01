export interface NewLeadAlertPayload {
  name: string;
  email: string;
  phone?: string;
  tier: string;
  dealValue: string;
  pillar: string;
  summary: string;
}

export interface LeadMovementAlertPayload {
  contactName: string;
  oldStage: string;
  newStage: string;
  assignedAgent: 'Sean' | 'Shaun' | string;
  updatedBy?: string;
}

// Resend Native Email Dispatcher
async function sendResendEmail({
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
    console.warn('[Notifications] RESEND_API_KEY not configured. Skipping email.');
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
        from: process.env.RESEND_FROM_EMAIL || 'Sean Leduc CRM <alerts@seanleduc.ca>',
        to,
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error('[Resend Email Error]:', err);
    }
  } catch (error) {
    console.error('[Resend Dispatch Error]:', error);
  }
}

// Twilio Native SMS Dispatcher
async function sendTwilioSMS({ to, body }: { to: string; body: string }) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    console.warn('[Notifications] Twilio credentials missing. Skipping SMS.');
    return;
  }

  try {
    const authHeader =
      'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    const params = new URLSearchParams();
    params.append('From', fromNumber);
    params.append('To', to);
    params.append('Body', body);

    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      }
    );

    if (!res.ok) {
      const err = await res.json();
      console.error('[Twilio SMS Error]:', err);
    }
  } catch (error) {
    console.error('[Twilio Dispatch Error]:', error);
  }
}

// 1. INBOUND POTENTIAL CLIENT ALERT -> SEAN ONLY
export async function dispatchNewPublicLeadAlert(payload: NewLeadAlertPayload) {
  const seanEmail = 'theinclusionstrategist@seanleduc.ca';
  const seanPhone = process.env.SEAN_MOBILE_NUMBER;

  const emailSubject = `🚨 New Inbound Lead: ${payload.name} [${payload.tier}]`;
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; background-color: #020617; color: #f8fafc; padding: 32px; border-radius: 16px;">
      <div style="background-color: #0f172a; border: 1px solid #1e293b; padding: 24px; border-radius: 12px;">
        <span style="background-color: #2563eb; color: #ffffff; font-size: 11px; font-weight: bold; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase;">
          ${payload.tier} Inbound Lead
        </span>
        <h2 style="color: #ffffff; margin-top: 16px; margin-bottom: 8px;">New Potential Client Submitted</h2>
        
        <table style="width: 100%; color: #cbd5e1; font-size: 14px; margin-top: 16px; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">Name:</td>
            <td style="padding: 8px 0; color: #ffffff;">${payload.name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">Email:</td>
            <td style="padding: 8px 0;"><a href="mailto:${payload.email}" style="color: #38bdf8;">${payload.email}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">Phone:</td>
            <td style="padding: 8px 0; color: #ffffff;">${payload.phone || 'Not provided'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">Interest:</td>
            <td style="padding: 8px 0; color: #34d399;">${payload.pillar}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">Deal Value:</td>
            <td style="padding: 8px 0; color: #fbbf24; font-weight: bold;">${payload.dealValue}</td>
          </tr>
        </table>

        <div style="margin-top: 20px; background-color: #020617; padding: 16px; border-radius: 8px; border: 1px solid #334155;">
          <strong style="color: #94a3b8; font-size: 12px; text-transform: uppercase;">AI Analysis:</strong>
          <p style="color: #e2e8f0; font-size: 13px; margin-top: 8px; line-height: 1.5;">${payload.summary}</p>
        </div>

        <div style="margin-top: 24px; text-align: center;">
          <a href="https://agentportal.seanleduc.ca" style="background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 24px; font-weight: bold; border-radius: 8px; display: inline-block;">
            Review in Agent Portal
          </a>
        </div>
      </div>
    </div>
  `;

  // Email Sean
  await sendResendEmail({
    to: [seanEmail],
    subject: emailSubject,
    html: emailHtml,
  });

  // SMS Sean
  if (seanPhone) {
    const smsBody = `🚨 NEW CLIENT INQUIRY:\nName: ${payload.name}\nInterest: ${payload.pillar}\nEst Value: ${payload.dealValue}\nPortal: https://agentportal.seanleduc.ca`;
    await sendTwilioSMS({ to: seanPhone, body: smsBody });
  }
}

// 2. LEAD MOVEMENT / UPDATE ALERT -> ASSIGNED AGENT ONLY
export async function dispatchLeadMovementAlert(payload: LeadMovementAlertPayload) {
  const isShaun = payload.assignedAgent.toLowerCase().includes('shaun');

  const targetEmail = isShaun
    ? 'shaunbisson1@gmail.com'
    : 'theinclusionstrategist@seanleduc.ca';

  const targetPhone = isShaun
    ? process.env.SHAUN_MOBILE_NUMBER
    : process.env.SEAN_MOBILE_NUMBER;

  const subject = `🔄 Pipeline Update: ${payload.contactName} moved to "${payload.newStage}"`;
  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #020617; color: #f8fafc; padding: 32px; border-radius: 16px;">
      <div style="background-color: #0f172a; border: 1px solid #1e293b; padding: 24px; border-radius: 12px;">
        <h3 style="color: #38bdf8; margin: 0 0 12px 0;">Lead Pipeline Movement</h3>
        <p style="color: #e2e8f0; font-size: 14px; margin-bottom: 16px;">
          Your assigned contact <strong>${payload.contactName}</strong> had stage activity.
        </p>
        <div style="background-color: #020617; padding: 12px 16px; border-radius: 8px; font-size: 13px; color: #cbd5e1; border: 1px solid #334155;">
          <div><strong>Previous Stage:</strong> ${payload.oldStage || 'Unknown'}</div>
          <div style="margin-top: 4px; color: #34d399;"><strong>New Stage:</strong> ${payload.newStage}</div>
        </div>
        <div style="margin-top: 20px; text-align: center;">
          <a href="https://agentportal.seanleduc.ca" style="background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 10px 20px; font-weight: bold; border-radius: 8px; display: inline-block; font-size: 13px;">
            Open Portal
          </a>
        </div>
      </div>
    </div>
  `;

  await sendResendEmail({
    to: [targetEmail],
    subject,
    html,
  });

  if (targetPhone) {
    const sms = `🔄 LEAD UPDATE (${payload.contactName}): Moved from "${payload.oldStage}" to "${payload.newStage}". Check portal: https://agentportal.seanleduc.ca`;
    await sendTwilioSMS({ to: targetPhone, body: sms });
  }
}
