'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
  type: 'Recruit' | 'Client' | 'Potential Referral Partner';
  stage: string;
  market_source: string;
  agent_name: string;
  priority: 'SUPER HOT' | 'Hot' | 'Warm' | 'Luke Warm' | 'Cold';
  nba: string;
  google_doc_link: string;
  notes: string;
}

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
  const [activeTrack, setActiveTrack] = useState<'Recruit' | 'Client'>('Recruit');
  const [selectedAgent, setSelectedAgent] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContacts();
  }, [activeTrack, selectedAgent]);

  async function fetchContacts() {
    setLoading(true);
    let query = supabase.from('contacts').select('*').eq('type', activeTrack);

    if (selectedAgent !== 'ALL') {
      query = query.eq('agent_name', selectedAgent);
    }

    const { data } = await query.order('created_at', { ascending: false });
    if (data) setContacts(data as Contact[]);
    setLoading(false);
  }

  async function updateStage(id: string, newStage: string) {
    await supabase.from('contacts').update({ stage: newStage }).eq('id', id);
    setContacts(contacts.map((c) => (c.id === id ? { ...c, stage: newStage } : c)));
  }

  const filteredContacts = contacts.filter(
    (c) =>
      c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone?.includes(searchQuery) ||
      c.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const priorityColor = (priority: string) => {
    switch (priority) {
      case 'SUPER HOT': return 'bg-red-600 text-white font-black animate-pulse';
      case 'Hot': return 'bg-orange-500 text-white font-bold';
      case 'Warm': return 'bg-yellow-500 text-slate-900 font-semibold';
      case 'Luke Warm': return 'bg-blue-500 text-white';
      default: return 'bg-slate-700 text-slate-300';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 space-y-6">
      {/* Top Header & Track Selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 p-6 rounded-xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-wide">
            SEAN LEDUC & ASSOCIATES CRM
          </h1>
          <p className="text-slate-400 text-sm">
            Agency Owner & Multi-Agent Lead Funnel Command Center
          </p>
        </div>

        {/* Track Switcher */}
        <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTrack('Recruit')}
            className={`px-5 py-2.5 rounded-md font-bold text-sm transition-all ${
              activeTrack === 'Recruit'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🎯 Recruits Track
          </button>
          <button
            onClick={() => setActiveTrack('Client')}
            className={`px-5 py-2.5 rounded-md font-bold text-sm transition-all ${
              activeTrack === 'Client'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            💼 Clients Track
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <input
          type="text"
          placeholder="Search by name, phone, or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-80"
        />

        {/* Agent Filter */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-semibold uppercase">Agent:</span>
          {['ALL', 'Sean', 'Shaun'].map((agent) => (
            <button
              key={agent}
              onClick={() => setSelectedAgent(agent)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                selectedAgent === agent
                  ? 'bg-slate-700 text-white border border-slate-500'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {agent}
            </button>
          ))}
        </div>
      </div>

      {/* Contacts Data Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Contact</th>
                <th className="p-4">Priority</th>
                <th className="p-4">Market / Source</th>
                <th className="p-4">Agent</th>
                <th className="p-4">Stage</th>
                <th className="p-4">Next Best Action</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Loading CRM database records...
                  </td>
                </tr>
              ) : filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No contacts found for this selection.
                  </td>
                </tr>
              ) : (
                filteredContacts.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white">{c.name}</div>
                      <div className="text-xs text-slate-400 flex gap-2">
                        <span>{c.phone || 'No phone'}</span>
                        {c.email && <span>• {c.email}</span>}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wide ${priorityColor(c.priority)}`}>
                        {c.priority || 'Warm'}
                      </span>
                    </td>
                    <td className="p-4 text-slate-300 text-xs">
                      {c.market_source || 'Cold Market'}
                    </td>
                    <td className="p-4 font-semibold text-blue-400 text-xs">
                      {c.agent_name || 'Sean'}
                    </td>
                    <td className="p-4">
                      <select
                        value={c.stage}
                        onChange={(e) => updateStage(c.id, e.target.value)}
                        className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        {(activeTrack === 'Recruit' ? RECRUIT_STAGES : CLIENT_STAGES).map((stg) => (
                          <option key={stg} value={stg}>
                            {stg}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4 text-xs font-medium text-emerald-400">
                      {c.nba || '—'}
                    </td>
                    <td className="p-4 text-right">
                      {c.google_doc_link ? (
                        <a
                          href={c.google_doc_link}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded text-xs font-semibold border border-slate-700 inline-block"
                        >
                          📖 Open Doc
                        </a>
                      ) : (
                        <span className="text-slate-600 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
