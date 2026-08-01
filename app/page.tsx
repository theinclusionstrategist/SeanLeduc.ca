'use client';

import React, { useState } from 'react';
import RDSPCalculator from '@/components/RDSPCalculator';
import { submitPublicLead } from '@/app/actions/leads';

export default function MarketingHomePage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    pillar: 'Financial & Insurance Strategy',
    message: '',
    honeypot: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    const res = await submitPublicLead(formData);

    if (res.success) {
      setStatus({ success: true, message: res.message || 'Submitted successfully!' });
      setFormData({
        name: '',
        email: '',
        phone: '',
        pillar: 'Financial & Insurance Strategy',
        message: '',
        honeypot: '',
      });
    } else {
      setStatus({ success: false, message: res.error || 'Submission failed.' });
    }

    setIsSubmitting(false);
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What financial services does Sean Leduc specialize in?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sean Leduc specializes in Corporate Key Person Insurance, Buy-Sell Funding, Group Benefits, Registered Disability Savings Plans (RDSP), Whole Life, and Wealth Accumulation across Ontario.',
        },
      },
      {
        '@type': 'Question',
        name: 'Where is Sean Leduc located?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sean Leduc is based in Carleton Place, Ontario, serving clients throughout Lanark County, Ottawa, and province-wide.',
        },
      },
      {
        '@type': 'Question',
        name: 'How can I book Sean Leduc for a keynote speaking event?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'You can request availability for corporate keynotes, workshops, and conference addresses directly through the online consultation form on www.seanleduc.ca.',
        },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-40 bg-slate-950/80 backdrop-blur-2xl border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-blue-600/30">
              SL
            </div>
            <div>
              <span className="font-extrabold text-lg text-white tracking-tight block leading-none">
                SEAN LEDUC
              </span>
              <span className="text-[10px] text-blue-400 font-mono tracking-widest uppercase">
                The Inclusion Strategist
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <a href="#financial" className="hover:text-white transition">
              Financial & Insurance
            </a>
            <a href="#calculator" className="hover:text-white transition">
              RDSP Estimator
            </a>
            <a href="#keynote" className="hover:text-white transition">
              Speaking
            </a>
            <a href="#consultation" className="hover:text-white transition">
              Contact
            </a>
          </div>

          <a
            href="https://agentportal.seanleduc.ca"
            className="text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 px-4 py-2.5 rounded-xl transition"
          >
            Agent Portal 🔒
          </a>
        </div>
      </nav>

      {/* Hero Header */}
      <section className="pt-36 pb-20 px-6 relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 bg-blue-950/80 border border-blue-800/60 px-4 py-1.5 rounded-full text-blue-300 text-xs font-mono">
            <span className="h-2 w-2 rounded-full bg-blue-400 animate-ping" />
            Carleton Place • Ottawa • Province-Wide Ontario Advisory
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            The Power of Perspective in <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400">
              Wealth, Resilience & Inclusion
            </span>
          </h1>

          <p className="text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            High-velocity financial strategy, disability planning, corporate risk mitigation, and transformative keynote speaking designed with purpose and perspective.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <a
              href="#consultation"
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-xl shadow-xl shadow-blue-600/30 transition text-center"
            >
              Book Strategy Consultation
            </a>
            <a
              href="#calculator"
              className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold px-8 py-4 rounded-xl transition text-center"
            >
              Launch Wealth Calculator
            </a>
          </div>
        </div>
      </section>

      {/* FinTech Estimator Section */}
      <section id="calculator" className="py-20 px-6 bg-slate-950 border-t border-slate-800">
        <div className="max-w-5xl mx-auto">
          <RDSPCalculator />
        </div>
      </section>

      {/* Lead Capture Form */}
      <section id="consultation" className="py-24 px-6 bg-slate-900/60 border-t border-slate-800">
        <div className="max-w-3xl mx-auto bg-slate-950 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8">
          <div className="text-center space-y-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Schedule Your Strategy Session
            </h3>
            <p className="text-slate-400 text-xs">
              Direct connection with Sean Leduc. Confidential, zero-obligation advisory.
            </p>
          </div>

          {status && (
            <div
              className={`p-4 rounded-xl text-xs font-medium border ${
                status.success
                  ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                  : 'bg-rose-950/80 border-rose-500/50 text-rose-300'
              }`}
            >
              {status.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Hidden Bot Honeypot */}
            <input
              type="text"
              name="honeypot"
              value={formData.honeypot}
              onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
            />

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase font-bold text-slate-400 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Sean Leduc"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-slate-400 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="sean@example.com"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase font-bold text-slate-400 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(613) 555-0199"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-slate-400 mb-1">
                  Primary Interest
                </label>
                <select
                  value={formData.pillar}
                  onChange={(e) => setFormData({ ...formData, pillar: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="Financial & Insurance Strategy">Financial & Insurance Strategy</option>
                  <option value="Corporate / Group Benefits">Corporate / Group Benefits</option>
                  <option value="RDSP & Inclusive Planning">RDSP & Inclusive Planning</option>
                  <option value="Keynote Speaking Booking">Keynote Speaking Booking</option>
                  <option value="U.N.I.T.E. Charity Initiatives">U.N.I.T.E. Charity Initiatives</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-slate-400 mb-1">
                Message Overview
              </label>
              <textarea
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Share a brief overview of your goals or event details..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl text-sm transition shadow-xl shadow-blue-600/30 disabled:opacity-50"
            >
              {isSubmitting ? 'Routing Inquiry...' : 'Submit Strategy Inquiry'}
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-12 px-6 text-center text-xs text-slate-500 font-mono">
        © 2026 Sean Leduc & Associates • The Inclusion Strategist. Carleton Place, Ontario.
      </footer>
    </div>
  );
}
