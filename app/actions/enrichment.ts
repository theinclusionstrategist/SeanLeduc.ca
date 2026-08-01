'use server';

import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

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
    // 1. Query Lead Data and Telemetry History
    const { data: lead } = await supabase
      .from('leads')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (!lead) throw new Error('Lead not found for session');

    // 2. Fetch telemetry
    const { data: telemetry } = await supabase
      .from('lead_telemetry')
      .select('*')
      .eq('session_id', sessionId)
      .maybeSingle();

    // 3. AI Analysis with Gemini 1.5 Flash
    if (!apiKey) throw new Error('Gemini API key missing');

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
You are the Enterprise AI Deal Officer for Sean Leduc & Associates.
Analyze this inbound lead and behavioral telemetry:

LEAD PROFILE:
- Name: ${lead.name || 'Unknown'}
- Email: ${lead.email || 'Unknown'}
- Phone: ${lead.phone || 'Not provided'}
- Intent Tags: ${JSON.stringify(lead.intent_tags || [])}
- Notes: ${lead.notes || 'None'}

BEHAVIORAL TELEMETRY:
- Scroll Depth: ${telemetry?.scroll_depth || 0}%
- Time Spent: ${telemetry?.time_on_page || 0} seconds
- Sections View Views: ${JSON.stringify(telemetry?.sections || [])}

ASSIGNMENT RULES:
- If Corporate, Keyperson, Buy-Sell, or Speaking: Assign to "Sean".
- If Personal Advisory, TFSA, RRSP, or standard insurance: Round-robin / Assign to "Shaun".

TASK:
Return a strictly formatted JSON object:
{
  "leadTier": "S-Tier Corporate" | "A-Tier High Priority" | "B-Tier Advisory" | "C-Tier Nurture",
  "estimatedDealValue": "$10,000 - $50,000 Potential Commission",
  "assignedAgent": "Sean" | "Shaun",
  "personaSummary": "2-sentence persona breakdown based on intent tags and scroll depth",
  "draftedOutreachEmail": "A highly personalized 3-paragraph outreach email written from the assigned agent to the lead."
}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const enrichedData = JSON.parse(cleanJson) as EnrichmentResult;

    // 4. Update Supabase Lead record with AI Insights & Agent Assignment
    await supabase
      .from('leads')
      .update({
        agent: enrichedData.assignedAgent,
        priority: enrichedData.leadTier,
        nba: enrichedData.personaSummary,
        notes: `${lead.notes || ''}\n\n--- AI ENRICHMENT ANALYSIS ---\nDeal Value: ${enrichedData.estimatedDealValue}\nDraft Email:\n${enrichedData.draftedOutreachEmail}`,
        Updated: new Date().toISOString(),
      })
      .eq('session_id', sessionId);

    return enrichedData;
  } catch (err: unknown) {
    console.error('[Lead Enrichment Error]:', err);
    return null;
  }
}
