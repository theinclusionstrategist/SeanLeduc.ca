'use client';

import React, { useState } from 'react';
import { Contact } from '@/types/crm';
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
}

export default function MasterContactTable({ initialContacts }: MasterContactTableProps) {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [trackFilter, setTrackFilter] = useState<'ALL' | 'Recruit' | 'Client'>('ALL');
  const [updatingId, setUpdatingId] = useState<string | number | null>(null);

  // Filter contacts dynamically
  const filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.phone && c.phone.includes(searchQuery));

    const matchesTrack = trackFilter === 'ALL' || c.type === trackFilter;

    return matchesSearch && matchesTrack;
  });

  const handleStageChange = async (contactId: string | number, newStage: string) => {
    setUpdatingId(contactId);

    // Optimistic UI Update
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
    if (!isoString) return 'Never / Not Logged';
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
      {/* Table Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-xl font-extrabold text-white">Master Lead & Contact Registry</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time pipeline tracking and automated recruiting drip management.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search leads by name, email, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-white rounded-xl px-4 py-2.5 w-full sm:w-64 focus:outline-none focus:border-blue-500"
          />

          <select
            value={trackFilter}
            onChange={(e) => setTrackFilter(e.target.value as 'ALL' | 'Recruit' | 'Client')}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2.5 cursor-pointer focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Tracks</option>
            <option value="Recruit">Recruits Only</option>
            <option value="Client">Clients Only</option>
          </select>
        </div>
      </div>

      {/* Master Contacts Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px] tracking-wider bg-slate-950/50">
              <th className="p-3.5">Lead Name & Contact</th>
              <th className="p-3.5">Track</th>
              <th className="p-3.5">Where in Process (Stage)</th>
              <th className="p-3.5">Last Contacted</th>
              <th className="p-3.5 text-center">Auto-Nurture</th>
              <th className="p-3.5 text-right">Agent</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredContacts.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-slate-500 font-mono">
                  No matching leads found in master directory.
                </td>
              </tr>
            ) : (
              filteredContacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-slate-800/40 transition">
                  {/* Contact Details */}
                  <td className="p-3.5">
                    <div className="font-bold text-white text-sm">{contact.name}</div>
                    <div className="text-slate-400 text-[11px] font-mono mt-0.5">
                      {contact.email || contact.phone || 'No direct contact info'}
                    </div>
                  </td>

                  {/* Track Badge */}
                  <td className="p-3.5">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold font-mono uppercase ${
                        contact.type === 'Recruit'
                          ? 'bg-purple-950/80 text-purple-300 border border-purple-800/50'
                          : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/50'
                      }`}
                    >
                      {contact.type || 'Client'}
                    </span>
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
                    {contact.type === 'Recruit' ? (
                      <button
                        type="button"
                        onClick={() =>
                          handleNurtureToggle(contact.id, !!contact.nurture_active)
                        }
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

                  {/* Assigned Agent */}
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
