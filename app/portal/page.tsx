'use client';

import { useState, useEffect, useTransition, useCallback } from 'react';
import { Contact, TrackType, AgentName } from '@/types/crm';
import { getContacts, updateContactStage } from '@/app/actions/crm';

const RECRUIT_STAGES = [
  'New Lead',
  'Reach Out / Attempted',
  'Connected',
  'Exp Pres: Tuesday @ 9:00pm EST',
  'Exp Pres: Thursday @ 7:00pm EST',
  'Exp Pres: Saturday @ 10:00am EST',
  'Exp Pres: Attended',
  'Met with Leader',
  'RECRUITED (Teammate)',
  'LONG TERM FOLLOW UP',
];

const CLIENT_STAGES = [
  'New Lead',
  'Reach Out / Attempted',
  'Connected',
  'Intro Meeting Scheduled (Sean)',
  'Intro Meeting Scheduled (Jason)',
  'Intro Meeting Held',
  'Plan Building',
  'Carryback / Presentation',
  'Closing Business',
  'Closed-Won',
  'LONG TERM FOLLOW UP',
];

export default function CRMPortal() {
  const [track, setTrack] = useState<TrackType>('Recruit');
  const [agent, setAgent] = useState<AgentName>('ALL');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const loadData = useCallback(() => {
    setErrorMessage(null);
    startTransition(async () => {
      const res = await getContacts({
        track,
        agent,
        query: debouncedSearch,
        stageFilter: 'ALL',
        page,
        pageSize: 50,
      });

      if (res.error) {
        setErrorMessage(res.error);
      } else {
        setContacts(res.data);
        setTotalCount(res.count);
        setTotalPages(res.totalPages);
      }
    });
  }, [track, agent, debouncedSearch, page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Optimistic UI Handler for stage transition
  const handleStageChange = async (contactId: string | number, newStage: string) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === contactId ? { ...c, stage: newStage } : c))
    );

    const result = await updateContactStage(contactId, newStage);
    if (!result.success) {
      setErrorMessage(`Failed to update stage: ${result.error}`);
      loadData(); // Rollback on failure
    }
  };

  const getPriorityBadge = (p?: string) => {
    switch (p) {
      case 'SUPER HOT':
        return 'bg-red-500/20 text-red-400 border-red-500/40 font-black animate-pulse';
      case 'Hot':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/40 font-bold';
      case 'Warm':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-semibold';
      case 'Luke Warm':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 space-y-6">
      {/* Executive Command Header */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-slate-900/90 backdrop-blur border border-slate-800 p-6 rounded-2xl shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-mono tracking-widest text-emerald-400 uppercase">
              Enterprise CRM Engine v2.5
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            SEAN LEDUC & ASSOCIATES
          </h1>
          <p className="text-slate-400 text-sm">
            High-Velocity Lead Conversion & Multi-Agent Recruiting Pipeline
          </p>
        </div>

        {/* Track Switcher */}
        <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-800 shadow-inner">
          <button
            onClick={() => {
              setTrack('Recruit');
              setPage(1);
            }}
            className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all duration-200 ${
              track === 'Recruit'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-1 ring-blue-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🎯 Recruits Track
          </button>
          <button
            onClick={() => {
              setTrack('Client');
              setPage(1);
            }}
            className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all duration-200 ${
              track === 'Client'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-1 ring-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            💼 Clients Track
          </button>
        </div>
      </header>

      {/* Control Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Search contacts, phones, emails..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          {isPending && (
            <div className="absolute right-3 top-3 h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          )}
        </div>

        {/* Agent Filter & Count */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          <span className="text-xs text-slate-400 font-mono">
            TOTAL: <strong className="text-white">{totalCount.toLocaleString()}</strong>
          </span>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase">Agent:</span>
            {(['ALL', 'Sean', 'Shaun'] as AgentName[]).map((ag) => (
              <button
                key={ag}
                onClick={() => {
                  setAgent(ag);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  agent === ag
                    ? 'bg-slate-700 text-white border-slate-500 shadow'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {ag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="bg-red-950/80 border border-red-500/50 rounded-xl p-4 text-red-300 text-sm font-medium">
          ⚠️ {errorMessage}
        </div>
      )}

      {/* Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[11px] font-mono tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Contact</th>
                <th className="p-4">Priority</th>
                <th className="p-4">Market / Source</th>
                <th className="p-4">Agent</th>
                <th className="p-4">Pipeline Stage</th>
                <th className="p-4">Next Best Action</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {contacts.length === 0 && !isPending ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-500 font-mono">
                    No contacts found matching current filter context.
                  </td>
                </tr>
              ) : (
                contacts.map((c) => {
                  const documentUrl = c.link || c.Link || c.Doc;
                  const nextAction = c.nba || c.NBA;

                  return (
                    <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-white text-base">{c.name || 'Unnamed Lead'}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5 font-mono">
                          <span>{c.phone || 'No Phone'}</span>
                          {c.email && <span className="text-slate-500">• {c.email}</span>}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] border uppercase tracking-wider ${getPriorityBadge(c.priority)}`}>
                          {c.priority || 'Warm'}
                        </span>
                      </td>
                      <td className="p-4 text-slate-300 text-xs font-medium">
                        {c.market || 'Cold Market'}
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-blue-400 text-xs bg-blue-950/60 border border-blue-800/50 px-2.5 py-1 rounded-md">
                          {c.agent || 'Sean'}
                        </span>
                      </td>
                      <td className="p-4">
                        <select
                          value={c.stage}
                          onChange={(e) => handleStageChange(c.id, e.target.value)}
                          className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        >
                          {(track === 'Recruit' ? RECRUIT_STAGES : CLIENT_STAGES).map((stg) => (
                            <option key={stg} value={stg}>
                              {stg}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-4 text-xs font-semibold text-emerald-400 font-mono">
                        {nextAction || '—'}
                      </td>
                      <td className="p-4 text-right">
                        {documentUrl ? (
                          <a
                            href={documentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-1.5 rounded-lg text-xs font-semibold border border-slate-700 transition-all inline-flex items-center gap-1.5"
                          >
                            📖 <span>Doc</span>
                          </a>
                        ) : (
                          <span className="text-slate-600 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Enterprise Pagination Controls */}
        <div className="flex items-center justify-between p-4 bg-slate-950 border-t border-slate-800 text-xs text-slate-400">
          <div>
            Page <strong className="text-white">{page}</strong> of <strong className="text-white">{totalPages || 1}</strong>
          </div>
          <div className="flex gap-2">
            <button
              disabled={page <= 1 || isPending}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-200 font-semibold border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 transition"
            >
              ← Previous
            </button>
            <button
              disabled={page >= totalPages || isPending}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-200 font-semibold border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 transition"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
