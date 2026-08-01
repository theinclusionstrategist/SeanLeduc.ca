import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendRecruitingNurtureStep } from '@/lib/recruiting-nurture';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    const nowIso = new Date().toISOString();

    // Query active recruit leads whose next_nurture_date has passed
    const { data: recruits, error } = await supabase
      .from('contacts')
      .select('id, name, email, stage, nurture_step')
      .eq('type', 'Recruit')
      .eq('nurture_active', true)
      .lte('next_nurture_date', nowIso);

    if (error) throw new Error(error.message);

    let processedCount = 0;

    if (recruits && recruits.length > 0) {
      for (const recruit of recruits) {
        if (!recruit.email) continue;

        const result = await sendRecruitingNurtureStep({
          id: recruit.id,
          name: recruit.name,
          email: recruit.email,
          stage: recruit.stage,
          nurture_step: recruit.nurture_step || 0,
        });

        if (result.success) {
          processedCount++;
          const nextDate = new Date();
          nextDate.setDate(nextDate.getDate() + result.daysUntilNext);

          // Update record: update last_contacted, increment step, schedule next date
          await supabase
            .from('contacts')
            .update({
              last_contacted: new Date().toISOString(),
              'last contact': new Date().toISOString(),
              nurture_step: result.nextStep,
              next_nurture_date: nextDate.toISOString(),
            })
            .eq('id', recruit.id);
        }
      }
    }

    return NextResponse.json({
      success: true,
      processedRecruits: processedCount,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Recruiting cron error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
