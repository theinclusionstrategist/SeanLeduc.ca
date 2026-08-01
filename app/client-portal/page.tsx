'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Clock,
  CheckCircle2,
  FileText,
  MessageSquare,
  Sparkles,
  LogOut,
  ShieldCheck,
  Download,
  PhoneCall,
  Mail,
  ChevronRight,
  User,
  ArrowRight,
  Briefcase,
  Mic,
  Heart,
  Loader2,
  CalendarDays,
  Video
} from 'lucide-react';

interface ClientProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  email: string;
  phone?: string;
  entity_pillar: 'financial' | 'speaking' | 'charity';
  stage: string;
  assigned_agent_id?: string;
}

export default function ClientPortal() {
  const [client, setClient] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'booking' | 'vault'>('overview');
  
  // Booking State
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    fetchClientData();
  }, []);

  const fetchClientData = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      router.push('/login');
      return;
    }

    // Fetch the specific lead record that matches the logged-in user's email
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('email', session.user.email)
      .single();

    if (!error && data) {
      setClient(data);
    } else {
      // Fallback if they are a user but not explicitly in the CRM yet
      setClient({
        id: session.user.id,
        email: session.user.email || '',
        first_name: session.user.user_metadata?.first_name || 'Valued',
        last_name: session.user.user_metadata?.last_name || 'Client',
        entity_pillar: 'financial', // default fallback
        stage: 'new'
      });
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleBookMeeting = async () => {
    if (!selectedDate || !selectedTime) return;
    setIsBooking(true);
    
    // Simulate booking delay/API call to calendar system
    setTimeout(() => {
      setIsBooking(false);
      setBookingSuccess(true);
      
      // Auto reset after 3 seconds
      setTimeout(() => {
        setBookingSuccess(false);
        setSelectedDate(null);
        setSelectedTime(null);
        setActiveTab('overview');
      }, 3000);
    }, 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!client) return null;

  // --- CLIENT FACING MAPPINGS ---
  const getClientStageDisplay = (stage: string) => {
    const s = stage.toLowerCase();
    if (s.includes('new')) return { title: 'Welcome & Onboarding', step: 1, desc: 'Setting up your profile and preparing initial strategy.' };
    if (s.includes('nurture')) return { title: 'Strategy & Review', step: 2, desc: 'We are currently reviewing your file and preparing recommendations.' };
    if (s.includes('meeting')) return { title: 'Consultation Scheduled', step: 3, desc: 'Your upcoming meeting is locked in. See details below.' };
    if (s.includes('converted')) return { title: 'Active Partnership', step: 4, desc: 'You are an active partner. Access your ongoing resources below.' };
    return { title: 'Account Active', step: 1, desc: 'Your account is active and being monitored.' };
  };

  const currentStage = getClientStageDisplay(client.stage);
  const clientName = client.first_name || 'Valued Client';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col antialiased selection:bg-blue-600 selection:text-white relative overflow-hidden">
      
      {/* Background Glow Accents */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* EXECUTIVE NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Brand Header */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 border border-white/10">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-extrabold tracking-tight text-white text-xl">The Inclusion Strategist</h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-slate-400 font-medium tracking-wide uppercase">Executive Client Portal</span>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[9px] font-bold tracking-wider uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3 h-3" /> Secure Session
                  </span>
                </div>
              </div>
            </div>

            {/* User Profile Quick Actions */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-3 text-right">
                <div>
                  <p className="text-sm font-bold text-white capitalize">{clientName} {client.last_name}</p>
                  <p className="text-xs text-slate-400">{client.email}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold uppercase">
                  {clientName.charAt(0)}
                </div>
              </div>

              <button
                onClick={handleSignOut}
                className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-semibold transition shadow-sm"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* PORTAL BODY */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8 z-10 relative">
        
        {/* WELCOME BANNER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-slate-900 to-slate-900/50 p-8 rounded-3xl border border-slate-800 shadow-2xl">
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {clientName}.
            </h2>
            <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
              Your executive dashboard is up to date. Access your strategy resources, track your current timeline, or schedule a priority consultation with Sean below.
            </p>
          </div>
          <div className="shrink-0">
            <button
              onClick={() => setActiveTab('booking')}
              className="px-6 py-3.5 bg-white hover:bg-slate-100 text-slate-950 font-bold rounded-xl shadow-lg shadow-white/10 flex items-center gap-2 transition transform hover:-translate-y-0.5"
            >
              <CalendarDays className="w-5 h-5" />
              <span>Book Strategy Call</span>
            </button>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex items-center gap-2 border-b border-slate-800/80 pb-px">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'overview' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            Dashboard Overview
          </button>
          <button
            onClick={() => setActiveTab('booking')}
            className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'booking' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            Concierge Booking
          </button>
          <button
            onClick={() => setActiveTab('vault')}
            className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'vault' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            Resource Vault
          </button>
        </div>

        {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Left Column: Progress & Status (Takes up 2/3) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Visual Pipeline Tracker */}
              <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-400" />
                  Current Milestone Tracker
                </h3>
                
                <div className="relative">
                  {/* Progress Line */}
                  <div className="absolute top-5 left-6 right-6 h-1 bg-slate-800 rounded-full">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${(currentStage.step / 4) * 100}%` }}
                    />
                  </div>

                  {/* Steps */}
                  <div className="relative flex justify-between">
                    {[
                      { num: 1, label: 'Onboarding' },
                      { num: 2, label: 'Strategy' },
                      { num: 3, label: 'Consultation' },
                      { num: 4, label: 'Partnership' }
                    ].map((step) => (
                      <div key={step.num} className="flex flex-col items-center gap-3">
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors duration-500 ${
                          currentStage.step >= step.num 
                            ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/30' 
                            : 'bg-slate-900 border-slate-700 text-slate-500'
                        }`}>
                          {currentStage.step > step.num ? <CheckCircle2 className="w-6 h-6" /> : step.num}
                        </div>
                        <span className={`text-xs font-semibold ${currentStage.step >= step.num ? 'text-blue-100' : 'text-slate-500'}`}>
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-10 p-5 bg-blue-500/5 border border-blue-500/20 rounded-2xl flex items-start gap-4">
                  <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400 shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold">{currentStage.title}</h4>
                    <p className="text-sm text-slate-400 mt-1">{currentStage.desc}</p>
                  </div>
                </div>
              </div>

              {/* Recent Activity / Next Steps */}
              <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-6">Recommended Next Steps</h3>
                <div className="space-y-4">
                  <button onClick={() => setActiveTab('booking')} className="w-full flex items-center justify-between p-4 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl transition group">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-slate-900 rounded-xl text-emerald-400"><Calendar className="w-5 h-5" /></div>
                      <div className="text-left">
                        <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition">Schedule a Review Call</h4>
                        <p className="text-xs text-slate-400">Lock in a time for your next strategy session.</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition" />
                  </button>

                  <button onClick={() => setActiveTab('vault')} className="w-full flex items-center justify-between p-4 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl transition group">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-slate-900 rounded-xl text-purple-400"><FileText className="w-5 h-5" /></div>
                      <div className="text-left">
                        <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition">Review Resource Vault</h4>
                        <p className="text-xs text-slate-400">Access your secure downloads and guides.</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition" />
                  </button>
                </div>
              </div>

            </div>

            {/* Right Column: Support & Contact */}
            <div className="space-y-6">
              
              {/* Dedicated Concierge Card */}
              <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all" />
                
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Dedicated Strategist</h3>
                
                <div className="flex items-center gap-4 mb-6">
                  <img 
                    src="https://ui-avatars.com/api/?name=Sean+Leduc&background=0D8ABC&color=fff&size=128" 
                    alt="Sean Leduc" 
                    className="w-16 h-16 rounded-2xl border-2 border-slate-700"
                  />
                  <div>
                    <h4 className="text-lg font-bold text-white">Sean Leduc</h4>
                    <p className="text-sm text-blue-400">Executive Director</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <a href="mailto:sean@seanleduc.ca" className="flex items-center justify-center gap-2 w-full py-3 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl text-sm font-semibold text-white transition">
                    <MessageSquare className="w-4 h-4 text-slate-400" />
                    <span>Send Message</span>
                  </a>
                  <a href="tel:+15550000000" className="flex items-center justify-center gap-2 w-full py-3 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl text-sm font-semibold text-white transition">
                    <PhoneCall className="w-4 h-4 text-slate-400" />
                    <span>Request Callback</span>
                  </a>
                </div>
              </div>

              {/* Profile Overview */}
              <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-xl">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Account Details</h3>
                <div className="space-y-4">
                  <div>
                    <span className="block text-xs text-slate-500 mb-1">Registered Email</span>
                    <span className="text-sm text-white font-medium">{client.email}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500 mb-1">Primary Pillar Focus</span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-slate-950 border border-slate-800 capitalize text-slate-300">
                      {client.entity_pillar === 'financial' && <Briefcase className="w-3.5 h-3.5 text-emerald-400" />}
                      {client.entity_pillar === 'speaking' && <Mic className="w-3.5 h-3.5 text-purple-400" />}
                      {client.entity_pillar === 'charity' && <Heart className="w-3.5 h-3.5 text-amber-400" />}
                      {client.entity_pillar} Services
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: CONCIERGE CALENDAR BOOKING */}
        {activeTab === 'booking' && (
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-xl max-w-4xl mx-auto animate-in zoom-in-95 duration-500">
            
            {bookingSuccess ? (
              <div className="py-20 text-center space-y-4 animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-extrabold text-white">Consultation Confirmed</h2>
                <p className="text-slate-400 max-w-md mx-auto">
                  Your strategy session has been locked in. A calendar invitation containing the secure Zoom link has been sent to <span className="text-white font-semibold">{client.email}</span>.
                </p>
              </div>
            ) : (
              <>
                <div className="text-center mb-10">
                  <h2 className="text-2xl font-extrabold text-white">Priority Scheduling</h2>
                  <p className="text-sm text-slate-400 mt-2">Select a date and time for your one-on-one strategy call.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Fake Date Picker UI */}
                  <div>
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-blue-400" /> Select Date
                    </h3>
                    <div className="grid grid-cols-4 gap-2">
                      {['15', '16', '17', '18', '21', '22', '23', '24'].map((day) => (
                        <button
                          key={day}
                          onClick={() => setSelectedDate(`Aug ${day}`)}
                          className={`aspect-square rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                            selectedDate === `Aug ${day}`
                              ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/30 scale-105'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-white'
                          }`}
                        >
                          <span className="text-xs font-semibold uppercase">{Number(day) > 20 ? 'Mon' : 'Thu'}</span>
                          <span className="text-lg font-bold">{day}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Fake Time Picker UI */}
                  <div className={`transition-opacity duration-300 ${!selectedDate ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-400" /> Select Time (EST)
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {['09:00 AM', '10:30 AM', '01:00 PM', '03:15 PM'].map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`py-3 rounded-xl border text-sm font-bold transition-all ${
                            selectedTime === time
                              ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/30'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-white'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>

                    <div className="mt-8">
                      <button
                        disabled={!selectedDate || !selectedTime || isBooking}
                        onClick={handleBookMeeting}
                        className="w-full py-4 bg-white hover:bg-slate-200 disabled:opacity-50 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 transition"
                      >
                        {isBooking ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Confirming...</span>
                          </>
                        ) : (
                          <>
                            <Video className="w-5 h-5" />
                            <span>Confirm Strategy Call</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 3: RESOURCE VAULT */}
        {activeTab === 'vault' && (
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-xl animate-in fade-in duration-500">
            <h2 className="text-2xl font-extrabold text-white mb-2">Secure Resource Vault</h2>
            <p className="text-sm text-slate-400 mb-8">Exclusive documents and guides unlocked for your current stage.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* Dynamic Resource 1 */}
              <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col justify-between group hover:border-slate-700 transition">
                <div className="mb-6">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">
                    {client.entity_pillar === 'financial' ? 'WFG Financial Blueprint' : client.entity_pillar === 'speaking' ? 'Keynote Rider & Req' : 'Charity Prospectus'}
                  </h4>
                  <p className="text-xs text-slate-400">PDF Document • 2.4 MB</p>
                </div>
                <button className="w-full py-2 bg-slate-900 group-hover:bg-blue-600 border border-slate-800 group-hover:border-blue-500 text-slate-300 group-hover:text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" /> Download
                </button>
              </div>

              {/* Universal Resource 2 */}
              <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col justify-between group hover:border-slate-700 transition">
                <div className="mb-6">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">Onboarding Checklist</h4>
                  <p className="text-xs text-slate-400">PDF Document • 1.1 MB</p>
                </div>
                <button className="w-full py-2 bg-slate-900 group-hover:bg-blue-600 border border-slate-800 group-hover:border-blue-500 text-slate-300 group-hover:text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" /> Download
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
