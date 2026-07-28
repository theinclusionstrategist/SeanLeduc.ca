import React from 'react';
import InclusyWidget from '@/components/InclusyWidget';

export const metadata = {
  title: 'Sean Leduc | The Inclusion Strategist & Keynote Speaker',
  description:
    'Ontario-wide Financial & Insurance Advisory, Motivational Keynote Speaking, and U.N.I.T.E. Charity initiatives based in Carleton Place, ON.',
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-extrabold text-lg text-white shadow-lg shadow-blue-500/20">
              SL
            </div>
            <div>
              <span className="font-bold text-lg text-white tracking-tight block">Sean Leduc</span>
              <span className="text-xs text-blue-400 font-medium tracking-wide uppercase block">The Inclusion Strategist</span>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#financial" className="hover:text-blue-400 transition-colors">Financial Advisory</a>
            <a href="#speaking" className="hover:text-blue-400 transition-colors">Keynote Speaking</a>
            <a href="#charity" className="hover:text-blue-400 transition-colors">U.N.I.T.E. Charity</a>
          </nav>
          <a
            href="#contact"
            className="hidden sm:inline-flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs uppercase tracking-wider px-5 py-2.5 rounded-full transition-all shadow-md shadow-blue-600/30 hover:scale-105 active:scale-95"
          >
            Book Consultation
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950 pointer-events-none" />
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          
          {/* Location Badge */}
          <div className="inline-flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-4 py-1.5 rounded-full text-xs text-blue-400 font-semibold mb-8 backdrop-blur-md shadow-inner">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            Carleton Place &bull; Lanark County &bull; Ontario-Wide
          </div>

          {/* Core Brand Anchor Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-6">
            Transforming Strategic Growth Through <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              The Power of Perspective.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto font-light leading-relaxed mb-10">
            Empowering individuals, families, and business owners across Ontario with purpose-built financial architecture, resilience-focused keynote experiences, and community-first charitable initiatives.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#contact"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm px-8 py-4 rounded-xl transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-500/50"
            >
              Explore Business & Personal Advisory
            </a>
            <a
              href="#speaking"
              className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold text-sm px-8 py-4 rounded-xl transition-all"
            >
              Book Speaking Engagements
            </a>
          </div>

          {/* Perspective Quote */}
          <div className="mt-16 p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 max-w-2xl mx-auto backdrop-blur-sm">
            <blockquote className="text-slate-300 italic text-sm sm:text-base leading-relaxed">
              "True resilience isn't about avoiding adversity—it's about shifting your vantage point to reveal clarity, purpose, and total protection."
            </blockquote>
            <p className="text-xs text-blue-400 font-semibold mt-3 uppercase tracking-wider">— Sean Leduc</p>
          </div>
        </div>
      </section>

      {/* Core Brand Pillars Grid */}
      <section className="py-20 bg-slate-900/50 border-t border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs text-blue-400 font-extrabold uppercase tracking-widest mb-2">Integrated Platform</h2>
            <p className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Three Pillars. One Purpose.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Pillar 1: Financial & Insurance */}
            <div id="financial" className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 hover:border-blue-500/50 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-2xl mb-6 text-blue-400">
                  🛡️
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                  Financial Strategy
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Ontario-wide personal and corporate solutions engineered for long-term clarity and risk mitigation.
                </p>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2"><span className="text-blue-400">&bull;</span> Life, Critical Illness & Disability</li>
                  <li className="flex items-center gap-2"><span className="text-blue-400">&bull;</span> Key Person & Buy-Sell Corporate Solutions</li>
                  <li className="flex items-center gap-2"><span className="text-blue-400">&bull;</span> Inclusive RDSP & Disability Tax Credit Support</li>
                  <li className="flex items-center gap-2"><span className="text-blue-400">&bull;</span> Wealth Growth: RRSP, TFSA, FHSA, RESP</li>
                </ul>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-800/80">
                <a href="#contact" className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1">
                  Schedule Financial Review &rarr;
                </a>
              </div>
            </div>

            {/* Pillar 2: Motivational Speaking */}
            <div id="speaking" className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 hover:border-indigo-500/50 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-2xl mb-6 text-indigo-400">
                  🎤
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors">
                  Motivational Keynotes
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Inspiring corporate audiences, conventions, and organizations with powerful lessons on resilience and mobility recovery.
                </p>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2"><span className="text-indigo-400">&bull;</span> Keynote Address: "The Power of Perspective"</li>
                  <li className="flex items-center gap-2"><span className="text-indigo-400">&bull;</span> Corporate Leadership & Mental Toughness</li>
                  <li className="flex items-center gap-2"><span className="text-indigo-400">&bull;</span> Adaptive Mindset & Overcoming Physical Limits</li>
                </ul>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-800/80">
                <a href="#contact" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                  Inquire Speaking Availability &rarr;
                </a>
              </div>
            </div>

            {/* Pillar 3: U.N.I.T.E. Charity */}
            <div id="charity" className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 hover:border-purple-500/50 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-2xl mb-6 text-purple-400">
                  🤝
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors">
                  U.N.I.T.E. Charity
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Community-driven initiatives dedicated to fostering true inclusion, accessibility, and empowerment across Ontario.
                </p>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2"><span className="text-purple-400">&bull;</span> Accessibility & Mobility Support Outreach</li>
                  <li className="flex items-center gap-2"><span className="text-purple-400">&bull;</span> Community Inclusion Programs</li>
                  <li className="flex items-center gap-2"><span className="text-purple-400">&bull;</span> Sponsorship & Local Advocacy</li>
                </ul>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-800/80">
                <a href="#contact" className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1">
                  Get Involved with U.N.I.T.E. &rarr;
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Contact & Consultation Booking CTA */}
      <section id="contact" className="py-24 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-10 sm:p-14 shadow-2xl relative">
            <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-4">
              Ready to Gain Real Perspective?
            </h2>
            <p className="text-slate-300 text-base sm:text-lg mb-8 max-w-2xl mx-auto font-light">
              Whether you are looking for personal financial strategy, corporate protection, or booking a keynote address, start a conversation today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="mailto:sean@seanleduc.ca"
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm px-8 py-4 rounded-xl transition-all shadow-lg shadow-blue-600/30"
              >
                Send Direct Message
              </a>
              <p className="text-xs text-slate-400">
                Or tap the floating <span className="text-blue-400 font-semibold">Inclusy AI</span> button to chat right now!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-10 bg-slate-950 text-slate-500 text-xs text-center">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>&copy; {new Date().getFullYear()} Sean Leduc. All rights reserved. Carleton Place, Ontario.</p>
          <div className="flex gap-6 text-slate-400">
            <span>Life, Disability & Corporate Advisory</span>
            <span>&bull;</span>
            <span>Keynote Speaker</span>
          </div>
        </div>
      </footer>

      {/* Live AI Concierge Widget */}
      <InclusyWidget />
    </div>
  );
}
