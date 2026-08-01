import { GoogleGenerativeAI } from '@google/generative-ai';
import { Contact } from '@/types/crm';

const apiKey =
  process.env.GEMINI_API_KEY ||
  process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
  '';

export interface GeminiContactAnalysis {
  suggestedAction: string;
  insights: string;
}

export async function analyzeContactLead(
  contact: Contact
): Promise<GeminiContactAnalysis> {
  if (!apiKey) {
    return {
      suggestedAction: 'Follow up with lead directly.',
      insights: 'Gemini API key is not configured on the server.',
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const historicalNotes = contact.notes || contact.Notes || 'None recorded';

    const prompt = `
You are an AI Sales Strategist for Sean Leduc & Associates.
Analyze the following contact:
- Name: ${contact.name}
- Stage: ${contact.stage}
- Track Type: ${contact.type}
- Assigned Agent: ${contact.agent || 'Sean'}
- Market/Source: ${contact.market || 'Unknown'}
- Historical Notes: ${historicalNotes}

TASK:
Generate a JSON object with:
{
  "suggestedAction": "Clear next best action step",
  "insights": "Short analytical summary of lead potential"
}
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    const cleanedJson = responseText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    return JSON.parse(cleanedJson) as GeminiContactAnalysis;
  } catch (err: unknown) {
    console.error('[Gemini Contact Analysis Error]:', err);
    return {
      suggestedAction: 'Reach out via phone/email.',
      insights: 'Automated analysis temporarily unavailable.',
    };
  }
}
