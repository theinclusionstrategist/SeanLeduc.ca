import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const envelopeId = body.envelopeId || body.xml?.DocuSignEnvelopeInformation?.EnvelopeStatus?.EnvelopeID;
    const status = body.status || body.xml?.DocuSignEnvelopeInformation?.EnvelopeStatus?.Status;

    if (!envelopeId) {
      return NextResponse.json({ message: 'No Envelope ID found in payload' }, { status: 400 });
    }

    // Update tracking status in Supabase
    await supabase
      .from('docusign_envelopes')
      .update({ status: status?.toLowerCase(), updated_at: new Date().toISOString() })
      .eq('envelope_id', envelopeId);

    // If completed, download signed PDF and move lead to Converted
    if (status?.toLowerCase() === 'completed') {
      const { data: envelopeRecord } = await supabase
        .from('docusign_envelopes')
        .select('lead_id, document_name')
        .eq('envelope_id', envelopeId)
        .single();

      if (envelopeRecord?.lead_id) {
        // Fetch signed PDF from DocuSign
        const accountId = process.env.DOCUSIGN_ACCOUNT_ID;
        const accessToken = process.env.DOCUSIGN_ACCESS_TOKEN;
        const baseUrl = process.env.DOCUSIGN_BASE_URL || 'https://demo.docusign.net/restapi/v2.1';

        const pdfResponse = await fetch(`${baseUrl}/accounts/${accountId}/envelopes/${envelopeId}/documents/combined`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (pdfResponse.ok) {
          const pdfBuffer = await pdfResponse.arrayBuffer();
          const filePath = `${envelopeRecord.lead_id}/SIGNED_${envelopeRecord.document_name}`;

          // Upload to Supabase Storage
          await supabase.storage
            .from('client-vault')
            .upload(filePath, pdfBuffer, { contentType: 'application/pdf', upsert: true });

          // Record in client_documents
          await supabase.from('client_documents').insert([
            {
              lead_id: envelopeRecord.lead_id,
              file_name: `SIGNED_${envelopeRecord.document_name}`,
              file_path: filePath,
              file_size: pdfBuffer.byteLength,
              file_type: 'pdf',
              category: 'signed_contract',
            },
          ]);
        }

        // Auto-advance lead stage to 'converted'
        await supabase
          .from('leads')
          .update({ stage: 'converted' })
          .eq('id', envelopeRecord.lead_id);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('DocuSign Webhook Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
