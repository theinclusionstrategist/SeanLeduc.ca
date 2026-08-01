export interface RecruitingCandidate {
  id: string | number;
  name: string;
  email: string;
  stage: string;
  nurture_step: number;
}

// Resend Dispatcher
async function sendEmailOnBehalfOfSean({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[Recruiting Engine] RESEND_API_KEY missing. Email skipped.');
    return false;
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
        to: [to],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error('[Recruiting Email Error]:', err);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Recruiting Dispatch Failure]:', err);
    return false;
  }
}

// Sequence Templates for Prospective Recruits
export async function sendRecruitingNurtureStep(
  candidate: RecruitingCandidate
): Promise<{ success: boolean; nextStep: number; daysUntilNext: number }> {
  const firstName = candidate.name ? candidate.name.split(' ')[0] : 'there';
  let subject = '';
  let bodyParagraphs = '';
  let daysUntilNext = 7; // Default 7-day interval

  switch (candidate.nurture_step) {
    case 0:
      // Touch 1: Initial Post-Contact Check-in
      subject = `${firstName} — Quick question regarding your trajectory`;
      bodyParagraphs = `
        <p>I was thinking about our recent conversation regarding your professional goals and where you want to take your career over the next few years.</p>
        <p>Building a high-impact strategy practice is about clarity, perspective, and having the right platform. I'd love to share a brief breakdown of how our advisors build independence while leveraging our core team infrastructure.</p>
        <p>Do you have 10 minutes open later this week for a quick catch-up?</p>
      `;
      daysUntilNext = 7;
      break;

    case 1:
      // Touch 2: Perspective & Culture Alignment
      subject = `The Power of Perspective in Financial Leadership`;
      bodyParagraphs = `
        <p>Hi ${firstName},</p>
        <p>In our industry, most people focus purely on numbers. But what truly sets elite advisors apart is their perspective—how they solve complex corporate problems and serve their communities.</p>
        <p>I put together a short overview of our key pillars (Corporate Financial, Inclusive RDSP Strategy, and Community Impact through U.N.I.T.E.). I thought this might give you a better sense of what we're building here in Ontario.</p>
        <p>Let me know your thoughts when you have a moment to review.</p>
      `;
      daysUntilNext = 14;
      break;

    case 2:
      // Touch 3: Partnership & Strategy Invitation
      subject = `${firstName} — Next steps for our potential partnership`;
      bodyParagraphs = `
        <p>Hi ${firstName},</p>
        <p>Checking back in as we finalize our onboarding calendar for the upcoming quarter.</p>
        <p>If you're still exploring opportunities to expand your advisory capacity or build a long-term business with full support, let's sit down for coffee or jump on a call to review what a transition plan would look like.</p>
        <p>You can pick a time that works directly on my schedule here: <a href="https://www.seanleduc.ca/#consultation" style="color: #38bdf8;">Book Time with Sean</a>.</p>
      `;
      daysUntilNext = 30; // Shift to monthly touchpoint
      break;

    default:
      // Touch 4+: Long-term Monthly Check-in
      subject = `Checking in — Sean Leduc`;
      bodyParagraphs = `
        <p>Hi ${firstName},</p>
        <p>Hope everything is going well on your end.</p>
        <p>Wanted to drop a quick line to keep the line of communication open. If anything has shifted in your timeline or if you'd like to reconnect on market opportunities in Eastern Ontario, my door is always open.</p>
      `;
      daysUntilNext = 30;
      break;
  }

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; background-color: #020617; color: #f8fafc; padding: 32px; border-radius: 16px;">
      <div style="background-color: #0f172a; border: 1px solid #1e293b; padding: 24px; border-radius: 12px; color: #e2e8f0; font-size: 14px; line-height: 1.6;">
        ${bodyParagraphs}
        <br />
        <div style="margin-top: 24px; border-t: 1px solid #334155; pt-16; font-size: 13px; color: #94a3b8;">
          <strong>Sean Leduc</strong><br />
          The Inclusion Strategist • Carleton Place, ON<br />
          <a href="https://www.seanleduc.ca" style="color: #38bdf8; text-decoration: none;">www.seanleduc.ca</a>
        </div>
      </div>
    </div>
  `;

  const sent = await sendEmailOnBehalfOfSean({
    to: candidate.email,
    subject,
    html: emailHtml,
  });

  return {
    success: sent,
    nextStep: candidate.nurture_step + 1,
    daysUntilNext,
  };
}
