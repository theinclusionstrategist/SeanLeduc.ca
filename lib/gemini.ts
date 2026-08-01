import { GoogleGenerativeAI } from '@google/generative-ai';
import { Contact } from '@/types/crm';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export interface AINurtureResult {
  suggestedNBA: string;
  recommendedPriority: 'SUPER HOT' | 'Hot' | 'Warm' | 'Luke Warm' | 'Cold';
  emailDraft: string;
  smsDraft: string;
}

/**
 * Generates an automated, highly tailored nurture strategy for WFG recruits & clients.
 */
export async function generateContactNurtureStrategy(contact: Contact): Promise<AINurtureResult> {
  const prompt = `
    You are an elite multi-agent WFG Financial Services & Recruiting AI Advisor working for Sean Leduc and Shaun Bisson.
    Analyze the following contact record and generate an actionable nurture strategy.

    CONTACT PROFILE:
    - Name: ${contact.name}
    - Track Type: ${contact.type} (Recruit or Client)
    - Pipeline Stage: ${contact.stage}
    - Current Priority: ${contact.priority}
    - Assigned Agent: ${contact.agent}
    - Market/Source: ${contact.market || 'Unknown'}
    - Historical Notes: ${contact.notes || 'None recorded'}

    TASK:
    Generate a JSON object with:
    1. "suggestedNBA": A punchy 3 to 6 word Next Best Action (e.g. "📞 Call re: EP Registration", "✉️ Send Retirement Plan Intro").
    2. "recommendedPriority": Re-evaluate priority level ("SUPER HOT", "Hot", "Warm", "Luke Warm", "Cold").
    3. "emailDraft": A professional, warm 3-sentence email follow-up written from the assigned agent (${contact.agent}).
    4. "smsDraft": A concise 1-sentence SMS text message ready to copy/paste.

    Return ONLY valid JSON with no extra markdown formatting or backticks.
  `;

  try {
    const response = await model.generateContent(prompt);
    const text = response.response.text().trim();
    const cleanJson = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    return JSON.parse(cleanJson) as AINurtureResult;
  } catch (err) {
    console.error(`Gemini AI analysis failed for contact ${contact.id}:`, err);
    return {
      suggestedNBA: '📞 Manual Follow Up Required',
      recommendedPriority: contact.priority || 'Warm',
      emailDraft: `Hi ${contact.name}, following up on our recent discussion. Let me know when you have 5 minutes to chat!`,
      smsDraft: `Hi ${contact.name}, hope you're having a great week! Let's connect soon.`,
    };
  }
}
