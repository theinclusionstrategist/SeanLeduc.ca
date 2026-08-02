import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const { lead_id, recipient_email, recipient_name, document_type, custom_note } = await req.json();

    if (!recipient_email || !lead_id) {
      return NextResponse.json({ error: 'Missing lead_id or recipient_email' }, { status: 400 });
    }

    const accountId = process.env.DOCUSIGN_ACCOUNT_ID;
    const accessToken = process.env.DOCUSIGN_ACCESS_TOKEN;
    const baseUrl = process.env.DOCUSIGN_BASE_URL || 'https://demo.docusign.net/restapi/v2.1';

    const documentName = `${document_type || 'Agreement'}_${recipient_name.replace(/\s+/g, '_')}.pdf`;

    // 1. Construct DocuSign Envelope Payload
    const envelopeDefinition = {
      emailSubject: `Please Sign: ${document_type || 'Executive Agreement'} - Sean Leduc`,
      emailBlurb: custom_note || 'Please review and sign this agreement to complete your onboarding.',
      status: 'sent',
      documents: [
        {
          documentBase64: Buffer.from(
            `# ${document_type || 'Executive Agreement'}\n\nClient Name: ${recipient_name}\nEmail: ${recipient_email}\nDate: ${new Date().toLocaleDateString()}\n\nThis agreement confirms engagement with Sean Leduc...`
          ).toString('base64'),
          name: documentName,
          fileExtension: 'txt',
          documentId: '1',
        },
      ],
      recipients: {
        signers: [
          {
            email: recipient_email,
            name: recipient_name,
            recipientId: '1',
            routingOrder: '1',
            tabs: {
              signHereTabs: [
                {
                  anchorString: 'Sign Here:',
                  anchorUnits: 'pixels',
                  anchorYOffset: '10',
                  anchorXOffset: '20',
                },
              ],
            },
          },
        ],
      },
    };

    // 2. Transmit to DocuSign API
    const response = await fetch(`${baseUrl}/accounts/${accountId}/envelopes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(envelopeDefinition),
    });

    const docusignData = await response.json();

    if (!response.ok) {
      console.error('DocuSign API Error:', docusignData);
      return NextResponse.json({ error: docusignData.message || 'Failed to dispatch DocuSign envelope' }, { status: response.status });
    }

    // 3. Track Envelope in Supabase
    await supabase.from('docusign_envelopes').insert([
      {
        lead_id,
        envelope_id: docusignData.envelopeId,
        status: 'sent',
        document_name: documentName,
        recipient_email,
      },
    ]);

    // 4. Update Lead Stage to "nurture" / "meeting"
    await supabase
      .from('leads')
      .update({ stage: 'nurture', notes: `DocuSign Envelope (${docusignData.envelopeId}) dispatched.` })
      .eq('id', lead_id);

    return NextResponse.json({
      success: true,
      envelopeId: docusignData.envelopeId,
      status: docusignData.status,
    });
  } catch (error: any) {
    console.error('DocuSign Send Error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
