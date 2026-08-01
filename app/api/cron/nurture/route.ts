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

export async function GET(request: Request) {
  // 🛡️ 1. Security Authorization Check
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized cron invocation' }, { status: 401 });
  }

  try {
    const now = new Date().toISOString();

    // 2. Fetch leads due for automated follow-up
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
    let failCount = 0;

    for (const lead of leads) {
      // 🛡️ 3. Isolated execution block per lead (prevents batch failure)
      try {
        if (!lead.email) continue;

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
        const firstName = lead.name ? lead.name.trim().split(' ')[0] : 'there';

        // Construct Gemini personalization prompt
        const prompt = `
          You are an elite executive assistant for ${agentName} at Sean Leduc - The Inclusion Strategist.
          Refine the following email template to make it sound warm, professional, and personalized for ${firstName}.
          
          Lead Details:
          - Name: ${lead.name}
          - Category/Interest: ${lead.category || 'Financial & Executive Strategy'}
          - Original Note: ${lead.message || 'None'}
          
          Raw Template Subject: ${template.subject_template}
          Raw Template Body: ${template.body_template}
          
          Output valid JSON format only:
          { "subject": "refined subject line", "body": "refined plain text email body" }
        `;

        let parsedEmail = {
          subject: template.subject_template,
          body: template.body_template,
        };

        // 🤖 4. AI Personalization with Safe JSON Fallback
        try {
          const aiResponse = await model.generateContent(prompt);
          const rawText = aiResponse.response.text();
          const cleanedText = rawText.replace(/```json|```/gi, '').trim();
          const aiParsed = JSON.parse(cleanedText);

          if (aiParsed.subject && aiParsed.body) {
            parsedEmail = aiParsed;
          }
        } catch (aiErr) {
          console.warn(`[AI Warning] Gemini parsing failed for lead ${lead.id}. Falling back to default template.`, aiErr);
        }

        // Hydrate template variables
        const finalSubject = parsedEmail.subject.replace(/{{first_name}}/g, firstName);
        const finalBody = parsedEmail.body
          .replace(/{{first_name}}/g, firstName)
          .replace(/{{agent_name}}/g, agentName)
          .replace(/{{category}}/g, lead.category || 'our corporate services');

        // ✉️ 5. Dispatch via Resend
        if (process.env.RESEND_API_KEY) {
          await resend.emails.send({
            from: `${agentName} <notifications@seanleduc.ca>`,
            to: [lead.email],
            subject: finalSubject,
            text: finalBody,
          });

          // Log transaction & schedule next follow-up in 7 days
          await supabase.from('nurture_logs').insert([{ lead_id: lead.id, template_id: template.id }]);
          
          const nextDate = new Date();
          nextDate.setDate(nextDate.getDate() + 7);
          
          await supabase
            .from('leads')
            .update({ 
              last_contacted_at: now, 
              next_followup_at: nextDate.toISOString() 
            })
            .eq('id', lead.id);

          sentCount++;
        }
      } catch (leadError) {
        console.error(`[Lead Error] Processing failed for lead ID ${lead.id}:`, leadError);
        failCount++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      processed: sentCount, 
      failed: failCount,
      timestamp: new Date().toISOString() 
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
