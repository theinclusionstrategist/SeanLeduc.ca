'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Kanban,
  Users,
  BarChart3,
  PhoneCall,
  Download,
  Edit3,
  Plus,
  Search,
  Sparkles,
  TrendingUp,
  X,
  Briefcase,
  Mic,
  Heart,
  LogOut,
  RefreshCw,
  CheckCircle2,
  Clock,
  Calendar,
  UserPlus,
  Phone,
  Mail,
  FileText,
  Loader2,
  ArrowUpRight,
  ShieldCheck
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
  notes?: string;
  assigned_agent_id?: string;
  created_at: string;
}

const STAGE_COLUMNS = [
  { id: 'new', label: 'New Opportunity', icon: UserPlus, border: 'border-blue-500/30', bg: 'bg-blue-500/5', badge: 'bg-blue-500/10 text-blue-400' },
  { id: 'nurture', label: 'Active Nurture', icon: Clock, border: 'border-indigo-500/30', bg: 'bg-indigo-500/5', badge: 'bg-indigo-500/10 text-indigo-400' },
  { id: 'meeting', label: 'Meeting Scheduled', icon: Calendar, border: 'border-purple-500/30', bg: 'bg-purple-500/5', badge: 'bg-purple-500/10 text-purple-400' },
  { id: 'converted', label: 'Converted / Client', icon: CheckCircle2, border: 'border-emerald-500/30', bg: 'bg-emerald-500/5', badge: 'bg-emerald-500/10 text-emerald-400' },
];

export default function PortalDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'analytics' | 'funnel' | 'directory'>('funnel');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPillar, setSelectedPillar] = useState<string>('all');
  const [userName, setUserName] = useState<string>('Agent');
  
  // Modal State
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
      return;
    }
    setUserName(session.user.email?.split('@')[0] || 'Agent');

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

  const handleStageChange = async (leadId: string, newStage: string) => {
    const { error } = await supabase
      .from('leads')
      .update({ stage: newStage })
      .eq('id', leadId);

    if (!error) {
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, stage: newStage } : l))
      );
    }
  };

  const handleSaveLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;
    setIsSaving(true);

    const { error } = await supabase
      .from('leads')
      .update({
        first_name: editingLead.first_name,
        last_name: editingLead.last_name,
        email: editingLead.email,
        phone: editingLead.phone,
        entity_pillar: editingLead.entity_pillar,
        sub_track: editingLead.sub_track,
        stage: editingLead.stage,
        notes: editingLead.notes,
      })
      .eq('id', editingLead.id);

    if (!error) {
      setLeads((prev) =>
        prev.map((l) => (l.id === editingLead.id ? editingLead : l))
      );
      setEditingLead(null);
    }
    setIsSaving(false);
  };

  // 📇 Mobile Contact Export (.vcf file generation)
  const downloadVCard = (lead: Lead) => {
    const fname = lead.first_name || lead.name || 'Lead';
    const lname = lead.last_name || '';
    const vcardData = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${fname} ${lname}`.trim(),
      `N:${lname};${fname};;;`,
      `EMAIL;TYPE=INTERNET:${lead.email}`,
      lead.phone ? `TEL;TYPE=CELL:${lead.phone}` : '',
      `NOTE:TIS Lead - Pillar: ${lead.entity_pillar.toUpperCase()} | Sub-track: ${lead.sub_track || 'N/A'}`,
      'END:VCARD'
    ].filter(Boolean).join('\n');

    const blob = new Blob([vcardData], { type: 'text/vcard;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${fname}_${lname}_TIS.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper Stage Normalizer
  const getNormalizedStage = (stageStr: string): string => {
    const s = (stageStr || '').toLowerCase();
    if (s.includes('converted') || s.includes('won') || s.includes('client')) return 'converted';
    if (s.includes('meeting') || s.includes('booked') || s.includes('call')) return 'meeting';
    if (s.includes('nurture') || s.includes('sequence')) return 'nurture';
    return 'new';
  };

  // Filtered Leads
  const filteredLeads = leads.filter((lead) => {
    const fullName = `${lead.first_name || ''} ${lead.last_name || ''} ${lead.name || ''}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || lead.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPillar = selectedPillar === 'all' || lead.entity_pillar === selectedPillar;
    return matchesSearch && matchesPillar;
  });

  // KPI Calculations
  const totalLeads = leads.length;
  const convertedCount = leads.filter(l => getNormalizedStage(l.stage) === 'converted').length;
  const conversionRate = totalLeads > 0 ? ((convertedCount / totalLeads) * 100).toFixed(1) : '0';
  const financialCount = leads.filter(l => l.entity_pillar === 'financial').length;
  const speakingCount = leads.filter(l => l.entity_pillar === 'speaking').length;
  const charityCount = leads.filter(l => l.entity_pillar === 'charity').length;

  const getPillarBadge = (pillar: string) => {
    switch (pillar) {
      case 'financial':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><Briefcase className="w-3 h-3" /> Financial</span>;
      case 'speaking':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20"><Mic className="w-3 h-3" /> Speaking</span>;
      case 'charity':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20"><Heart className="w-3 h-3" /> Charity</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20">General</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col antialiased selection:bg-blue-600 selection:text-white">
      
      {/* EXECUTIVE NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Brand Title */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20 border border-white/10">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold tracking-tight text-white text-lg">TIS Executive Command</span>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3 h-3" /> RLS Secured
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">The Inclusion Strategist • Multi-Vertical Platform</p>
              </div>
            </div>

            {/* Top Right User Bar */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-3 px-3.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-slate-300">Active Agent: <strong className="text-white capitalize">{userName}</strong></span>
              </div>

              <button
                onClick={handleSignOut}
                className="p-2 sm:px-3 sm:py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-semibold transition flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* DASHBOARD BODY */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
        
        {/* VIEW NAVIGATION & TOOLBAR */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          
          {/* Navigation Tabs */}
          <div className="flex items-center bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 self-start">
            <button
              onClick={() => setActiveTab('funnel')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'funnel' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Kanban className="w-4 h-4" />
              <span>Pipeline Funnel</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'analytics' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Analytics & KPIs</span>
            </button>

            <button
              onClick={() => setActiveTab('directory')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'directory' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Lead Directory</span>
            </button>
          </div>

          {/* Search & Pillar Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search name, email, or phone..."
                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Pillar Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
              {[
                { id: 'all', label: 'All Pillars' },
                { id: 'financial', label: 'Financial' },
                { id: 'speaking', label: 'Speaking' },
                { id: 'charity', label: 'Charity' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPillar(p.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    selectedPillar === p.id ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <button
              onClick={fetchLeads}
              className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl transition"
              title="Refresh Pipeline"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

        </div>

        {/* METRIC STRIP */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
              <span>Total Opportunities</span>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">{totalLeads}</span>
              <span className="text-xs text-slate-500">records</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
              <span>Conversion Rate</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">{conversionRate}%</span>
              <span className="text-xs text-emerald-400 font-medium">pipeline velocity</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
              <span>Financial (WFG)</span>
              <Briefcase className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">{financialCount}</span>
              <span className="text-xs text-slate-500">active leads</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
              <span>Speaking / Charity</span>
              <Mic className="w-4 h-4 text-purple-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">{speakingCount + charityCount}</span>
              <span className="text-xs text-slate-500">engagements</span>
            </div>
          </div>
        </div>

        {/* TAB 1: KANBAN FUNNEL BOARD */}
        {activeTab === 'funnel' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
            {STAGE_COLUMNS.map((col) => {
              const ColumnIcon = col.icon;
              const colLeads = filteredLeads.filter(l => getNormalizedStage(l.stage) === col.id);

              return (
                <div key={col.id} className={`rounded-2xl border ${col.border} ${col.bg} backdrop-blur-xl p-4 flex flex-col min-h-[600px]`}>
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <ColumnIcon className="w-4 h-4 text-slate-400" />
                      <h3 className="font-bold text-sm text-white">{col.label}</h3>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${col.badge}`}>
                      {colLeads.length}
                    </span>
                  </div>

                  {/* Cards Container */}
                  <div className="space-y-3 flex-1">
                    {loading ? (
                      <div className="py-12 text-center">
                        <Loader2 className="w-6 h-6 text-blue-500 animate-spin mx-auto" />
                      </div>
                    ) : colLeads.length === 0 ? (
                      <div className="py-16 text-center text-xs text-slate-500 border border-dashed border-slate-800/80 rounded-xl">
                        No opportunities in this stage
                      </div>
                    ) : (
                      colLeads.map((lead) => {
                        const displayName = `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || lead.name || 'Unnamed Contact';

                        return (
                          <div key={lead.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition shadow-xl space-y-3 group relative">
                            
                            {/* Card Top Row */}
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="font-bold text-sm text-white group-hover:text-blue-400 transition">
                                  {displayName}
                                </h4>
                                {lead.sub_track && (
                                  <span className="text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 mt-1 inline-block">
                                    {lead.sub_track}
                                  </span>
                                )}
                              </div>

                              <button
                                onClick={() => setEditingLead(lead)}
                                className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
                                title="Edit Lead Details"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Contact Details & Quick Dial */}
                            <div className="space-y-1.5 text-xs text-slate-400">
                              <div className="flex items-center gap-2">
                                <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                <span className="truncate">{lead.email}</span>
                              </div>
                              
                              {lead.phone && (
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 text-slate-300 font-mono">
                                    <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                    <span>{lead.phone}</span>
                                  </div>
                                  <a
                                    href={`tel:${lead.phone}`}
                                    className="p-1 text-emerald-400 hover:bg-emerald-500/10 rounded transition"
                                    title="Call Phone Number"
                                  >
                                    <PhoneCall className="w-3.5 h-3.5" />
                                  </a>
                                </div>
                              )}
                            </div>

                            {/* Card Footer: Pillar + Mobile vCard Export + Move Dropdown */}
                            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                              {getPillarBadge(lead.entity_pillar)}

                              <div className="flex items-center gap-1.5">
                                {/* Save to Phone Button */}
                                <button
                                  onClick={() => downloadVCard(lead)}
                                  className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition"
                                  title="Export vCard to Phone Contacts"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </button>

                                {/* Stage Selector */}
                                <select
                                  value={getNormalizedStage(lead.stage)}
                                  onChange={(e) => handleStageChange(lead.id, e.target.value)}
                                  className="bg-slate-950 border border-slate-800 text-[11px] text-slate-300 font-semibold rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer hover:bg-slate-800 transition"
                                >
                                  <option value="new">New</option>
                                  <option value="nurture">Nurture</option>
                                  <option value="meeting">Meeting</option>
                                  <option value="converted">Won</option>
                                </select>
                              </div>
                            </div>

                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: ANALYTICS & KPIS */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Pillar Breakdown Card */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                <span>Pillar Market Distribution</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-emerald-400">Financial (WFG)</span>
                    <span className="text-slate-400">{financialCount} leads ({totalLeads > 0 ? Math.round((financialCount / totalLeads) * 100) : 0}%)</span>
                  </div>
                  <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${totalLeads > 0 ? (financialCount / totalLeads) * 100 : 0}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-purple-400">Speaking & Keynotes</span>
                    <span className="text-slate-400">{speakingCount} leads ({totalLeads > 0 ? Math.round((speakingCount / totalLeads) * 100) : 0}%)</span>
                  </div>
                  <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                    <div className="bg-purple-500 h-full rounded-full" style={{ width: `${totalLeads > 0 ? (speakingCount / totalLeads) * 100 : 0}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-amber-400">Charity & Foundations</span>
                    <span className="text-slate-400">{charityCount} leads ({totalLeads > 0 ? Math.round((charityCount / totalLeads) * 100) : 0}%)</span>
                  </div>
                  <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: `${totalLeads > 0 ? (charityCount / totalLeads) * 100 : 0}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Funnel Conversion Analytics */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <span>Stage Conversion Funnel</span>
              </h3>

              <div className="space-y-4">
                {STAGE_COLUMNS.map((stage) => {
                  const count = leads.filter(l => getNormalizedStage(l.stage) === stage.id).length;
                  const pct = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;

                  return (
                    <div key={stage.id} className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <div className="flex items-center gap-3">
                        <stage.icon className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-semibold text-white">{stage.label}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-slate-400 font-mono">{count} leads</span>
                        <span className="text-xs font-bold text-blue-400 w-12 text-right">{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: MASTER DIRECTORY TABLE */}
        {activeTab === 'directory' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-4 px-6">Contact Info</th>
                    <th className="py-4 px-6">Phone (Quick Call)</th>
                    <th className="py-4 px-6">Pillar</th>
                    <th className="py-4 px-6">Sub-Track</th>
                    <th className="py-4 px-6">Funnel Stage</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {filteredLeads.map((lead) => {
                    const displayName = `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || lead.name || 'Unnamed';

                    return (
                      <tr key={lead.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-4 px-6">
                          <div className="font-bold text-white text-sm">{displayName}</div>
                          <div className="text-slate-400">{lead.email}</div>
                        </td>
                        <td className="py-4 px-6 font-mono text-slate-300">
                          {lead.phone ? (
                            <a href={`tel:${lead.phone}`} className="hover:text-emerald-400 inline-flex items-center gap-1.5">
                              <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                              <span>{lead.phone}</span>
                            </a>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>
                        <td className="py-4 px-6">{getPillarBadge(lead.entity_pillar)}</td>
                        <td className="py-4 px-6 text-slate-400">{lead.sub_track || '—'}</td>
                        <td className="py-4 px-6">
                          <select
                            value={getNormalizedStage(lead.stage)}
                            onChange={(e) => handleStageChange(lead.id, e.target.value)}
                            className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="new">New Opportunity</option>
                            <option value="nurture">In Nurture</option>
                            <option value="meeting">Meeting Scheduled</option>
                            <option value="converted">Converted / Client</option>
                          </select>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => downloadVCard(lead)}
                              className="p-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-lg"
                              title="Export vCard to Mobile Phone"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingLead(lead)}
                              className="p-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-lg"
                              title="Edit Lead"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* LEAD EDIT MODAL */}
      {editingLead && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-400" />
                <span>Edit Contact Record</span>
              </h3>
              <button onClick={() => setEditingLead(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLead} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 uppercase font-semibold mb-1">First Name</label>
                  <input
                    type="text"
                    value={editingLead.first_name || ''}
                    onChange={(e) => setEditingLead({ ...editingLead, first_name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 uppercase font-semibold mb-1">Last Name</label>
                  <input
                    type="text"
                    value={editingLead.last_name || ''}
                    onChange={(e) => setEditingLead({ ...editingLead, last_name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 uppercase font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={editingLead.email}
                  onChange={(e) => setEditingLead({ ...editingLead, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 uppercase font-semibold mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editingLead.phone || ''}
                  onChange={(e) => setEditingLead({ ...editingLead, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 uppercase font-semibold mb-1">Entity Pillar</label>
                  <select
                    value={editingLead.entity_pillar}
                    onChange={(e) => setEditingLead({ ...editingLead, entity_pillar: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="financial">Financial (WFG)</option>
                    <option value="speaking">Speaking</option>
                    <option value="charity">Charity</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 uppercase font-semibold mb-1">Sub-Track</label>
                  <input
                    type="text"
                    value={editingLead.sub_track || ''}
                    onChange={(e) => setEditingLead({ ...editingLead, sub_track: e.target.value })}
                    placeholder="e.g. recruiting / keynote"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 uppercase font-semibold mb-1">Agent Notes</label>
                <textarea
                  rows={3}
                  value={editingLead.notes || ''}
                  onChange={(e) => setEditingLead({ ...editingLead, notes: e.target.value })}
                  placeholder="Interaction history or follow-up reminders..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingLead(null)}
                  className="px-4 py-2 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/20"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
