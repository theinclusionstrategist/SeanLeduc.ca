'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { Sparkles, Mail, ArrowRight, ShieldCheck, Loader2, KeyRound, CheckCircle2, AlertCircle, Briefcase, Mic, Heart, Command } from 'lucide-react';

export default function SecretAgentGateway() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isMagicLink, setIsMagicLink] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const supabase = createClientComponentClient();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isMagicLink) {
        const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: `${window.location.origin}/hq` } });
        if (error) throw error;
        setMessage({ type: 'success', text: 'Secure login link dispatched!' });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        router.push('/portal'); // Send directly to the hidden portal
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Authentication failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex antialiased selection:bg-blue-600 selection:text-white">
      {/* LEFT PANEL: Internal Enterprise Branding */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden flex-col justify-between p-12 border-r border-slate-800/60 bg-slate-950">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-blue-600/10 blur-[120px]" />
          <div className="absolute top-[40%] -right-[20%] w-[60%] h-[60%] rounded-full bg-indigo-600/10 blur-[120px]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-lg border border-white/10">
            <Command className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold tracking-tight text-white text-xl">System HQ</h1>
            <p className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold mt-0.5">Authorized Personnel Only</p>
          </div>
        </div>

        <div className="relative z-10 space-y-6 max-w-lg">
          <h2 className="text-4xl font-extrabold text-white leading-tight">Master Command Center</h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            Internal gateway for managing enterprise wealth portfolios, speaking engagements, and CRM routing.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2 text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-full w-max">
          <ShieldCheck className="w-4 h-4" />
          <span>Restricted Network Access</span>
        </div>
      </div>

      {/* RIGHT PANEL: Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
        <div className="w-full max-w-sm space-y-8 relative z-10">
          <div className="text-center lg:text-left space-y-2">
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Agent Login</h2>
            <p className="text-sm text-slate-400">Enter your internal credentials.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-400 ml-1">Agent Email</label>
              <div className="relative group">
                <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border border-slate-800 rounded-xl text-sm text-white focus:ring-1 focus:ring-red-500" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-400 ml-1">Admin Password</label>
              <div className="relative group">
                <KeyRound className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border border-slate-800 rounded-xl text-sm text-white focus:ring-1 focus:ring-red-500" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full py-3.5 mt-2 bg-white hover:bg-slate-100 text-slate-950 font-extrabold rounded-xl flex items-center justify-center gap-2 transition-all">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Access HQ</span>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
