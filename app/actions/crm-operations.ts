'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface EPTriagePayload {
  contactId: string;
  session: 'Tuesday @ 9pm' | 'Thursday @ 7pm' | 'Saturday @ 10am' | 'Special Event';
  eventDate: string; // YYYY-MM-DD
  status: 'ATTENDED' | 'MISSED';
}

export interface QuickLogPayload {
  contactId: string;
  outcome: 'Connected' | 'Left VM' | 'No Answer' | 'Booked Meeting';
  snoozeDays?: number; // e.g. 2, 5, or 10 days
  notes: string;
  customNextDate?: string;
}

/**
 * 🎯 1. EP TRIAGE ENGINE
 * Handles presentation outcome, recalculates priority, schedules follow-up, and logs interaction.
 */
export async function processEPTriage(payload: EPTriagePayload) {
  try {
    const { contactId, session, eventDate, status } = payload;
    
    const isAttended = status === 'ATTENDED';
    const newStage = isAttended ? 'Exp Pres: Attended' : 'Follow Up Required';
    const newPriority = isAttended ? 'SUPER HOT' : 'Warm';
    const daysToAdd = isAttended ? 1 : 2;

    const nextFollowUp = new Date();
    nextFollowUp.setDate(nextFollowUp.getDate() + daysToAdd);
    const nextDateStr = nextFollowUp.toISOString().split('T')[0];

    const noteEntry = isAttended
      ? `[${new Date().toLocaleDateString()}] ✅ Attended EP (${session} on ${eventDate}). Marked SUPER HOT.`
      : `[${new Date().toLocaleDateString()}] ❌ No Show to EP (${session} on ${eventDate}). Marked Warm.`;

    // Fetch existing contact notes
    const { data: contact } = await supabase
      .from('contacts')
      .select('notes')
      .eq('id', contactId)
      .single();

    const updatedNotes = contact?.notes ? `${noteEntry}\n${contact.notes}` : noteEntry;

    // Execute atomic update
    const { error } = await supabase
      .from('contacts')
      .update({
        stage: newStage,
        priority: newPriority,
        ep_attended: isAttended ? 'TRUE' : 'FALSE',
        next_date: nextDateStr,
        last_contact: new Date().toISOString(),
        notes: updatedNotes,
      })
      .eq('id', contactId);

    if (error) throw error;

    revalidatePath('/portal');
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'EP Triage failed';
    return { success: false, error: msg };
  }
}

/**
 * 📞 2. QUICK INTERACTION LOGGING ENGINE
 * Supports rapid Voicemail (+2d), Snooze (+5d/+10d), and custom date logging.
 */
export async function processQuickLog(payload: QuickLogPayload) {
  try {
    const { contactId, outcome, snoozeDays, notes, customNextDate } = payload;

    let calculatedNextDate = customNextDate;
    if (snoozeDays) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + snoozeDays);
      calculatedNextDate = targetDate.toISOString().split('T')[0];
    }

    const logMessage = notes || (outcome === 'Left VM' ? 'Left Voicemail (Quick Log)' : `${outcome} - Auto Snooze`);
    const formattedNote = `[${new Date().toLocaleDateString()}] ${outcome}: ${logMessage}`;

    const { data: contact } = await supabase
      .from('contacts')
      .select('notes')
      .eq('id', contactId)
      .single();

    const updatedNotes = contact?.notes ? `${formattedNote}\n${contact.notes}` : formattedNote;

    const { error } = await supabase
      .from('contacts')
      .update({
        notes: updatedNotes,
        last_contact: new Date().toISOString(),
        ...(calculatedNextDate && { next_date: calculatedNextDate }),
      })
      .eq('id', contactId);

    if (error) throw error;

    revalidatePath('/portal');
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Quick Log failed';
    return { success: false, error: msg };
  }
}

/**
 * 🧹 3. AUTOMATED STAGNATION SWEEPER
 * Moves contacts in 'New Lead' stage older than 30 days into 'LONG TERM FOLLOW UP'.
 */
export async function runStagnationSweeper() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: stagnantLeads, error: fetchError } = await supabase
      .from('contacts')
      .select('id')
      .eq('stage', 'New Lead')
      .lt('created_at', thirtyDaysAgo.toISOString());

    if (fetchError) throw fetchError;
    if (!stagnantLeads || stagnantLeads.length === 0) {
      return { success: true, movedCount: 0 };
    }

    const leadIds = stagnantLeads.map((l) => l.id);

    const { error: updateError } = await supabase
      .from('contacts')
      .update({ stage: 'LONG TERM FOLLOW UP', priority: 'Cold' })
      .in('id', leadIds);

    if (updateError) throw updateError;

    revalidatePath('/portal');
    return { success: true, movedCount: leadIds.length };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Sweeper failed';
    return { success: false, error: msg, movedCount: 0 };
  }
}
