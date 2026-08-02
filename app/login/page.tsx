'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Loader2,
  KeyRound,
  CheckCircle2,
  AlertCircle
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
        // Passwordless Magic Link Login
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
        // Standard Email + Password Auth
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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col justify-between antialiased selection:bg-blue-600 selection:text-white relative overflow-hidden">
      
      {/* Background Lighting Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-blue-600/15 via-indigo-600/10 to-purple-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* HEADER */}
      <header className="p-6 border-b border-slate-900/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20 border border-white/10">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold tracking-tight text-white text-base">Sean Leduc</span>
              <p className="text-[11px] text-slate-400">The Inclusion Strategist Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Encrypted Gateway</span>
          </div>
        </div>
      </header>

      {/* LOGIN CARD */}
      <main className="flex-1 flex items-center justify-center p-4 z-10">
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl space-y-8">
          
          {/* Card Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto text-blue-400 shadow-inner">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Portal Access Gateway</h1>
            <p className="text-xs text-slate-400">Enter your credentials to access your executive workspace.</p>
          </div>

          {/* Mode Switcher (Password vs Magic Link) */}
          <div className="grid grid-cols-2 p-1 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setIsMagicLink(false)}
              className={`py-2 rounded-lg transition ${!isMagicLink ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              Password Login
            </button>
            <button
              type="button"
              onClick={() => setIsMagicLink(true)}
              className={`py-2 rounded-lg transition ${isMagicLink ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              Magic Link
            </button>
          </div>

          {/* Alert Message */}
          {message && (
            <div className={`p-4 rounded-2xl border text-xs flex items-center gap-3 ${
              message.type === 'error' 
                ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            }`}>
              {message.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
              <span>{message.text}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block uppercase font-extrabold tracking-wider text-slate-400 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {!isMagicLink && (
              <div>
                <label className="block uppercase font-extrabold tracking-wider text-slate-400 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-extrabold rounded-2xl shadow-xl shadow-blue-600/25 flex items-center justify-center gap-2 transition transform hover:-translate-y-0.5 text-sm mt-6"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>{isMagicLink ? 'Send Magic Access Link' : 'Authenticate & Enter'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="py-6 border-t border-slate-900 text-center text-xs text-slate-600">
        <p>© {new Date().getFullYear()} Sean Leduc. Multi-vertical command system.</p>
      </footer>
    </div>
  );
}
