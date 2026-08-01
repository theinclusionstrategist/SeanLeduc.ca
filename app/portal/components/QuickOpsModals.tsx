'use client';

import { useState } from 'react';
import { processEPTriage, processQuickLog } from '@/app/actions/crm-operations';

interface Props {
  contactId: string;
  contactName: string;
  phone?: string;
  email?: string;
  market?: string;
  type?: string;
  onClose: () => void;
}

export function EPTriageModal({ contactId, contactName, onClose }: Props) {
  const [session, setSession] = useState<'Tuesday @ 9pm' | 'Thursday @ 7pm' | 'Saturday @ 10am' | 'Special Event'>('Tuesday @ 9pm');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<'ATTENDED' | 'MISSED'>('ATTENDED');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await processEPTriage({ contactId, session, eventDate, status });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            🎯 EP Triage: <span className="text-blue-400">{contactName}</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-mono text-slate-400 uppercase">Session Date</label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-mono text-slate-400 uppercase">EP Session</label>
            <select
              value={session}
              onChange={(e) => setSession(e.target.value as any)}
              className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-sm"
            >
              <option value="Tuesday @ 9pm">Tuesday @ 9:00pm EST</option>
              <option value="Thursday @ 7pm">Thursday @ 7:00pm EST</option>
              <option value="Saturday @ 10am">Saturday @ 10:00am EST</option>
              <option value="Special Event">Special Event</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-mono text-slate-400 uppercase">Attendance Status</label>
            <div className="grid grid-cols-2 gap-3 mt-1">
              <button
                type="button"
                onClick={() => setStatus('ATTENDED')}
                className={`p-3 rounded-xl font-bold text-sm border transition-all ${
                  status === 'ATTENDED'
                    ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-600/30'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                ✅ Attended (+1d / SUPER HOT)
              </button>
              <button
                type="button"
                onClick={() => setStatus('MISSED')}
                className={`p-3 rounded-xl font-bold text-sm border transition-all ${
                  status === 'MISSED'
                    ? 'bg-amber-600 border-amber-400 text-white shadow-lg shadow-amber-600/30'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                ❌ No Show (+2d / Warm)
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-500 font-bold py-3 rounded-xl text-white transition shadow-lg shadow-blue-600/25"
        >
          {isSubmitting ? 'Updating Record...' : 'Save EP Status'}
        </button>
      </div>
    </div>
  );
}

export function QuickLogModal({ contactId, contactName, onClose }: Props) {
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQuickSnooze = async (days: number, outcome: 'Left VM' | 'No Answer') => {
    setIsSubmitting(true);
    await processQuickLog({ contactId, outcome, snoozeDays: days, notes });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="text-lg font-bold text-white">📞 Log Call: <span className="text-blue-400">{contactName}</span></h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleQuickSnooze(2, 'Left VM')}
            disabled={isSubmitting}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold py-2.5 px-2 rounded-xl text-slate-200"
          >
            📞 VM (+2 Days)
          </button>
          <button
            onClick={() => handleQuickSnooze(5, 'No Answer')}
            disabled={isSubmitting}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold py-2.5 px-2 rounded-xl text-slate-200"
          >
            💤 +5 Days
          </button>
          <button
            onClick={() => handleQuickSnooze(10, 'No Answer')}
            disabled={isSubmitting}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold py-2.5 px-2 rounded-xl text-slate-200"
          >
            💤 +10 Days
          </button>
        </div>

        <div>
          <label className="text-xs font-mono text-slate-400 uppercase">Interaction Notes</label>
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Type conversation notes here..."
            className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={() => handleQuickSnooze(0, 'Connected')}
          disabled={isSubmitting}
          className="w-full bg-emerald-600 hover:bg-emerald-500 font-bold py-3 rounded-xl text-white transition"
        >
          {isSubmitting ? 'Saving...' : 'Save Custom Interaction Log'}
        </button>
      </div>
    </div>
  );
}

export function QRModal({ contactName, phone, email, market, type, onClose }: Props) {
  const comp = `WFG - ${market || 'Cold'} ${type || 'Recruit'} Lead`;
  const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${contactName}\nORG:${comp}\nTEL;TYPE=CELL:${phone || ''}\nEMAIL;TYPE=WORK:${email || ''}\nEND:VCARD`;
  const qrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(vcard)}&size=250`;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
        <h3 className="text-lg font-bold text-white">📲 iPhone vCard QR</h3>
        <p className="text-xs text-slate-400">Scan with iPhone camera to save directly to Contacts</p>
        
        <div className="bg-white p-4 rounded-xl inline-block shadow-inner">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrUrl} alt="vCard QR Code" className="w-48 h-48 mx-auto" />
        </div>

        <div className="text-xs font-mono text-slate-300">
          <p className="font-bold text-white">{contactName}</p>
          <p>{phone || 'No Phone'}</p>
        </div>

        <button onClick={onClose} className="w-full bg-slate-800 hover:bg-slate-700 font-bold py-2.5 rounded-xl text-slate-200 text-sm">
          Close
        </button>
      </div>
    </div>
  );
}
