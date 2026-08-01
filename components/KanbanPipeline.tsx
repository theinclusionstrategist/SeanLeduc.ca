'use client';

import React, { useState } from 'react';
import { moveContactStage } from '@/app/actions/crm';
import { Contact } from '@/types/crm';

const DEFAULT_STAGES = [
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

interface KanbanPipelineProps {
  initialContacts: Contact[];
}

export default function KanbanPipeline({ initialContacts }: KanbanPipelineProps) {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts || []);
  const [isUpdating, setIsUpdating] = useState<string | number | null>(null);

  const handleStageMove = async (contactId: string | number, targetStage: string) => {
    setIsUpdating(contactId);

    // Optimistic state update
    setContacts((prev) =>
      prev.map((c) => (c.id === contactId ? { ...c, stage: targetStage } : c))
    );

    const res = await moveContactStage(contactId, targetStage);

    if (!res.success) {
      alert(`Failed to move contact stage: ${res.error}`);
      // Revert back on error
      setContacts(initialContacts);
    }

    setIsUpdating(null);
  };

  return (
    <div className="p-6 overflow-x-auto min-h-[calc(100vh-80px)] bg-slate-950 text-slate-100 font-sans">
      <div className="flex gap-4 min-w-max pb-6">
        {DEFAULT_STAGES.map((stage) => {
          const stageContacts = contacts.filter((c) => c.stage === stage);

          return (
            <div
              key={stage}
              className="w-80 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col max-h-[85vh]"
            >
              {/* Column Header */}
              <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/60 rounded-t-2xl">
                <h3 className="font-bold text-xs uppercase text-slate-300 tracking-wider">
                  {stage}
                </h3>
                <span className="bg-slate-800 text-blue-400 text-xs font-mono font-bold px-2.5 py-0.5 rounded-full">
                  {stageContacts.length}
                </span>
              </div>

              {/* Column Cards Feed */}
              <div className="p-3 flex-1 overflow-y-auto space-y-3">
                {stageContacts.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-600 font-mono">
                    Empty Stage
                  </div>
                ) : (
                  stageContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="bg-slate-950 border border-slate-800 hover:border-slate-700 p-4 rounded-xl shadow-lg transition-all space-y-3"
                    >
                      <div>
                        <div className="font-bold text-white text-sm">
                          {contact.name || 'Unnamed Lead'}
                        </div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">
                          {contact.phone || contact.email || 'No Contact Info'}
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-slate-900">
                        <span className="text-[10px] font-semibold text-blue-400 bg-blue-950/60 border border-blue-800/50 px-2 py-0.5 rounded">
                          {contact.agent || 'Sean'}
                        </span>

                        <select
                          value={contact.stage}
                          disabled={isUpdating === contact.id}
                          onChange={(e) => handleStageMove(contact.id, e.target.value)}
                          className="bg-slate-900 border border-slate-800 text-[11px] text-slate-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500 cursor-pointer disabled:opacity-50"
                        >
                          {DEFAULT_STAGES.map((stg) => (
                            <option key={stg} value={stg}>
                              {stg}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
