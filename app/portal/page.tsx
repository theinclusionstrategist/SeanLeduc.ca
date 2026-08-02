'use client';

import { useState, useEffect, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import {
  Kanban,
  Users,
  BarChart3,
  PhoneCall,
  Download,
  Upload,
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
  Loader2,
  ShieldCheck,
  CheckSquare,
  Square,
  Trash2,
  DollarSign,
  ArrowUpDown,
  FileSpreadsheet,
  FileCheck,
  Send
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
  estimated_value?: number;
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
  const [activeTab, setActiveTab] = useState<'spreadsheet' | 'funnel' | 'analytics'>('spreadsheet');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPillar, setSelectedPillar] = useState<string>('all');
  const [userName, setUserName] = useState<string>('Agent');
  
  // Selection & Bulk Batch State
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);

  // Sorting State
  const [sortField, setSortField] = useState<'created_at' | 'first_name' | 'estimated_value'>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Modals State
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [docSignLead, setDocSignLead] = useState<Lead | null>(null);
  const [docTypeInput, setDocTypeInput] = useState('Executive Agreement');
  const [isSendingDoc, setIsSendingDoc] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // New Lead Form State
  const [newLead, setNewLead] = useState<Partial<Lead>>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    entity_pillar: 'financial',
    sub_track: 'recruiting',
    stage: 'new',
    estimated_value: 0,
    notes: ''
  });

  // CSV Import File Ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

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

  // --- STAGE & BATCH UPDATES ---
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

  const handleBatchStageChange = async (newStage: string) => {
    if (selectedLeadIds.length === 0) return;
    setIsSaving(true);

    const { error } = await supabase
      .from('leads')
      .update({ stage: newStage })
      .in('id', selectedLeadIds);

    if (!error) {
      setLeads((prev) =>
        prev.map((l) => (selectedLeadIds.includes(l.id) ? { ...l, stage: newStage } : l))
      );
      setSelectedLeadIds([]);
    }
    setIsSaving(false);
  };

  const handleBatchDelete = async () => {
    if (selectedLeadIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedLeadIds.length} lead(s)?`)) return;
    setIsSaving(true);

    const { error } = await supabase
      .from('leads')
      .delete()
      .in('id', selectedLeadIds);

    if (!error) {
      setLeads((prev) => prev.filter((l) => !selectedLeadIds.includes(l.id)));
      setSelectedLeadIds([]);
    }
    setIsSaving(false);
  };

  // --- SAVE & CREATE ---
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
        estimated_value: editingLead.estimated_value,
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

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const { data, error } = await supabase
      .from('leads')
      .insert([newLead])
      .select();

    if (!error && data) {
      setLeads((prev) => [data[0], ...prev]);
      setIsAddModalOpen(false);
      setNewLead({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        entity_pillar: 'financial',
        sub_track: 'recruiting',
        stage: 'new',
        estimated_value: 0,
        notes: ''
      });
    }
    setIsSaving(false);
  };

  // --- DOCUSIGN DISPATCH ENGINE ---
  const handleSendDocuSign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docSignLead) return;
    setIsSendingDoc(true);

    try {
      const recipientName = `${docSignLead.first_name || ''} ${docSignLead.last_name || ''}`.trim() || docSignLead.name || 'Client';

      const res = await fetch('/api/docusign/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: docSignLead.id,
          recipient_email: docSignLead.email,
          recipient_name: recipientName,
          document_type: docTypeInput,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(`DocuSign Envelope Sent Successfully!\nEnvelope ID: ${data.envelopeId}`);
        setDocSignLead(null);
        fetchLeads();
      } else {
        alert(`DocuSign Error: ${data.error || 'Failed to dispatch envelope'}`);
      }
    } catch (err: any) {
      alert(`Dispatch Error: ${err.message || 'Server error'}`);
    } finally {
      setIsSendingDoc(false);
    }
  };

  // --- CSV IMPORT / EXPORT ENGINE ---
  const exportToCSV = () => {
    const leadsToExport = selectedLeadIds.length > 0
      ? leads.filter(l => selectedLeadIds.includes(l.id))
      : filteredLeads;

    const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Pillar', 'Sub-Track', 'Stage', 'Estimated Value ($)', 'Created At'];
    const rows = leadsToExport.map(l => [
      `"${l.first_name || ''}"`,
      `"${l.last_name || ''}"`,
      `"${l.email}"`,
      `"${l.phone || ''}"`,
      `"${l.entity_pillar}"`,
      `"${l.sub_track || ''}"`,
      `"${l.stage}"`,
      l.estimated_value || 0,
      `"${new Date(l.created_at).toISOString()}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TIS_Leads_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportStatus('Parsing spreadsheet file...');
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split(/\r\n|\n/);
        if (lines.length < 2) {
          setImportStatus('Error: CSV file is empty or missing data rows.');
          return;
        }

        const parsedLeads: Partial<Lead>[] = [];
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          const cols = lines[i].split(',').map(c => c.replace(/^"|"$/g, '').trim());
          if (cols.length >= 3) {
            parsedLeads.push({
              first_name: cols[0] || 'Imported',
              last_name: cols[1] || 'Lead',
              email: cols[2],
              phone: cols[3] || '',
              entity_pillar: (cols[4]?.toLowerCase() as any) || 'financial',
              sub_track: cols[5] || 'import',
              stage: cols[6] || 'new',
              estimated_value: parseFloat(cols[7]) || 0,
            });
          }
        }

        setImportStatus(`Uploading ${parsedLeads.length} leads to database...`);
        const { data, error } = await supabase.from('leads').insert(parsedLeads).select();

        if (!error && data) {
          setLeads((prev) => [...data, ...prev]);
          setImportStatus(`Success! Added ${data.length} records.`);
          setTimeout(() => {
            setIsImportModalOpen(false);
            setImportStatus(null);
          }, 1500);
        } else {
          setImportStatus(`Import Error: ${error?.message || 'Check CSV formatting'}`);
        }
      } catch (err) {
        setImportStatus('Failed to process CSV file structure.');
      }
    };

    reader.readAsText(file);
  };

  // vCard Export
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

  const getNormalizedStage = (stageStr: string): string => {
    const s = (stageStr || '').toLowerCase();
    if (s.includes('converted') || s.includes('won') || s.includes('client')) return 'converted';
    if (s.includes('meeting') || s.includes('booked') || s.includes('call')) return 'meeting';
    if (s.includes('nurture') || s.includes('sequence')) return 'nurture';
    return 'new';
  };

  // Filter & Sort
  const filteredLeads = leads
    .filter((lead) => {
      const fullName = `${lead.first_name || ''} ${lead.last_name || ''} ${lead.name || ''}`.toLowerCase();
      const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || lead.email.toLowerCase().includes(searchTerm.toLowerCase()) || (lead.phone && lead.phone.includes(searchTerm));
      const matchesPillar = selectedPillar === 'all' || lead.entity_pillar === selectedPillar;
      return matchesSearch && matchesPillar;
    })
    .sort((a, b) => {
      let valA: any = a[sortField] || '';
      let valB: any = b[sortField] || '';
      if (sortField === 'estimated_value') {
        valA = a.estimated_value || 0;
        valB = b.estimated_value || 0;
      }
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  // KPI Calculations
  const totalLeads = leads.length;
  const totalPipelineValue = leads.reduce((sum, l) => sum + (l.estimated_value || 0), 0);
  const convertedCount = leads.filter(l => getNormalizedStage(l.stage) === 'converted').length;
  const conversionRate = totalLeads > 0 ? ((convertedCount / totalLeads) * 100).toFixed(1) : '0';

  const financialCount = leads.filter(l => l.entity_pillar === 'financial').length;
  const speakingCount = leads.filter(l => l.entity_pillar === 'speaking').length;
  const charityCount = leads.filter(l => l.entity_pillar === 'charity').length;

  const toggleSelectAll = () => {
    if (selectedLeadIds.length === filteredLeads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(filteredLeads.map((l) => l.id));
    }
  };

  const toggleSelectLead = (id: string) => {
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const getPillarBadge = (pillar: string) => {
    switch (pillar) {
      case 'financial':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><Briefcase className="w-3 h-3" /> Financial</span>;
      case 'speaking':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20"><Mic className="w-3 h-3" /> Speaking</span>;
      case 'charity':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20"><Heart className="w-3 h-3" /> Charity</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20">General</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col antialiased selection:bg-blue-600 selection:text-white">
      
      {/* NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20 border border-white/10">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold tracking-tight text-white text-lg">TIS Command Portal</span>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3 h-3" /> Enterprise RLS
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">The Inclusion Strategist • Multi-Vertical Center</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/20 flex items-center gap-2 transition"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Opportunity</span>
              </button>

              <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-slate-300">Agent: <strong className="text-white capitalize">{userName}</strong></span>
              </div>

              <button
                onClick={handleSignOut}
                className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-semibold transition"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* BODY CONTAINER */}
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
        
        {/* TOOLBAR & TABS */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          
          <div className="flex items-center bg-slate-900 p-1.5 rounded-2xl border border-slate-800 self-start">
            <button
              onClick={() => setActiveTab('spreadsheet')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'spreadsheet' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Spreadsheet Grid</span>
            </button>

            <button
              onClick={() => setActiveTab('funnel')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'funnel' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Kanban className="w-4 h-4" />
              <span>Kanban Funnel</span>
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
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search name, email, phone..."
                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
              {[
                { id: 'all', label: 'All' },
                { id: 'financial', label: 'Financial' },
                { id: 'speaking', label: 'Speaking' },
                { id: 'charity', label: 'Charity' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPillar(p.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    selectedPillar === p.id ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition flex items-center gap-2"
                title="Import CSV File"
              >
                <Upload className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">Import CSV</span>
              </button>

              <button
                onClick={exportToCSV}
                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition flex items-center gap-2"
                title="Export CSV File"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>

              <button
                onClick={fetchLeads}
                className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl transition"
                title="Refresh Database"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

        </div>

        {/* METRIC STRIP */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
              <span>Pipeline Value</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-white">${totalPipelineValue.toLocaleString()}</span>
              <span className="text-xs text-emerald-400 font-medium">gross volume</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
              <span>Total Opportunities</span>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-white">{totalLeads}</span>
              <span className="text-xs text-slate-500">records</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
              <span>Conversion Rate</span>
              <TrendingUp className="w-4 h-4 text-purple-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-white">{conversionRate}%</span>
              <span className="text-xs text-purple-400 font-medium">closed-won</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
              <span>Pillar Split</span>
              <Briefcase className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-2 text-xs text-slate-300 font-mono flex items-center justify-between pt-1">
              <span className="text-emerald-400">WFG: {financialCount}</span>
              <span className="text-purple-400">Speak: {speakingCount}</span>
              <span className="text-amber-400">Charity: {charityCount}</span>
            </div>
          </div>
        </div>

        {/* BATCH ACTION FLOATING BAR */}
        {selectedLeadIds.length > 0 && (
          <div className="p-3 bg-blue-600/10 border border-blue-500/30 rounded-2xl flex flex-wrap items-center justify-between gap-4 backdrop-blur-xl">
            <div className="flex items-center gap-3 text-xs text-blue-300 font-bold">
              <CheckSquare className="w-4 h-4 text-blue-400" />
              <span>{selectedLeadIds.length} lead(s) selected</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Batch Change Stage:</span>
              <select
                onChange={(e) => handleBatchStageChange(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-2.5 py-1 focus:outline-none"
              >
                <option value="">Select Stage...</option>
                <option value="new">New Opportunity</option>
                <option value="nurture">Active Nurture</option>
                <option value="meeting">Meeting Scheduled</option>
                <option value="converted">Converted / Won</option>
              </select>

              <button
                onClick={exportToCSV}
                className="px-3 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-white rounded-lg flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export Selected</span>
              </button>

              <button
                onClick={handleBatchDelete}
                className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-xs font-semibold text-red-400 rounded-lg flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Selected</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 1: SPREADSHEET GRID */}
        {activeTab === 'spreadsheet' && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    <th className="py-3.5 px-4 w-10 text-center">
                      <button onClick={toggleSelectAll} className="text-slate-400 hover:text-white">
                        {selectedLeadIds.length === filteredLeads.length && filteredLeads.length > 0 ? (
                          <CheckSquare className="w-4 h-4 text-blue-400" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </th>
                    <th className="py-3.5 px-4 cursor-pointer hover:text-white transition" onClick={() => { setSortField('first_name'); setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc'); }}>
                      <div className="flex items-center gap-1">
                        <span>Lead Name</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-500" />
                      </div>
                    </th>
                    <th className="py-3.5 px-4">Contact & Phone</th>
                    <th className="py-3.5 px-4">Pillar</th>
                    <th className="py-3.5 px-4">Sub-Track</th>
                    <th className="py-3.5 px-4">Funnel Stage</th>
                    <th className="py-3.5 px-4 cursor-pointer hover:text-white transition" onClick={() => { setSortField('estimated_value'); setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc'); }}>
                      <div className="flex items-center gap-1">
                        <span>Est. Value ($)</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-500" />
                      </div>
                    </th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="py-20 text-center text-slate-400">
                        <Loader2 className="w-6 h-6 text-blue-500 animate-spin mx-auto mb-2" />
                        <span>Syncing database records...</span>
                      </td>
                    </tr>
                  ) : filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-16 text-center text-slate-500 font-sans">
                        No rows found matching criteria. Click <strong>"Add Opportunity"</strong> above.
                      </td>
                    </tr>
                  ) : (
                    filteredLeads.map((lead) => {
                      const displayName = `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || lead.name || 'Unnamed';
                      const isSelected = selectedLeadIds.includes(lead.id);

                      return (
                        <tr key={lead.id} className={`hover:bg-slate-800/50 transition ${isSelected ? 'bg-blue-500/5' : ''}`}>
                          <td className="py-3 px-4 text-center">
                            <button onClick={() => toggleSelectLead(lead.id)} className="text-slate-400 hover:text-white">
                              {isSelected ? <CheckSquare className="w-4 h-4 text-blue-400" /> : <Square className="w-4 h-4" />}
                            </button>
                          </td>

                          <td className="py-3 px-4 font-sans">
                            <div className="font-bold text-white text-sm">{displayName}</div>
                            {lead.notes && <div className="text-[10px] text-slate-500 truncate max-w-[180px]">{lead.notes}</div>}
                          </td>

                          <td className="py-3 px-4 font-sans">
                            <div className="text-slate-300">{lead.email}</div>
                            {lead.phone ? (
                              <a href={`tel:${lead.phone}`} className="text-[11px] text-emerald-400 font-mono hover:underline inline-flex items-center gap-1 mt-0.5">
                                <PhoneCall className="w-3 h-3" />
                                <span>{lead.phone}</span>
                              </a>
                            ) : (
                              <span className="text-[11px] text-slate-600">—</span>
                            )}
                          </td>

                          <td className="py-3 px-4 font-sans">{getPillarBadge(lead.entity_pillar)}</td>

                          <td className="py-3 px-4 text-slate-400 font-sans">
                            {lead.sub_track ? (
                              <span className="bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-[11px]">
                                {lead.sub_track}
                              </span>
                            ) : (
                              '—'
                            )}
                          </td>

                          <td className="py-3 px-4 font-sans">
                            <select
                              value={getNormalizedStage(lead.stage)}
                              onChange={(e) => handleStageChange(lead.id, e.target.value)}
                              className="bg-slate-950 border border-slate-800 text-xs text-slate-300 font-semibold rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer hover:bg-slate-800 transition"
                            >
                              <option value="new">New Opportunity</option>
                              <option value="nurture">Active Nurture</option>
                              <option value="meeting">Meeting Scheduled</option>
                              <option value="converted">Converted / Won</option>
                            </select>
                          </td>

                          <td className="py-3 px-4 text-emerald-400 font-bold font-mono">
                            ${(lead.estimated_value || 0).toLocaleString()}
                          </td>

                          <td className="py-3 px-4 text-right font-sans">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* DocuSign Trigger */}
                              <button
                                onClick={() => setDocSignLead(lead)}
                                className="p-1.5 bg-slate-950 border border-slate-800 hover:border-blue-500/50 text-slate-400 hover:text-blue-400 rounded-lg transition"
                                title="Send DocuSign eSignature Contract"
                              >
                                <FileCheck className="w-3.5 h-3.5" />
                              </button>

                              {/* vCard Export */}
                              <button
                                onClick={() => downloadVCard(lead)}
                                className="p-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-blue-400 rounded-lg transition"
                                title="Export Contact to Mobile Phone (.vcf)"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>

                              {/* Edit Modal */}
                              <button
                                onClick={() => setEditingLead(lead)}
                                className="p-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-lg transition"
                                title="Edit Lead Record"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: KANBAN FUNNEL BOARD */}
        {activeTab === 'funnel' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
            {STAGE_COLUMNS.map((col) => {
              const ColumnIcon = col.icon;
              const colLeads = filteredLeads.filter(l => getNormalizedStage(l.stage) === col.id);

              return (
                <div key={col.id} className={`rounded-2xl border ${col.border} ${col.bg} backdrop-blur-xl p-4 flex flex-col min-h-[600px]`}>
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <ColumnIcon className="w-4 h-4 text-slate-400" />
                      <h3 className="font-bold text-sm text-white">{col.label}</h3>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${col.badge}`}>
                      {colLeads.length}
                    </span>
                  </div>

                  <div className="space-y-3 flex-1">
                    {colLeads.map((lead) => (
                      <div key={lead.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition shadow-xl space-y-3 group relative">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-bold text-sm text-white group-hover:text-blue-400 transition">
                              {lead.first_name || lead.name || 'Unnamed'} {lead.last_name || ''}
                            </h4>
                            <span className="text-xs text-emerald-400 font-mono font-bold block mt-0.5">
                              ${(lead.estimated_value || 0).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button onClick={() => setDocSignLead(lead)} className="p-1.5 text-slate-400 hover:text-blue-400 bg-slate-800 rounded-lg" title="Send DocuSign">
                              <FileCheck className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setEditingLead(lead)} className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg">
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1 text-xs text-slate-400">
                          <div className="flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span className="truncate">{lead.email}</span>
                          </div>
                          {lead.phone && (
                            <a href={`tel:${lead.phone}`} className="flex items-center gap-2 text-emerald-400 font-mono hover:underline">
                              <PhoneCall className="w-3.5 h-3.5" />
                              <span>{lead.phone}</span>
                            </a>
                          )}
                        </div>

                        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                          {getPillarBadge(lead.entity_pillar)}
                          <select
                            value={getNormalizedStage(lead.stage)}
                            onChange={(e) => handleStageChange(lead.id, e.target.value)}
                            className="bg-slate-950 border border-slate-800 text-[11px] text-slate-300 font-semibold rounded-lg px-2 py-1 focus:outline-none"
                          >
                            <option value="new">New</option>
                            <option value="nurture">Nurture</option>
                            <option value="meeting">Meeting</option>
                            <option value="converted">Won</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 3: ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                <span>Pillar Market Distribution</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-emerald-400">Financial (WFG)</span>
                    <span className="text-slate-400">{financialCount} leads</span>
                  </div>
                  <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${totalLeads > 0 ? (financialCount / totalLeads) * 100 : 0}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-purple-400">Speaking & Keynotes</span>
                    <span className="text-slate-400">{speakingCount} leads</span>
                  </div>
                  <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                    <div className="bg-purple-500 h-full rounded-full" style={{ width: `${totalLeads > 0 ? (speakingCount / totalLeads) * 100 : 0}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-amber-400">Charity & Foundations</span>
                    <span className="text-slate-400">{charityCount} leads</span>
                  </div>
                  <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: `${totalLeads > 0 ? (charityCount / totalLeads) * 100 : 0}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <span>Stage Velocity & Breakdown</span>
              </h3>

              <div className="space-y-4">
                {STAGE_COLUMNS.map((stage) => {
                  const count = leads.filter(l => getNormalizedStage(l.stage) === stage.id).length;
                  const pct = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;

                  return (
                    <div key={stage.id} className="flex items-center justify-between p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                      <div className="flex items-center gap-3">
                        <stage.icon className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-semibold text-white">{stage.label}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-slate-400 font-mono">{count} records</span>
                        <span className="text-xs font-bold text-blue-400 w-12 text-right">{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* DOCUSIGN DISPATCH MODAL */}
      {docSignLead && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-blue-400" />
                <span>Dispatch DocuSign Envelope</span>
              </h3>
              <button onClick={() => setDocSignLead(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendDocuSign} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 uppercase font-semibold mb-1">Recipient Name</label>
                <input
                  type="text"
                  disabled
                  value={`${docSignLead.first_name || ''} ${docSignLead.last_name || ''}`.trim() || docSignLead.name || 'Client'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white opacity-70 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-slate-400 uppercase font-semibold mb-1">Recipient Email</label>
                <input
                  type="email"
                  disabled
                  value={docSignLead.email}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white opacity-70 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-slate-400 uppercase font-semibold mb-1">Document Agreement Title</label>
                <input
                  type="text"
                  required
                  value={docTypeInput}
                  onChange={(e) => setDocTypeInput(e.target.value)}
                  placeholder="e.g. Financial Disclosure, Speaking Rider"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setDocSignLead(null)} className="px-4 py-2 bg-slate-950 border border-slate-800 text-slate-300 rounded-xl font-semibold">
                  Cancel
                </button>
                <button type="submit" disabled={isSendingDoc} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/20">
                  {isSendingDoc ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>Dispatch via DocuSign</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE NEW LEAD MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-400" />
                <span>Add Opportunity to Pipeline</span>
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 uppercase font-semibold mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={newLead.first_name}
                    onChange={(e) => setNewLead({ ...newLead, first_name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 uppercase font-semibold mb-1">Last Name</label>
                  <input
                    type="text"
                    value={newLead.last_name}
                    onChange={(e) => setNewLead({ ...newLead, last_name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 uppercase font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newLead.email}
                  onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 uppercase font-semibold mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={newLead.phone}
                    onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 uppercase font-semibold mb-1">Est. Value ($)</label>
                  <input
                    type="number"
                    value={newLead.estimated_value}
                    onChange={(e) => setNewLead({ ...newLead, estimated_value: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 uppercase font-semibold mb-1">Entity Pillar</label>
                  <select
                    value={newLead.entity_pillar}
                    onChange={(e) => setNewLead({ ...newLead, entity_pillar: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:ring-2 focus:ring-blue-500"
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
                    value={newLead.sub_track}
                    onChange={(e) => setNewLead({ ...newLead, sub_track: e.target.value })}
                    placeholder="e.g. recruiting"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 bg-slate-950 border border-slate-800 text-slate-300 rounded-xl font-semibold">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl flex items-center gap-2">
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Create Lead</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV IMPORT MODAL */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-400" />
                <span>Import CSV Spreadsheet</span>
              </h3>
              <button onClick={() => setIsImportModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Upload a `.csv` file containing lead records. Columns mapped in order: <br />
              <code className="text-blue-400 bg-slate-950 px-1 py-0.5 rounded mt-1 inline-block">
                First Name, Last Name, Email, Phone, Pillar, Sub-track, Stage, Value
              </code>
            </p>

            <div className="p-6 border-2 border-dashed border-slate-800 hover:border-blue-500/50 rounded-xl text-center cursor-pointer transition" onClick={() => fileInputRef.current?.click()}>
              <FileSpreadsheet className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <span className="text-xs font-semibold text-slate-300 block">Click to select CSV file</span>
              <span className="text-[10px] text-slate-500">Supports standard CSV exports from Excel or Sheets</span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>

            {importStatus && (
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-blue-400 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                <span>{importStatus}</span>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button onClick={() => setIsImportModalOpen(false)} className="px-4 py-2 bg-slate-950 border border-slate-800 text-slate-300 rounded-xl text-xs font-semibold">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT LEAD MODAL */}
      {editingLead && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-400" />
                <span>Edit Lead Record</span>
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
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 uppercase font-semibold mb-1">Last Name</label>
                  <input
                    type="text"
                    value={editingLead.last_name || ''}
                    onChange={(e) => setEditingLead({ ...editingLead, last_name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 uppercase font-semibold mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editingLead.phone || ''}
                    onChange={(e) => setEditingLead({ ...editingLead, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 uppercase font-semibold mb-1">Est. Value ($)</label>
                  <input
                    type="number"
                    value={editingLead.estimated_value || 0}
                    onChange={(e) => setEditingLead({ ...editingLead, estimated_value: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 uppercase font-semibold mb-1">Entity Pillar</label>
                  <select
                    value={editingLead.entity_pillar}
                    onChange={(e) => setEditingLead({ ...editingLead, entity_pillar: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
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
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 uppercase font-semibold mb-1">Agent Notes</label>
                <textarea
                  rows={3}
                  value={editingLead.notes || ''}
                  onChange={(e) => setEditingLead({ ...editingLead, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setEditingLead(null)} className="px-4 py-2 bg-slate-950 border border-slate-800 text-slate-300 rounded-xl font-semibold">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl flex items-center gap-2">
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
