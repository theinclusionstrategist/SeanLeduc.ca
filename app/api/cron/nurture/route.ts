import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { GoogleGenerativeAI } from '@google/generative-ai';

const resend = new Resend(process.env.RESEND_API_KEY);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const now = new Date().toISOString();

    // 1. Fetch leads due for follow-up
    const { data: leads, error } = await supabase
      .from('leads')
      .select(`
        *,
        agents ( name, email )
      `)
      .lte('next_followup_at', now)
      .neq('stage', 'CLOSED_WON')
      .neq('stage', 'ARCHIVED')
      .limit(20);

    if (error) throw error;
    if (!leads || leads.length === 0) {
      return NextResponse.json({ message: 'No leads pending follow-up today.' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    let sentCount = 0;

    for (const lead of leads) {
      // Fetch applicable template for lead's current stage
      const { data: template } = await supabase
        .from('nurture_templates')
        .select('*')
        .eq('stage', lead.stage)
        .eq('active', true)
        .limit(1)
        .single();

      if (!template) continue;

      const agentName = lead.agents?.name || 'Sean Leduc';
      const firstName = lead.name ? lead.name.split(' ')[0] : 'there';

      // Use Gemini to lightly personalize the template based on lead details
      const prompt = `
        You are an elite executive assistant for ${agentName} at Sean Leduc - The Inclusion Strategist.
        Refine the following email template to make it sound warm, professional, and personalized for ${firstName}.
        
        Lead Details:
        - Name: ${lead.name}
        - Category/Interest: ${lead.category || 'Financial & Executive Strategy'}
        - Original Note: ${lead.message || 'None'}
        
        Raw Template Subject: ${template.subject_template}
        Raw Template Body: ${template.body_template}
        
        Output JSON format only:
        { "subject": "refined subject line", "body": "refined plain text email body" }
      `;

      const aiResponse = await model.generateContent(prompt);
      const cleanedText = aiResponse.response.text().replace(/```json|```/g, '').trim();
      const parsedEmail = JSON.parse(cleanedText);

      // Send email via Resend
      if (process.env.RESEND_API_KEY && lead.email) {
        await resend.emails.send({
          from: `${agentName} <notifications@seanleduc.ca>`,
          to: [lead.email],
          subject: parsedEmail.subject.replace('{{first_name}}', firstName),
          text: parsedEmail.body
            .replace(/{{first_name}}/g, firstName)
            .replace(/{{agent_name}}/g, agentName)
            .replace(/{{category}}/g, lead.category || 'our corporate services'),
        });

        // Record log & schedule next follow-up in 7 days
        await supabase.from('nurture_logs').insert([{ lead_id: lead.id, template_id: template.id }]);
        
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + 7);
        await supabase
          .from('leads')
          .update({ last_contacted_at: now, next_followup_at: nextDate.toISOString() })
          .eq('id', lead.id);

        sentCount++;
      }
    }

    return NextResponse.json({ success: true, processed: sentCount });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
