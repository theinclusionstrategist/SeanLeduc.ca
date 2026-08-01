'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import {
  Users,
  Briefcase,
  Mic,
  Heart,
  Search,
  Filter,
  Plus,
  LogOut,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Mail,
  Phone,
  MoreVertical,
  ShieldAlert,
  Loader2,
  RefreshCw
} from 'lucide-react';

interface Lead {
  id: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  email: string;
  phone?: string;
  entity_pillar: 'financial' | 'speaking' | 'charity';
  sub_track?: string;
  stage: string;
  assigned_agent_id?: string;
  created_at: string;
}

export default function PortalDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPillar, setSelectedPillar] = useState<string>('all');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [userRole, setUserRole] = useState<string>('Agent');
  const [userName, setUserName] = useState<string>('Team Member');

  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    fetchUserDataAndLeads();
  }, []);

  const fetchUserDataAndLeads = async () => {
    setLoading(true);
    
    // Get current session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
      return;
    }

    setUserName(session.user.email?.split('@')[0] || 'Agent');

    // Fetch leads (RLS automatically restricts based on logged-in user)
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setLeads(data);
    }

    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // Filtering Logic
  const filteredLeads = leads.filter((lead) => {
    const fullName = `${lead.first_name || ''} ${lead.last_name || ''} ${lead.name || ''}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPillar =
      selectedPillar === 'all' || lead.entity_pillar === selectedPillar;

    const matchesStage =
      selectedStage === 'all' || lead.stage?.toLowerCase() === selectedStage.toLowerCase();

    return matchesSearch && matchesPillar && matchesStage;
  });

  // KPI Calculations
  const totalLeads = leads.length;
  const financialCount = leads.filter(l => l.entity_pillar === 'financial').length;
  const speakingCount = leads.filter(l => l.entity_pillar === 'speaking').length;
  const charityCount = leads.filter(l => l.entity_pillar === 'charity').length;

  const getPillarBadge = (pillar: string) => {
    switch (pillar) {
      case 'financial':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><Briefcase className="w-3 h-3" /> Financial</span>;
      case 'speaking':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20"><Mic className="w-3 h-3" /> Speaking</span>;
      case 'charity':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20"><Heart className="w-3 h-3" /> Charity</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">General</span>;
    }
  };

  const getStageBadge = (stage: string) => {
    const s = stage?.toLowerCase() || 'new';
    if (s.includes('new') || s.includes('lead')) {
      return <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">New Contact</span>;
    } else if (s.includes('nurture') || s.includes('sequence')) {
      return <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">In Nurture</span>;
    } else if (s.includes('closed') || s.includes('won') || s.includes('client')) {
      return <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Converted</span>;
    }
    return <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">{stage || 'Active'}</span>;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500 selection:text-white">
      {/* TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo & Platform Name */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold tracking-tight text-white text-lg">TIS Portal</span>
                <span className="hidden sm:inline-block ml-2 text-xs font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">Enterprise CRM</span>
              </div>
            </div>

            {/* Right Controls / Profile */}
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Logged in as <strong className="text-white capitalize">{userName}</strong></span>
              </div>

              <button
                onClick={handleSignOut}
                className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 px-3 py-2 rounded-lg transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* MAIN DASHBOARD CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* PAGE HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Lead Overview</h1>
            <p className="text-sm text-slate-400 mt-1">Manage contacts, track stage movement, and monitor automated nurture sequences.</p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={fetchUserDataAndLeads}
              className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-xl transition"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* METRICS METRIC CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl relative overflow-hidden group hover:border-slate-700 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Leads</span>
              <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">{totalLeads}</span>
              <span className="text-xs text-slate-400">active records</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl relative overflow-hidden group hover:border-slate-700 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Financial (WFG)</span>
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                <Briefcase className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">{financialCount}</span>
              <span className="text-xs text-slate-400">pipeline leads</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl relative overflow-hidden group hover:border-slate-700 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Speaking</span>
              <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
                <Mic className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">{speakingCount}</span>
              <span className="text-xs text-slate-400">engagements</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl relative overflow-hidden group hover:border-slate-700 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Charity</span>
              <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                <Heart className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">{charityCount}</span>
              <span className="text-xs text-slate-400">donors / partners</span>
            </div>
          </div>

        </div>

        {/* TOOLBAR & FILTERS */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Search Field */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Stage Dropdown */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Stages</option>
                <option value="new">New Contacts</option>
                <option value="nurture">In Nurture</option>
                <option value="closed">Converted</option>
              </select>
            </div>

          </div>

          {/* Pillar Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 border-t border-slate-800/80 pt-3">
            {[
              { id: 'all', label: 'All Pillars' },
              { id: 'financial', label: 'Financial (WFG)' },
              { id: 'speaking', label: 'Speaking' },
              { id: 'charity', label: 'Charity' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedPillar(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition whitespace-nowrap ${
                  selectedPillar === tab.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

        </div>

        {/* DATA TABLE CONTAINER */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {loading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-sm text-slate-400">Loading protected contacts...</p>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-500 inline-flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <p className="text-slate-300 font-medium">No contacts match your query.</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">Try resetting your search filter or checking a different pillar tab.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/50 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    <th className="py-3.5 px-6">Contact Details</th>
                    <th className="py-3.5 px-6">Pillar</th>
                    <th className="py-3.5 px-6">Sub-Track</th>
                    <th className="py-3.5 px-6">Stage Status</th>
                    <th className="py-3.5 px-6">Added Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {filteredLeads.map((lead) => {
                    const displayName =
                      `${lead.first_name || ''} ${lead.last_name || ''}`.trim() ||
                      lead.name ||
                      'Unnamed Contact';

                    return (
                      <tr key={lead.id} className="hover:bg-slate-800/40 transition group">
                        
                        {/* Name & Email */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-xs uppercase shrink-0">
                              {displayName.charAt(0)}
                            </div>
                            <div>
                              <div className="font-semibold text-white group-hover:text-blue-400 transition">
                                {displayName}
                              </div>
                              <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                <Mail className="w-3 h-3 text-slate-500" />
                                <span>{lead.email}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Pillar Badge */}
                        <td className="py-4 px-6">
                          {getPillarBadge(lead.entity_pillar)}
                        </td>

                        {/* Sub Track */}
                        <td className="py-4 px-6 text-slate-300 text-xs">
                          {lead.sub_track ? (
                            <span className="capitalize bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-lg">
                              {lead.sub_track}
                            </span>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>

                        {/* Stage Badge */}
                        <td className="py-4 px-6">
                          {getStageBadge(lead.stage)}
                        </td>

                        {/* Date */}
                        <td className="py-4 px-6 text-xs text-slate-400">
                          {new Date(lead.created_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
