'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { Contact, CRMFilterState, PaginatedResponse } from '@/types/crm';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function getContacts(
  filters: CRMFilterState
): Promise<PaginatedResponse<Contact>> {
  try {
    const { track, agent, query, stageFilter, page = 1, pageSize = 50 } = filters;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let dbQuery = supabase
      .from('contacts')
      .select('*', { count: 'exact' });

    // Filter by Track / Type (e.g. 'Recruit' or 'Client') if specified
    if (track && track !== 'ALL') {
      dbQuery = dbQuery.eq('type', track);
    }

    // Filter by Agent
    if (agent && agent !== 'ALL') {
      dbQuery = dbQuery.eq('agent', agent);
    }

    // Filter by Pipeline Stage
    if (stageFilter && stageFilter !== 'ALL') {
      dbQuery = dbQuery.eq('stage', stageFilter);
    }

    // Search Query (Name, Email, Phone, or ID string)
    if (query && query.trim() !== '') {
      const sanitized = query.trim();
      dbQuery = dbQuery.or(
        `name.ilike.%${sanitized}%,email.ilike.%${sanitized}%,phone.ilike.%${sanitized}%,ID.ilike.%${sanitized}%`
      );
    }

    // Execute query ordered by primary key ID descending (newest first)
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

    // Match either numeric 'id' or text string 'ID' (e.g., C-ee29e384)
    let updateQuery = supabase.from('contacts').update({
      stage: newStage,
      'last contact': nowIso,
      Updated: nowIso,
    });

    if (isNumericId) {
      updateQuery = updateQuery.eq('id', Number(contactId));
    } else {
      updateQuery = updateQuery.eq('ID', contactId);
    }

    const { error } = await updateQuery;

    if (error) throw new Error(error.message);

    revalidatePath('/portal');
    revalidatePath('/dashboard/kanban');
    
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Stage update failed';
    return { success: false, error: msg };
  }
}
