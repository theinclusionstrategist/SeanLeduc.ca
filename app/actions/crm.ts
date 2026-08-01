'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { Contact, CRMFilterState, PaginatedResponse } from '@/types/crm';
import { dispatchLeadMovementAlert } from '@/lib/notifications';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function getContacts(
  filters: CRMFilterState
): Promise<PaginatedResponse<Contact>> {
  try {
    const {
      track,
      agent,
      entityPillar = 'ALL',
      subTrack = 'ALL',
      query,
      stageFilter,
      page = 1,
      pageSize = 100,
    } = filters;

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let dbQuery = supabase.from('contacts').select('*', { count: 'exact' });

    // 1. Entity Pillar Firewall (WFG Financial vs Speaking vs UNITE)
    if (entityPillar && entityPillar !== 'ALL') {
      dbQuery = dbQuery.eq('entity_pillar', entityPillar);
    }

    // 2. WFG Sub-Track Breakdown (Recruit vs Business Services vs Personal)
    if (subTrack && subTrack !== 'ALL') {
      dbQuery = dbQuery.eq('sub_track', subTrack);
    }

    // 3. Track Legacy Fallback
    if (track && track !== 'ALL') {
      dbQuery = dbQuery.eq('type', track);
    }

    // 4. Agent Isolation Scope
    if (agent && agent !== 'ALL') {
      dbQuery = dbQuery.eq('agent', agent);
    }

    if (stageFilter && stageFilter !== 'ALL') {
      dbQuery = dbQuery.eq('stage', stageFilter);
    }

    if (query && query.trim() !== '') {
      const sanitized = query.trim();
      dbQuery = dbQuery.or(
        `name.ilike.%${sanitized}%,email.ilike.%${sanitized}%,phone.ilike.%${sanitized}%,ID.ilike.%${sanitized}%`
      );
    }

    const { data, count, error } = await dbQuery
      .order('id', { ascending: false })
      .range(from, to);

    if (error) throw new Error(error.message);

    const totalRecords = count ?? 0;

    return {
      data: (data as Contact[]) || [],
      count: totalRecords,
      page,
      totalPages: Math.ceil(totalRecords / pageSize),
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch contacts';
    return { data: [], count: 0, page: 1, totalPages: 0, error: msg };
  }
}

export async function updateContactStage(
  contactId: string | number,
  newStage: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const isNumericId = typeof contactId === 'number' || !isNaN(Number(contactId));
    const nowIso = new Date().toISOString();

    let fetchQuery = supabase.from('contacts').select('name, stage, agent');
    if (isNumericId) {
      fetchQuery = fetchQuery.eq('id', Number(contactId));
    } else {
      fetchQuery = fetchQuery.eq('ID', String(contactId));
    }

    const { data: currentContact } = await fetchQuery.maybeSingle();

    let updateQuery = supabase.from('contacts').update({
      stage: newStage,
      last_contacted: nowIso,
      'last contact': nowIso,
      Updated: nowIso,
    });

    if (isNumericId) {
      updateQuery = updateQuery.eq('id', Number(contactId));
    } else {
      updateQuery = updateQuery.eq('ID', String(contactId));
    }

    const { error } = await updateQuery;
    if (error) throw new Error(error.message);

    if (currentContact && currentContact.stage !== newStage) {
      await dispatchLeadMovementAlert({
        contactName: currentContact.name || 'Lead',
        oldStage: currentContact.stage || 'Initial Stage',
        newStage,
        assignedAgent: currentContact.agent || 'Sean',
      });
    }

    revalidatePath('/portal');
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Stage update failed';
    return { success: false, error: msg };
  }
}

export async function toggleNurtureSequence(
  contactId: string | number,
  active: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const isNumericId = typeof contactId === 'number' || !isNaN(Number(contactId));
    const nextDate = active ? new Date().toISOString() : null;

    let updateQuery = supabase.from('contacts').update({
      nurture_active: active,
      next_nurture_date: nextDate,
      Updated: new Date().toISOString(),
    });

    if (isNumericId) {
      updateQuery = updateQuery.eq('id', Number(contactId));
    } else {
      updateQuery = updateQuery.eq('ID', String(contactId));
    }

    const { error } = await updateQuery;
    if (error) throw new Error(error.message);

    revalidatePath('/portal');
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Nurture toggle failed';
    return { success: false, error: msg };
  }
}

export async function moveContactStage(
  contactId: string | number,
  newStage: string
): Promise<{ success: boolean; error?: string }> {
  return updateContactStage(contactId, newStage);
}
