'use client';

import React, { useState } from 'react';
import { Contact, EntityPillar, WfgSubTrack } from '@/types/crm';
import { updateContactStage, toggleNurtureSequence } from '@/app/actions/crm';

const ALL_STAGES = [
  'New Lead',
  'Reach Out / Attempted',
  'Connected',
  'Intro Meeting Scheduled (Sean)',
  'Intro Meeting Held',
  'Plan Building',
  'Closing Business',
  'Closed-Won',
  'LONG TERM FOLLOW UP',
];

interface MasterContactTableProps {
  initialContacts: Contact[];
  currentAgent?: 'ALL' | 'Sean' | 'Shaun';
}

export default function MasterContactTable({
  initialContacts,
  currentAgent = 'ALL',
}: MasterContactTableProps) {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [activePillar, setActivePillar] = useState<EntityPillar | 'ALL'>('WFG Financial');
  const [activeSubTrack, setActiveSubTrack] = useState<WfgSubTrack | 'ALL'>('ALL');
  const [updatingId, setUpdatingId] = useState<string | number | null>(null);

  // Strict Filter Engine
  const filteredContacts = contacts.filter((c) => {
    // 1. Agent Scope Guard (Shaun only sees his assigned leads)
    if (currentAgent === 'Shaun' && c.agent !== 'Shaun') return false;

    // 2. Entity Pillar Firewall (WFG vs Speaking vs UNITE)
    if (activePillar !== 'ALL') {
      const pillarMatch = c.entity_pillar ? c.entity_pillar === activePillar : activePillar === 'WFG Financial';
      if (!pillarMatch) return false;
    }

    // 3. WFG Sub-Track Filter
    if (activePillar === 'WFG Financial' && activeSubTrack !== 'ALL') {
      const subMatch = c.sub_track ? c.sub_track === activeSubTrack : (
        activeSubTrack === 'Recruit' ? c.type === 'Recruit' : true
      );
      if (!subMatch) return false;
    }

    // 4. Search Filter
    const queryLower = searchQuery.toLowerCase();
    const matchesSearch =
      c.name.toLowerCase().includes(queryLower) ||
      (c.email && c.email.toLowerCase().includes(queryLower)) ||
      (c.phone && c.phone.includes(queryLower));

    return matchesSearch;
  });

  const handleStageChange = async (contactId: string | number, newStage: string) => {
    setUpdatingId(contactId);

    setContacts((prev) =>
      prev.map((c) =>
        c.id === contactId
          ? { ...c, stage: newStage, last_contacted: new Date().toISOString() }
          : c
      )
    );

    const res = await updateContactStage(contactId, newStage);
    if (!res.success) {
      alert(`Failed to update stage: ${res.error}`);
      setContacts(initialContacts);
    }

    setUpdatingId(null);
  };

  const handleNurtureToggle = async (contactId: string | number, currentState: boolean) => {
    setUpdatingId(contactId);
    const newState = !currentState;

    setContacts((prev) =>
      prev.map((c) => (c.id === contactId ? { ...c, nurture_active: newState } : c))
    );

    const res = await toggleNurtureSequence(contactId, newState);
    if (!res.success) {
      alert(`Failed to update nurture status: ${res.error}`);
      setContacts(initialContacts);
    }

    setUpdatingId(null);
  };

  const formatLastContacted = (isoString?: string) => {
    if (!isoString) return 'Not Logged';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'Not Logged';

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl font-sans text-slate-100 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-xl font-extrabold text-white">Master Contact Directory</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Firewalled lead registry • Role: <span className="text-blue-400 font-bold">{currentAgent === 'Shaun' ? 'Agent (Shaun)' : 'Administrator (Sean)'}</span>
          </p>
        </div>

        <input
          type="text"
          placeholder="Search leads..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-xs text-white rounded-xl px-4 py-2.5 w-full md:w-64 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Entity Pillar Firewall Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase text-slate-500 font-bold mr-2">Firewall Vertical:</span>
          {(['WFG Financial', 'Motivational Speaking', 'UNITE Charity', 'ALL'] as const).map((pillar) => (
            <button
              key={pillar}
              type="button"
              onClick={() => {
                setActivePillar(pillar);
                setActiveSubTrack('ALL');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activePillar === pillar
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {pillar}
            </button>
          ))}
        </div>

        {/* WFG Sub-Track Filters (Shown only when WFG Financial is selected) */}
        {activePillar === 'WFG Financial' && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase text-slate-500 font-bold mr-1">Category:</span>
            {(['ALL', 'Recruit', 'Business Services', 'Personal Advisory'] as const).map((sub) => (
              <button
                key={sub}
                type="button"
                onClick={() => setActiveSubTrack(sub)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                  activeSubTrack === sub
                    ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Contacts Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px] tracking-wider bg-slate-950/50">
              <th className="p-3.5">Lead Name & Info</th>
              <th className="p-3.5">Vertical / Category</th>
              <th className="p-3.5">Process Stage</th>
              <th className="p-3.5">Last Contacted</th>
              <th className="p-3.5 text-center">Auto-Nurture</th>
              <th className="p-3.5 text-right">Assigned Agent</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredContacts.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-slate-500 font-mono">
                  No firewalled contacts found matching this view.
                </td>
              </tr>
            ) : (
              filteredContacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-slate-800/40 transition">
                  {/* Lead Info */}
                  <td className="p-3.5">
                    <div className="font-bold text-white text-sm">{contact.name}</div>
                    <div className="text-slate-400 text-[11px] font-mono mt-0.5">
                      {contact.email || contact.phone || 'No contact details'}
                    </div>
                  </td>

                  {/* Pillar & Subtrack */}
                  <td className="p-3.5">
                    <div className="font-bold text-slate-200 text-xs">
                      {contact.entity_pillar || 'WFG Financial'}
                    </div>
                    <div className="text-[10px] text-blue-400 font-mono mt-0.5">
                      {contact.sub_track || (contact.type === 'Recruit' ? 'Recruit' : 'Personal Advisory')}
                    </div>
                  </td>

                  {/* Stage Dropdown */}
                  <td className="p-3.5">
                    <select
                      value={contact.stage}
                      disabled={updatingId === contact.id}
                      onChange={(e) => handleStageChange(contact.id, e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 cursor-pointer disabled:opacity-50"
                    >
                      {ALL_STAGES.map((stg) => (
                        <option key={stg} value={stg}>
                          {stg}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Last Contacted */}
                  <td className="p-3.5 font-mono text-slate-300">
                    {formatLastContacted(contact.last_contacted || contact['last contact'])}
                  </td>

                  {/* Auto Nurture Toggle */}
                  <td className="p-3.5 text-center">
                    {(contact.sub_track === 'Recruit' || contact.type === 'Recruit') ? (
                      <button
                        type="button"
                        onClick={() => handleNurtureToggle(contact.id, !!contact.nurture_active)}
                        disabled={updatingId === contact.id}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold font-mono transition ${
                          contact.nurture_active
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {contact.nurture_active ? '⚡ Active Drip' : 'Off'}
                      </button>
                    ) : (
                      <span className="text-slate-600 text-[10px] font-mono">N/A</span>
                    )}
                  </td>

                  {/* Agent Badge */}
                  <td className="p-3.5 text-right font-mono font-semibold text-blue-400">
                    {contact.agent || 'Sean'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
