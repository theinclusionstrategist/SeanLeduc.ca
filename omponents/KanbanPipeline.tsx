'use client';

import React, { useState } from 'react';
import { moveContactStage } from '@/app/actions/crm';

interface Contact {
  id: number;
  ID: string;
  name: string;
  stage: string;
  phone: string;
  email: string;
  agent: string;
  priority: string;
}

const STAGES = [
  'New Lead',
  'Reach Out / Attempted',
  'Connected',
  'Exp Pres: Attended',
  'Closed-Won',
];

export default function KanbanPipeline({ initialContacts }: { initialContacts: Contact[] }) {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);

  const handleDragStart = (e: React.DragEvent, id: number) => {
    e.dataTransfer.setData('text/plain', id.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetStage: string) => {
    e.preventDefault();
    const contactIdStr = e.dataTransfer.getData('text/plain');
    const contactId = parseInt(contactIdStr, 10);

    if (isNaN(contactId)) return;

    // Optimistic UI Update
    setContacts((prev) =>
      prev.map((c) => (c.id === contactId ? { ...c, stage: targetStage } : c))
    );

    // Persist to Supabase Backend
    const res = await moveContactStage(contactId, targetStage);
    if (!res.success) {
      alert(`Failed to update stage: ${res.error}`);
    }
  };

  return (
    <div className="flex h-[calc(100vh-120px)] gap-4 overflow-x-auto p-6 bg-slate-950 text-slate-100">
      {STAGES.map((stage) => {
        const stageContacts = contacts.filter((c) => c.stage === stage);

        return (
          <div
            key={stage}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, stage)}
            className="flex flex-col w-80 min-w-[320px] bg-slate-900 rounded-xl border border-slate-800 p-4 shadow-xl"
          >
            {/* Header */}
            <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-4">
              <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider">{stage}</h3>
              <span className="bg-blue-600/20 text-blue-400 font-bold text-xs px-2.5 py-1 rounded-full border border-blue-500/30">
                {stageContacts.length}
              </span>
            </div>

            {/* Cards List */}
            <div className="flex flex-col gap-3 overflow-y-auto pr-1 flex-1">
              {stageContacts.map((contact) => (
                <div
                  key={contact.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, contact.id)}
                  className="p-4 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-lg shadow-md cursor-grab active:cursor-grabbing transition-all hover:border-blue-500/50"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-white text-sm">{contact.name || 'Unnamed Lead'}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">
                      {contact.ID || `#${contact.id}`}
                    </span>
                  </div>
                  
                  <div className="text-xs text-slate-400 space-y-1">
                    <p>📞 {contact.phone || 'No Phone'}</p>
                    <p>✉️ {contact.email || 'No Email'}</p>
                  </div>

                  <div className="mt-3 flex justify-between items-center pt-2 border-t border-slate-700/40">
                    <span className="text-[11px] text-slate-400">Agent: <b className="text-slate-200">{contact.agent || 'Unassigned'}</b></span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      contact.priority === 'SUPER HOT' ? 'bg-red-900/60 text-red-300 border border-red-700' :
                      contact.priority === 'Hot' ? 'bg-orange-900/60 text-orange-300 border border-orange-700' :
                      'bg-slate-700 text-slate-300'
                    }`}>
                      {contact.priority || 'Cold'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
