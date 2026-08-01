'use client';

import { useState } from 'react';

export default function HormoziCTA() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: email.split('@')[0], // Uses username portion as a default name tag
          email: email,
          category: 'IPP Executive Blueprint',
          message: 'Requested Free IPP & Corporate Insurance Executive Checklist.',
          source: 'Hormozi CTA Banner',
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to process request.');
      }

      setStatus('success');
      setEmail('');
    } catch (err: unknown) {
      setStatus('error');
      setErrorMessage(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      );
    }
  };

  return (
    <section className="bg-slate-900 border-y border-slate-800 py-16 px-6">
      <div className="max-w-4xl mx-auto text-center space-y-6">
        <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest">
          Free Executive Resource
        </span>
        
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">
          Keep More Of What You Earn. <br />
          <span className="text-blue-500">Scale Without The CRA Drain.</span>
        </h2>
        
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Get the exact IPP & Corporate Insurance checklist Sean uses to optimize executive compensation for Ontario business owners.
        </p>
        
        {/* Value Stack Badges */}
        <div className="flex flex-wrap justify-center gap-4 text-xs font-medium text-slate-300 py-2">
          <span className="bg-slate-800 px-3 py-1.5 rounded-md border border-slate-700">✓ 100% Free Strategy Guide</span>
          <span className="bg-slate-800 px-3 py-1.5 rounded-md border border-slate-700">✓ 5-Minute Read</span>
          <span className="bg-slate-800 px-3 py-1.5 rounded-md border border-slate-700">✓ No Obligation</span>
        </div>

        {/* Form State Messages */}
        {status === 'success' ? (
          <div className="max-w-lg mx-auto bg-blue-950/50 border border-blue-500/30 rounded-xl p-6 text-center space-y-2">
            <p className="text-blue-400 font-bold text-lg">🎉 Blueprint Requested!</p>
            <p className="text-slate-300 text-sm">
              Check your inbox shortly. Sean&apos;s executive team will be in touch with your custom checklist.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto pt-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your corporate email..."
              className="bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-grow"
              disabled={status === 'loading'}
              required
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-lg transition-all shadow-lg shadow-blue-600/25 whitespace-nowrap flex items-center justify-center gap-2"
            >
              {status === 'loading' ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Processing...
                </>
              ) : (
                'Claim Free Blueprint →'
              )}
            </button>
          </form>
        )}

        {status === 'error' && (
          <p className="text-red-400 text-sm pt-2">{errorMessage}</p>
        )}
      </div>
    </section>
  );
}
