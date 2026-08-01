import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendBookingReminder } from '@/lib/booking-emails';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    const now = new Date();

    // 1. Process 24-Hour Reminders
    const in24hMin = new Date(now.getTime() + 23.5 * 3600000).toISOString();
    const in24hMax = new Date(now.getTime() + 24.5 * 3600000).toISOString();

    const { data: bookings24h } = await supabase
      .from('bookings')
      .select('*')
      .eq('status', 'Confirmed')
      .eq('reminder_24h_sent', false)
      .gte('start_time', in24hMin)
      .lte('start_time', in24hMax);

    if (bookings24h && bookings24h.length > 0) {
      for (const booking of bookings24h) {
        await sendBookingReminder(
          {
            clientName: booking.client_name,
            clientEmail: booking.client_email,
            meetingType: booking.meeting_type,
            startTimeIso: booking.start_time,
          },
          '24 Hours'
        );

        await supabase
          .from('bookings')
          .update({ reminder_24h_sent: true })
          .eq('id', booking.id);
      }
    }

    // 2. Process 1-Hour Reminders
    const in1hMin = new Date(now.getTime() + 0.5 * 3600000).toISOString();
    const in1hMax = new Date(now.getTime() + 1.5 * 3600000).toISOString();

    const { data: bookings1h } = await supabase
      .from('bookings')
      .select('*')
      .eq('status', 'Confirmed')
      .eq('reminder_1h_sent', false)
      .gte('start_time', in1hMin)
      .lte('start_time', in1hMax);

    if (bookings1h && bookings1h.length > 0) {
      for (const booking of bookings1h) {
        await sendBookingReminder(
          {
            clientName: booking.client_name,
            clientEmail: booking.client_email,
            meetingType: booking.meeting_type,
            startTimeIso: booking.start_time,
          },
          '1 Hour'
        );

        await supabase
          .from('bookings')
          .update({ reminder_1h_sent: true })
          .eq('id', booking.id);
      }
    }

    return NextResponse.json({
      success: true,
      processed24h: bookings24h?.length || 0,
      processed1h: bookings1h?.length || 0,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Cron failed';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
