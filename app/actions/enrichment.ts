'use server';

import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { dispatchNewPublicLeadAlert } from '@/lib/notifications';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const apiKey = process.env.GEMINI_API_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

export interface EnrichmentResult {
  leadTier: 'S-Tier Corporate' | 'A-Tier High Priority' | 'B-Tier Advisory' | 'C-Tier Nurture';
  estimatedDealValue: string;
  assignedAgent: 'Sean' | 'Shaun';
  personaSummary: string;
  draftedOutreachEmail: string;
}

export async function enrichAndRouteLead(sessionId: string): Promise<EnrichmentResult | null> {
  try {
    const { data: lead } = await supabase
      .from('leads')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (!lead) throw new Error('Lead not found for session');

    const { data: telemetry } = await supabase
      .from('lead_telemetry')
      .select('*')
      .eq('session_id', sessionId)
      .maybeSingle();

    if (!apiKey) throw new Error('Gemini API key missing');

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
You are the Enterprise AI Deal Officer for Sean Leduc & Associates.
Analyze this inbound lead:

LEAD PROFILE:
- Name: ${lead.name || 'Unknown'}
- Email: ${lead.email || 'Unknown'}
- Phone: ${lead.phone || 'Not provided'}
- Intent Tags: ${JSON.stringify(lead.intent_tags || [])}
- Notes: ${lead.notes || 'None'}

BEHAVIORAL TELEMETRY:
- Scroll Depth: ${telemetry?.scroll_depth || 0}%
- Time Spent: ${telemetry?.time_on_page || 0} seconds

TASK:
Return a strictly formatted JSON object:
{
  "leadTier": "S-Tier Corporate" | "A-Tier High Priority" | "B-Tier Advisory" | "C-Tier Nurture",
  "estimatedDealValue": "$10,000 - $50,000 Potential Commission",
  "assignedAgent": "Sean",
  "personaSummary": "2-sentence persona breakdown based on intent tags and scroll depth",
  "draftedOutreachEmail": "A highly personalized 3-paragraph outreach email written from Sean to the lead."
}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const enrichedData = JSON.parse(cleanJson) as EnrichmentResult;

    // Save lead details
    await supabase
      .from('leads')
      .update({
        agent: 'Sean', // Inbound client leads owned by Sean
        priority: enrichedData.leadTier,
        nba: enrichedData.personaSummary,
        notes: `${lead.notes || ''}\n\n--- AI ENRICHMENT ---\nDeal Value: ${enrichedData.estimatedDealValue}\nDraft Email:\n${enrichedData.draftedOutreachEmail}`,
        Updated: new Date().toISOString(),
      })
      .eq('session_id', sessionId);

    // Send instant Email + SMS alert EXCLUSIVELY to Sean
    await dispatchNewPublicLeadAlert({
      name: lead.name || 'Anonymous Prospect',
      email: lead.email || 'No email provided',
      phone: lead.phone || undefined,
      tier: enrichedData.leadTier,
      dealValue: enrichedData.estimatedDealValue,
      pillar: lead.intent_tags?.[0] || 'General Strategy',
      summary: enrichedData.personaSummary,
    });

    return enrichedData;
  } catch (err: unknown) {
    console.error('[Lead Enrichment Error]:', err);
    return null;
  }
}
