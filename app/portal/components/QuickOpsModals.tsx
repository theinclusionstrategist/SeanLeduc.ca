'use client';

import React, { useState } from 'react';
import { Contact } from '@/types/crm';
import { updateContactStage } from '@/app/actions/crm';

// Expanded type definition to accept 'Connected', 'Left VM', 'No Answer', or any string
export type QuickActionOutcome =
  | 'Left VM'
  | 'No Answer'
  | 'Connected'
  | 'Follow Up'
  | 'Scheduled'
  | string;

interface QuickOpsModalsProps {
  contact: Contact | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function QuickOpsModals({
  contact,
  isOpen,
  onClose,
  onSuccess,
}: QuickOpsModalsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !contact) return null;

  // Updated handler that accepts 'Connected' without throwing a TypeScript error
  const handleQuickSnooze = async (days: number, outcome: QuickActionOutcome) => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      let targetStage = contact.stage;

      if (outcome === 'Connected') {
        targetStage = 'Connected';
      } else if (outcome === 'Left VM' || outcome === 'No Answer') {
        targetStage = 'Reach Out / Attempted';
      }

      const res = await updateContactStage(contact.id, targetStage);

      if (!res.success) {
        throw new Error(res.error || 'Failed to update contact status');
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred during quick action';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl font-sans">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-white">Quick Action Log</h2>
            <p className="text-xs text-slate-400">Target Lead: {contact.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm font-bold p-1 rounded-lg"
          >
            ✕
          </button>
        </div>

        {errorMsg && (
          <div className="bg-red-950/80 border border-red-500/50 text-red-300 text-xs p-3 rounded-xl mb-4">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => handleQuickSnooze(0, 'Connected')}
            disabled={isSubmitting}
            className="w-full bg-emerald-600 hover:bg-emerald-500 font-bold py-3 rounded-xl text-white transition disabled:opacity-50 text-sm shadow-lg shadow-emerald-600/20"
          >
            {isSubmitting ? 'Updating...' : '📞 Mark Connected & Progress'}
          </button>

          <button
            onClick={() => handleQuickSnooze(2, 'Left VM')}
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-500 font-bold py-3 rounded-xl text-white transition disabled:opacity-50 text-sm shadow-lg shadow-blue-600/20"
          >
            {isSubmitting ? 'Updating...' : '📼 Left Voicemail (Snooze 2 Days)'}
          </button>

          <button
            onClick={() => handleQuickSnooze(1, 'No Answer')}
            disabled={isSubmitting}
            className="w-full bg-slate-800 hover:bg-slate-700 font-bold py-3 rounded-xl text-slate-200 transition disabled:opacity-50 text-sm border border-slate-700"
          >
            {isSubmitting ? 'Updating...' : '❌ No Answer (Snooze 1 Day)'}
          </button>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-200 font-medium"
          >
            Cancel / Close Modal
          </button>
        </div>
      </div>
    </div>
  );
}
