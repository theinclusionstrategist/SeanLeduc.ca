'use client';

import { useState } from 'react';
import { notFound } from 'next/navigation';
import { 
  Briefcase, 
  Mic, 
  Heart, 
  ArrowRight, 
  ShieldCheck, 
  Loader2, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';

// Dynamic content configuration based on URL pillar
const PILLAR_CONFIG = {
  financial: {
    title: 'Executive Financial Strategy',
    subtitle: 'Secure your legacy. Request a private wealth management consultation with Sean Leduc and the WFG team.',
    icon: Briefcase,
    color: 'from-emerald-600 to-teal-600',
    shadow: 'shadow-emerald-500/20',
    textHighlight: 'text-emerald-400',
    bgGlow: 'bg-emerald-500/10',
    subTracks: ['Wealth Management', 'Life Insurance', 'Retirement Planning', 'Corporate Structuring']
  },
  speaking: {
    title: 'Book Sean for Your Next Event',
    subtitle: 'Elevate your stage. Inquire about keynote availability, executive workshops, and speaking fees.',
    icon: Mic,
    color: 'from-purple-600 to-indigo-600',
    shadow: 'shadow-purple-500/20',
    textHighlight: 'text-purple-400',
    bgGlow: 'bg-purple-500/10',
    subTracks: ['Keynote Address', 'Corporate Workshop', 'Panel Discussion', 'Podcast Interview']
  },
  charity: {
    title: 'Philanthropy & Foundation Partnerships',
    subtitle: 'Join forces with The Inclusion Strategist to drive meaningful change and community impact.',
    icon: Heart,
    color: 'from-amber-500 to-orange-600',
    shadow: 'shadow-amber-500/20',
    textHighlight: 'text-amber-400',
    bgGlow: 'bg-amber-500/10',
    subTracks: ['Corporate Sponsorship', 'Grant Application', 'Volunteer Initiatives', 'Direct Donation']
  }
};

export default function LeadCapturePage({ params }: { params: { pillar: string } }) {
  const pillarKey = params.pillar.toLowerCase() as keyof typeof PILLAR_CONFIG;
  const config = PILLAR_CONFIG[pillarKey];

  // If the URL isn't one of our 3 pillars, throw a 404
  if (!config) return notFound();

  const Icon = config.icon;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subTrack: config.subTracks[0]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/leads/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          entity_pillar: pillarKey
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit request');
      }

      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col antialiased selection:bg-blue-600 selection:text-white relative overflow-hidden">
      
      {/* Dynamic Background Glow */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full blur-[150px] pointer-events-none ${config.bgGlow}`} />

      {/* HEADER */}
      <header className="relative z-10 max-w-5xl mx-auto w-full px-6 py-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-700 flex items-center justify-center text-white border border-slate-600 shadow-xl">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="font-extrabold tracking-tight text-white text-lg">Sean Leduc</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Secure Request</span>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Left Column: Marketing Copy */}
          <div className="space-y-8">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${config.color} flex items-center justify-center text-white shadow-2xl ${config.shadow} border border-white/10`}>
              <Icon className="w-8 h-8" />
            </div>
            
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                {config.title}
              </h1>
              <p className="text-lg text-slate-400 leading-relaxed max-w-lg">
                {config.subtitle}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {[
                'Direct access to our executive strategy team.',
                'Custom-tailored solutions for your specific goals.',
                'Secure, confidential, and priority processing.'
              ].map((bullet, i) => (
                <div key={i} className="flex items-center gap-3 text-sm font-medium text-slate-300">
                  <CheckCircle2 className={`w-5 h-5 ${config.textHighlight}`} />
                  <span>{bullet}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Lead Form */}
          <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative">
            {isSuccess ? (
              <div className="text-center py-12 space-y-6 animate-in fade-in zoom-in duration-500">
                <div className={`w-20 h-20 mx-auto rounded-full ${config.bgGlow} flex items-center justify-center ${config.textHighlight}`}>
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Request Received</h3>
                  <p className="text-sm text-slate-400">
                    Thank you. A confirmation email has been dispatched to your inbox. Our executive team will be in touch shortly.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">First Name *</label>
                    <input
                      required type="text"
                      value={formData.firstName}
                      onChange={e => setFormData({...formData, firstName: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Last Name *</label>
                    <input
                      required type="text"
                      value={formData.lastName}
                      onChange={e => setFormData({...formData, lastName: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Email Address *</label>
                  <input
                    required type="email"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Area of Interest</label>
                  <select
                    value={formData.subTrack}
                    onChange={e => setFormData({...formData, subTrack: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition appearance-none"
                  >
                    {config.subTracks.map(track => (
                      <option key={track} value={track}>{track}</option>
                    ))}
                  </select>
                </div>

                {error && <p className="text-xs text-red-400 font-medium text-center">{error}</p>}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-4 mt-2 bg-gradient-to-r ${config.color} text-white font-extrabold rounded-xl ${config.shadow} flex items-center justify-center gap-2 hover:opacity-90 transition transform hover:-translate-y-0.5 disabled:opacity-50`}
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>
                      <span>Submit Secure Request</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

        </div>
      </main>

      <footer className="relative z-10 py-8 text-center text-xs font-medium text-slate-600">
        <p>© {new Date().getFullYear()} The Inclusion Strategist. All communications are confidential.</p>
      </footer>
    </div>
  );
}
