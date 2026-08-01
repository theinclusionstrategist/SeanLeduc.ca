'use client';

import React, { useState } from 'react';

export default function MarketingHomePage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    pillar: 'Financial & Insurance Strategy',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Ingest directly through the Inclusy lead pipeline API
      const response = await fetch('/api/inclusy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'web-lead-' + Date.now(),
          messages: [
            {
              role: 'user',
              content: `NEW WEBSITE LEAD SUBMISSION:
Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone}
Pillar Interest: ${formData.pillar}
Message: ${formData.message}`,
            },
          ],
          leadContext: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit consultation request.');
      }

      setSubmitStatus({
        success: true,
        message:
          'Thank you! Your inquiry has been logged. Sean or an associate will connect with you within 24 hours.',
      });

      setFormData({
        name: '',
        email: '',
        phone: '',
        pillar: 'Financial & Insurance Strategy',
        message: '',
      });
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'An unexpected error occurred.';
      setSubmitStatus({ success: false, message: errorMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600">
      {/* Executive Top Navigation */}
      <nav className="fixed top-0 w-full z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
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

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#financial" className="hover:text-blue-400 transition">
              Financial & Insurance
            </a>
            <a href="#keynote" className="hover:text-blue-400 transition">
              Keynote Speaking
            </a>
            <a href="#charity" className="hover:text-blue-400 transition">
              U.N.I.T.E. Charity
            </a>
            <a href="#consultation" className="hover:text-blue-400 transition">
              Book Strategy Session
            </a>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://agentportal.seanleduc.ca"
              className="text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 px-4 py-2.5 rounded-xl transition"
            >
              Agent Portal 🔒
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-36 pb-24 px-6 relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 bg-blue-950/80 border border-blue-800/60 px-4 py-1.5 rounded-full text-blue-300 text-xs font-mono">
            <span className="h-2 w-2 rounded-full bg-blue-400 animate-ping" />
            Carleton Place • Ottawa • Province-Wide Ontario Strategy
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            The Power of Perspective in <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400">
              Wealth, Resilience & Inclusion
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
            Empowering Ontario families, business owners, and corporate leaders with purpose-driven financial strategies, transformative motivational keynotes, and community empowerment.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <a
              href="#consultation"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-xl shadow-xl shadow-blue-600/30 transition transform hover:-translate-y-0.5 text-center"
            >
              Request Strategy Consultation
            </a>
            <a
              href="#financial"
              className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold px-8 py-4 rounded-xl transition text-center"
            >
              Explore Core Services
            </a>
          </div>
        </div>
      </section>

      {/* Pillar 1: Financial & Insurance Advisory */}
      <section id="financial" className="py-24 px-6 bg-slate-900/60 border-t border-slate-800">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400">
              Pillar I • Financial & Insurance Solutions
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white">
              Ontario-Wide Personal & Corporate Strategy
            </h3>
            <p className="text-slate-400 text-sm">
              Tailored wealth building and risk mitigation designed with purpose and perspective.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-950 border border-slate-800 p-8 rounded-2xl space-y-4 hover:border-slate-700 transition">
              <div className="text-3xl">💼</div>
              <h4 className="text-xl font-bold text-white">Corporate Financial Solutions</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Key Person Insurance, Buy-Sell Funding, Corporate Whole Life, and Employee Group Benefit Plans tailored for Canadian business owners.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-8 rounded-2xl space-y-4 hover:border-slate-700 transition">
              <div className="text-3xl">🛡️</div>
              <h4 className="text-xl font-bold text-white">Inclusive & Disability Planning</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Deep expertise in Registered Disability Savings Plans (RDSP), Disability Tax Credit (DTC) alignment, and specialized long-term family care strategies.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-8 rounded-2xl space-y-4 hover:border-slate-700 transition">
              <div className="text-3xl">📈</div>
              <h4 className="text-xl font-bold text-white">Wealth & Retirement Accumulation</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Strategic wealth growth utilizing Tax-Free First Home Savings Accounts (FHSA), TFSA, RRSP, and Critical Illness protection.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pillar 2: Keynote Speaking */}
      <section id="keynote" className="py-24 px-6 bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-blue-400">
              Pillar II • Motivational Keynote Speaking
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              Transforming Challenges into Strategic Advantage
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Sean Leduc delivers inspiring keynotes on resilience, mobility navigation, and overcoming systemic obstacles. His signature address—<em>The Power of Perspective</em>—empowers corporate teams, non-profits, and educational organizations across Canada.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <span className="text-emerald-400 font-bold">✓</span> Corporate Resilience & Leadership Development
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <span className="text-emerald-400 font-bold">✓</span> Inclusive Culture & Perspective Shift Workshops
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <span className="text-emerald-400 font-bold">✓</span> Custom Keynotes for Conferences & Events
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl space-y-6 text-center">
            <span className="text-5xl">🎤</span>
            <h4 className="text-xl font-bold text-white">Book Sean for Your Next Event</h4>
            <p className="text-xs text-slate-400">
              Available for keynotes, executive retreats, and workshops in Carleton Place, Ottawa, Toronto, and nationally.
            </p>
            <a
              href="#consultation"
              className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3 rounded-xl text-xs transition"
            >
              Check Availability
            </a>
          </div>
        </div>
      </section>

      {/* Pillar 3: U.N.I.T.E. Charity */}
      <section id="charity" className="py-24 px-6 bg-slate-900/40 border-t border-slate-800">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400">
            Pillar III • Community Impact
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white">
            U.N.I.T.E. Charity Initiative
          </h3>
          <p className="text-slate-300 text-sm leading-relaxed max-w-2xl mx-auto">
            Fostering inclusion, community access, and local support programs throughout Lanark County and Eastern Ontario. Every financial consultation directly supports local community empowerment.
          </p>
        </div>
      </section>

      {/* Consultation & Lead Intake Form */}
      <section id="consultation" className="py-24 px-6 bg-slate-950 border-t border-slate-800">
        <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8">
          <div className="text-center space-y-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Schedule Your Strategy Consultation
            </h3>
            <p className="text-slate-400 text-xs">
              Direct consultation with Sean Leduc. No obligation, total transparency.
            </p>
          </div>

          {submitStatus && (
            <div
              className={`p-4 rounded-xl text-xs font-medium border ${
                submitStatus.success
                  ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                  : 'bg-rose-950/80 border-rose-500/50 text-rose-300'
              }`}
            >
              {submitStatus.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="John Doe"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
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
                  placeholder="john@example.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-slate-400 mb-1">
                  Primary Interest
                </label>
                <select
                  value={formData.pillar}
                  onChange={(e) => setFormData({ ...formData, pillar: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer"
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
                How Can We Help You?
              </label>
              <textarea
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Share a brief overview of your goals or event details..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl text-sm transition-all shadow-xl shadow-blue-600/30 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting Strategy Inquiry...' : 'Submit Request'}
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-slate-500 font-mono">
          <div>
            © 2026 Sean Leduc & Associates • The Inclusion Strategist. Carleton Place, Ontario.
          </div>
          <div className="flex gap-6">
            <a href="https://agentportal.seanleduc.ca" className="hover:text-slate-300">
              Agent CRM Portal
            </a>
            <a href="#consultation" className="hover:text-slate-300">
              Consultation
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
