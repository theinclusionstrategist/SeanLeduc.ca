import React from 'react';
import { getContacts } from '@/app/actions/crm';
import KanbanPipeline from '@/components/KanbanPipeline';

export const revalidate = 0;

export default async function PortalPage() {
  const response = await getContacts({
    track: 'ALL',
    agent: 'ALL',
    query: '',
    stageFilter: 'ALL',
    page: 1,
    pageSize: 1000,
  });

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/50 px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-white">TIS CRM Pipeline</h1>
          <p className="text-xs text-slate-400">
            Total Active Contacts Loaded: {response.count}
          </p>
        </div>
      </header>

      <KanbanPipeline initialContacts={response.data} />
    </main>
  );
}
