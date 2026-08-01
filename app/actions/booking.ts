'use server';

import { createClient } from '@supabase/supabase-js';
import { sendBookingConfirmation } from '@/lib/booking-emails';
import { dispatchNewPublicLeadAlert } from '@/lib/notifications';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export interface CreateBookingPayload {
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "10:30 AM"
}

export async function createBooking(payload: CreateBookingPayload) {
  try {
    const { clientName, clientEmail, clientPhone, date, timeSlot } = payload;

    // Combine date + time into ISO timestamp
    const [timeStr, modifier] = timeSlot.split(' ');
    let [hours, minutes] = timeStr.split(':').map(Number);
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;

    const startTime = new Date(`${date}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`);
    const endTime = new Date(startTime.getTime() + 45 * 60000); // 45-min meeting

    // 1. Insert into Supabase Bookings
    const { error: dbError } = await supabase.from('bookings').insert({
      client_name: clientName,
      client_email: clientEmail,
      client_phone: clientPhone || null,
      meeting_type: 'Strategy Consultation',
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      status: 'Confirmed',
    });

    if (dbError) throw new Error(dbError.message);

    // 2. Also Upsert into CRM Leads Table
    await supabase.from('leads').upsert(
      {
        session_id: `booking-${Date.now()}`,
        name: clientName,
        email: clientEmail,
        phone: clientPhone || null,
        intent_tags: ['Calendar Scheduled', 'Strategy Consultation'],
        status: 'Meeting Scheduled',
        score: 90,
        notes: `Booked Consultation for ${startTime.toLocaleString()}`,
        agent: 'Sean',
        last_active: new Date().toISOString(),
      },
      { onConflict: 'session_id' }
    );

    // 3. Send Automated Email Confirmation to Client
    await sendBookingConfirmation({
      clientName,
      clientEmail,
      meetingType: 'Strategy Consultation',
      startTimeIso: startTime.toISOString(),
    });

    // 4. Send Instant Alert to Sean via Email & SMS
    await dispatchNewPublicLeadAlert({
      name: clientName,
      email: clientEmail,
      phone: clientPhone,
      tier: 'S-Tier Scheduled',
      dealValue: 'Confirmed Consultation',
      pillar: 'Calendar Scheduled',
      summary: `Client booked a 45-min session for ${startTime.toLocaleString('en-US', { timeZone: 'America/Toronto' })}`,
    });

    return {
      success: true,
      message: 'Consultation successfully booked! Check your email for confirmation.',
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Booking failed.';
    return { success: false, error: errorMsg };
  }
}
