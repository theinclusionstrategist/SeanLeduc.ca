'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { Contact, CRMFilterState, PaginatedResponse } from '@/types/crm';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function getContacts(filters: CRMFilterState): Promise<PaginatedResponse<Contact>> {
  try {
    const { track, agent, query, stageFilter, page = 1, pageSize = 50 } = filters;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let dbQuery = supabase
      .from('contacts')
      .select('*', { count: 'exact' })
      .eq('type', track);

    if (agent !== 'ALL') {
      dbQuery = dbQuery.eq('agent', agent);
    }

    if (stageFilter && stageFilter !== 'ALL') {
      dbQuery = dbQuery.eq('stage', stageFilter);
    }

    if (query && query.trim() !== '') {
      const sanitized = query.trim();
      dbQuery = dbQuery.or(`name.ilike.%${sanitized}%,email.ilike.%${sanitized}%,phone.ilike.%${sanitized}%`);
    }

    const { data, count, error } = await dbQuery
      .order('created_at', { ascending: false })
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

export async function updateContactStage(contactId: string, newStage: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('contacts')
      .update({
        stage: newStage,
        last_contact: new Date().toISOString()
      })
      .eq('id', contactId);

    if (error) throw new Error(error.message);

    revalidatePath('/portal');
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Stage update failed';
    return { success: false, error: msg };
  }
}
