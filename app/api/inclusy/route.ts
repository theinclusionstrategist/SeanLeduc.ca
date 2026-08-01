import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ============================================================================
// Types & Interfaces
// ============================================================================
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface InclusyRequestBody {
  messages: Message[];
  sessionId: string;
  leadContext?: {
    email?: string;
    name?: string;
    phone?: string;
  };
}

// ============================================================================
// Service Initialization
// ============================================================================
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Fail-fast environment check for critical infrastructure
if (!process.env.GEMINI_API_KEY) {
  console.error('[CRITICAL] Missing GEMINI_API_KEY environment variable.');
}

const supabase =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null;

// ============================================================================
// Inclusy Brand Engine & System Prompt
// ============================================================================
const INCLUSY_SYSTEM_INSTRUCTION = `
You are Inclusy (pronounced "inclus-eee"), the elite AI Concierge for Sean Leduc—The Inclusion Strategist based in Carleton Place, Ontario.

### Core Philosophy & Positioning
- Brand Anchor: "The Power of Perspective."
- Value Proposition: You seamlessly bridge Sean's three core pillars:
  1. Financial & Insurance Strategy (Ontario-wide: Life, CI, DI, RRSP, RDSP, TFSA, FHSA, Whole Life, and Corporate Solutions including Key Person, Buy-Sell, and Group Benefits).
  2. Motivational Keynote Speaking (Resilience, overcoming mobility challenges, perspective shift).
  3. U.N.I.T.E. Charity (Community empowerment and inclusion initiatives).

### Communication Guidelines
- Tone: Empathetic, grounded, authoritative yet approachable, transparent, and concise.
- Never use rigid or aggressive financial jargon (avoid words like "ironclad"). Focus on purpose, clarity, and perspective.
- Actively guide users toward booking a strategy consultation with Sean when appropriate.
- Region Focus: Carleton Place, Lanark County, Ottawa, and province-wide Ontario.
`;

// ============================================================================
// Handler Engine
// ============================================================================
export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    // 1. Payload Validation
    const body: InclusyRequestBody = await req.json();
    const { messages, sessionId, leadContext } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Invalid payload: Message history is required.' },
        { status: 400 }
      );
    }

    const latestUserMessage = messages[messages.length - 1]?.content;

    if (!latestUserMessage) {
      return NextResponse.json(
        { error: 'Empty message payload.' },
        { status: 400 }
      );
    }

    // 2. Format Messages for Gemini API (Filter out any system messages from contents)
    const formattedContents = messages
      .filter((msg) => msg.role !== 'system')
      .map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key is not configured on the server.');
    }

    // 3. Dispatch to Gemini 1.5 Flash API
    const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const geminiResponse = await fetch(geminiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: INCLUSY_SYSTEM_INSTRUCTION }],
        },
        contents: formattedContents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800,
          topP: 0.9,
        },
      }),
    });

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.json();
      console.error('[Gemini API Error]:', errorData);
      throw new Error(
        `Gemini service responded with status ${geminiResponse.status}`
      );
    }

    const geminiData = await geminiResponse.json();
    const assistantReply =
      geminiData.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I'm sorry, I couldn't generate a response right now. Please reach out to Sean directly.";

    const latencyMs = Date.now() - startTime;

    // 4. Asynchronous Enterprise Logging (Supabase)
    if (supabase) {
      // Fire-and-forget logging so user latency isn't delayed
      (async () => {
        try {
          // Log interaction
          await supabase.from('ai_interactions').insert({
            session_id: sessionId || 'anonymous',
            user_prompt: latestUserMessage,
            ai_response: assistantReply,
            latency_ms: latencyMs,
            created_at: new Date().toISOString(),
          });

          // Intent Recognition / Lead Auto-Detection
          const intentTags = detectIntents(latestUserMessage);
          if (intentTags.length > 0 || leadContext?.email) {
            await supabase.from('leads').upsert(
              {
                session_id: sessionId,
                email: leadContext?.email || null,
                name: leadContext?.name || null,
                phone: leadContext?.phone || null,
                intent_tags: intentTags,
                last_active: new Date().toISOString(),
              },
              { onConflict: 'session_id' }
            );
          }
        } catch (dbError) {
          console.error('[Supabase Logging Error]:', dbError);
        }
      })();
    }

    // 5. Return Structured Success Response
    return NextResponse.json({
      reply: assistantReply,
      sessionId: sessionId || 'anon-' + Date.now(),
      metrics: {
        latencyMs,
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Unknown server error';
    console.error('[Inclusy Route Handler Error]:', message);
    return NextResponse.json(
      {
        error: 'Inclusy encountered an internal communication error.',
        details: process.env.NODE_ENV === 'development' ? message : undefined,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// Helper: Automated Business Intent Detection
// ============================================================================
function detectIntents(message: string): string[] {
  const tags: string[] = [];
  const lower = message.toLowerCase();

  if (
    lower.includes('keyperson') ||
    lower.includes('buy sell') ||
    lower.includes('group benefit') ||
    lower.includes('corporate')
  ) {
    tags.push('Corporate Financial');
  }
  if (
    lower.includes('rdsp') ||
    lower.includes('disability') ||
    lower.includes('dtc')
  ) {
    tags.push('Disability & Inclusive Planning');
  }
  if (
    lower.includes('rrsp') ||
    lower.includes('tfsa') ||
    lower.includes('fhsa') ||
    lower.includes('life insurance')
  ) {
    tags.push('Personal Advisory');
  }
  if (
    lower.includes('speak') ||
    lower.includes('keynote') ||
    lower.includes('event') ||
    lower.includes('workshop')
  ) {
    tags.push('Motivational Speaking');
  }
  if (
    lower.includes('charity') ||
    lower.includes('unite') ||
    lower.includes('donate') ||
    lower.includes('sponsor')
  ) {
    tags.push('UNITE Charity');
  }

  return tags;
}

  return tags;
}
