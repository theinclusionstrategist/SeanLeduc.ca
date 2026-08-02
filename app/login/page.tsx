'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Mail,
  ArrowRight,
  ShieldCheck,
  Loader2,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Mic,
  Heart,
  Command
} from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isMagicLink, setIsMagicLink] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    // Auto-redirect if already authenticated
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        routeUserByRole(session.user.email);
      }
    };
    checkSession();
  }, []);

  const routeUserByRole = (userEmail?: string) => {
    if (!userEmail) return;

    const adminEmails = [
      'sean@seanleduc.ca',
      'shaun@seanleduc.ca',
      'agent@seanleduc.ca',
      'theinclusionstrategist@gmail.com'
    ];

    const isAgent = adminEmails.includes(userEmail.toLowerCase().trim()) || userEmail.endsWith('@seanleduc.ca');

    if (isAgent) {
      router.push('/portal');
    } else {
      router.push('/client-portal');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isMagicLink) {
        const { error } = await supabase.auth.signInWithOtp({
          email: email.trim(),
          options: {
            emailRedirectTo: `${window.location.origin}/login`,
          },
        });

        if (error) throw error;

        setMessage({
          type: 'success',
          text: 'Secure login link dispatched! Please check your email inbox.',
        });
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw error;

        if (data.session) {
          routeUserByRole(data.session.user.email);
        }
      }
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.message || 'Authentication failed. Please verify credentials.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex antialiased selection:bg-blue-600 selection:text-white">
      
      {/* LEFT PANEL: Enterprise Branding (Hidden on mobile/tablet) */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden flex-col justify-between p-12 border-r border-slate-800/60 bg-slate-950">
        
        {/* Dynamic Mesh Gradient Background */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-blue-600/10 blur-[120px]" />
          <div className="absolute top-[40%] -right-[20%] w-[60%] h-[60%] rounded-full bg-indigo-600/10 blur-[120px]" />
          <div className="absolute -bottom-[20%] left-[20%] w-[80%] h-[80%] rounded-full bg-emerald-600/5 blur-[120px]" />
          {/* Subtle Grid Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        </div>

        {/* Top Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 border border-white/10">
            <Command className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold tracking-tight text-white text-xl">The Inclusion Strategist</h1>
            <p className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold mt-0.5">Command Center</p>
          </div>
        </div>

        {/* Center Hero Copy */}
        <div className="relative z-10 space-y-6 max-w-lg">
          <h2 className="text-4xl font-extrabold text-white leading-tight">
            Architecting legacy through financial strategy and global influence.
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            Welcome to the centralized executive hub. Securely manage wealth portfolios, speaking engagements, and philanthropic initiatives from one encrypted interface.
          </p>

          <div className="flex flex-col gap-4 pt-4">
            <div className="flex items-center gap-4 text-sm font-medium text-slate-300">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Briefcase className="w-4 h-4" />
              </div>
              Executive Wealth Management
            </div>
            <div className="flex items-center gap-4 text-sm font-medium text-slate-300">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Mic className="w-4 h-4" />
              </div>
              Global Keynotes & Workshops
            </div>
            <div className="flex items-center gap-4 text-sm font-medium text-slate-300">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Heart className="w-4 h-4" />
              </div>
              Philanthropic Foundations
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="relative z-10 flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full w-max shadow-lg shadow-emerald-900/20">
          <ShieldCheck className="w-4 h-4" />
          <span>AES-256 Encrypted Environment</span>
        </div>
      </div>

      {/* RIGHT PANEL: Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
        
        {/* Mobile Background Glow (Visible only on small screens) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-b from-blue-600/5 to-transparent rounded-full blur-[100px] lg:hidden pointer-events-none" />

        <div className="w-full max-w-sm space-y-8 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* Mobile Header (Hidden on Desktop) */}
          <div className="flex items-center gap-3 justify-center lg:hidden mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 border border-white/10">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <h1 className="font-extrabold tracking-tight text-white text-lg">Sean Leduc</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Command Center</p>
            </div>
          </div>

          <div className="text-center lg:text-left space-y-2">
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Welcome Back</h2>
            <p className="text-sm text-slate-400">Authenticate to access your workspace.</p>
          </div>

          {/* Mode Switcher */}
          <div className="flex p-1 bg-slate-900/80 border border-slate-800 rounded-xl text-xs font-bold backdrop-blur-md">
            <button
              type="button"
              onClick={() => setIsMagicLink(false)}
              className={`flex-1 py-2.5 rounded-lg transition-all duration-300 ${!isMagicLink ? 'bg-slate-800 text-white shadow-md border border-slate-700/50' : 'text-slate-400 hover:text-white'}`}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => setIsMagicLink(true)}
              className={`flex-1 py-2.5 rounded-lg transition-all duration-300 ${isMagicLink ? 'bg-slate-800 text-white shadow-md border border-slate-700/50' : 'text-slate-400 hover:text-white'}`}
            >
              Magic Link
            </button>
          </div>

          {/* Alert Message */}
          {message && (
            <div className={`p-4 rounded-xl border text-xs flex items-start gap-3 animate-in fade-in ${
              message.type === 'error' 
                ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            }`}>
              {message.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> : <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />}
              <span className="leading-relaxed">{message.text}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-400 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all duration-300"
                />
              </div>
            </div>

            {!isMagicLink && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between ml-1">
                  <label className="block text-xs font-bold text-slate-400">Password</label>
                  <a href="#" className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors">Forgot password?</a>
                </div>
                <div className="relative group">
                  <KeyRound className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all duration-300"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 bg-white hover:bg-slate-100 text-slate-950 disabled:opacity-50 font-extrabold rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-sm"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin text-slate-950" />
              ) : (
                <>
                  <span>{isMagicLink ? 'Send Access Link' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 pt-6">
            By continuing, you agree to the <a href="#" className="text-slate-400 hover:text-white underline decoration-slate-700 underline-offset-2">Terms of Service</a> and <a href="#" className="text-slate-400 hover:text-white underline decoration-slate-700 underline-offset-2">Privacy Policy</a>.
          </p>

        </div>
      </div>
    </div>
  );
}
