'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Lead, LeadStatus } from '@/types/database.types';

export default function AdminLeadsPage() {
  const [passcode, setPasscode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');

  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState('');

  // Handle Passcode Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsLoading(true);

    try {
      const res = await fetch(`/api/admin/leads?passcode=${encodeURIComponent(passcode)}`, {
        headers: { 'x-admin-passcode': passcode },
      });

      if (!res.ok) {
        throw new Error('Invalid Admin Passcode');
      }

      const data = await res.json();
      setLeads(data.leads || []);
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_passcode', passcode);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Authentication failed';
      setAuthError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Restore session from sessionStorage if available
  useEffect(() => {
    const savedCode = sessionStorage.getItem('admin_passcode');
    if (savedCode) {
      setPasscode(savedCode);
      fetch(`/api/admin/leads?passcode=${encodeURIComponent(savedCode)}`, {
        headers: { 'x-admin-passcode': savedCode },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.leads) {
            setLeads(data.leads);
            setIsAuthenticated(true);
          }
        })
        .catch(() => sessionStorage.removeItem('admin_passcode'));
    }
  }, []);

  // Update Lead Status Live
  const handleStatusChange = async (id: string, newStatus: LeadStatus) => {
    const savedCode = sessionStorage.getItem('admin_passcode') || passcode;
    try {
      const res = await fetch('/api/admin/leads', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-passcode': savedCode,
        },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update status');

      const data = await res.json();
      setLeads((prev) => prev.map((l) => (l.id === id ? data.lead : l)));
    } catch {
      alert('Error updating status');
    }
  };

  // Save Lead Notes
  const handleSaveNotes = async (id: string) => {
    const savedCode = sessionStorage.getItem('admin_passcode') || passcode;
    try {
      const res = await fetch('/api/admin/leads', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-passcode': savedCode,
        },
        body: JSON.stringify({ id, notes: tempNotes }),
      });

      if (!res.ok) throw new Error('Failed to save notes');

      const data = await res.json();
      setLeads((prev) => prev.map((l) => (l.id === id ? data.lead : l)));
      setEditingNotesId(null);
    } catch {
      alert('Error saving notes');
    }
  };

  // Export Leads to CSV (iPad / Safari Friendly)
  const exportToCSV = () => {
    if (!leads.length) return;

    const headers = [
      'ID',
      'Session ID',
      'Name',
      'Email',
      'Phone',
      'Company',
      'Status',
      'Intent Tags',
      'Notes',
      'Last Active',
      'Created At',
    ];
    const rows = filteredLeads.map((l) => [
      l.id,
      l.session_id || '',
      l.name || '',
      l.email || '',
      l.phone || '',
      l.company || '',
      l.status,
      `"${(l.intent_tags || []).join(', ')}"`,
      `"${(l.notes || '').replace(/"/g, '""')}"`,
      l.last_active || '',
      l.created_at || '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `sean_leduc_leads_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Leads Calculation
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        (lead.name?.toLowerCase() || '').includes(query) ||
        (lead.email?.toLowerCase() || '').includes(query) ||
        (lead.session_id?.toLowerCase() || '').includes(query) ||
        (lead.intent_tags || []).some((tag) => tag.toLowerCase().includes(query));

      return matchesStatus && matchesSearch;
    });
  }, [leads, statusFilter, searchQuery]);

  // Metrics
  const stats = useMemo(() => {
    return {
      total: leads.length,
      new: leads.filter((l) => l.status === 'new').length,
      qualified: leads.filter((l) => l.status === 'qualified').length,
      converted: leads.filter((l) => l.status === 'converted').length,
    };
  }, [leads]);

  // --------------------------------------------------------------------------
  // LOGIN SCREEN (PASSCODE GATE)
  // --------------------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-extrabold text-xl text-white mx-auto mb-4 shadow-lg shadow-blue-500/20">
              SL
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Admin Intelligence Portal
            </h1>
            <p className="text-xs text-blue-400 font-medium mt-1 uppercase tracking-wider">
              The Inclusion Strategist
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
                Enter Passcode
              </label>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors text-center text-lg tracking-widest"
                required
              />
            </div>

            {authError && (
              <p className="text-xs text-rose-400 bg-rose-950/40 border border-rose-800/50 p-3 rounded-xl text-center">
                {authError}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50"
            >
              {isLoading ? 'Verifying Key...' : 'Unlock Admin Portal'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // MAIN DASHBOARD UI
  // --------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚡</span>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                Inclusy Lead Engine
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Live interaction & lead acquisition metrics for Sean Leduc
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={exportToCSV}
              className="bg-slate-900 hover:bg-slate-800 text-blue-400 border border-slate-800 font-semibold text-xs py-2.5 px-4 rounded-xl transition-all flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Export CSV
            </button>

            <button
              onClick={() => {
                sessionStorage.removeItem('admin_passcode');
                setIsAuthenticated(false);
              }}
              className="bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 text-xs py-2.5 px-4 rounded-xl transition-all"
            >
              Lock Dashboard
            </button>
          </div>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Total Interactions
            </span>
            <span className="text-3xl font-extrabold text-white">{stats.total}</span>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider block mb-1">
              New Inquiries
            </span>
            <span className="text-3xl font-extrabold text-amber-300">{stats.new}</span>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider block mb-1">
              Qualified Leads
            </span>
            <span className="text-3xl font-extrabold text-blue-300">
              {stats.qualified}
            </span>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block mb-1">
              Converted Clients
            </span>
            <span className="text-3xl font-extrabold text-emerald-300">
              {stats.converted}
            </span>
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
          <div className="w-full sm:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, intent tag..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
            {['all', 'new', 'contacted', 'qualified', 'converted', 'archived'].map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all whitespace-nowrap ${
                    statusFilter === status
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {status}
                </button>
              )
            )}
          </div>
        </div>

        {/* Leads Table / iPad Cards */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-6">Contact Info</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">AI Intent Tags</th>
                  <th className="py-4 px-6">Notes</th>
                  <th className="py-4 px-6">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">
                      No matching lead records found.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => (
                    <tr
                      key={lead.id}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Contact Info */}
                      <td className="py-4 px-6">
                        <div className="font-semibold text-white">
                          {lead.name || 'Anonymous User'}
                        </div>
                        {lead.email && (
                          <div className="text-xs text-blue-400">{lead.email}</div>
                        )}
                        {lead.phone && (
                          <div className="text-xs text-slate-400">{lead.phone}</div>
                        )}
                        <div className="text-[10px] text-slate-600 font-mono mt-1">
                          ID: {lead.session_id || lead.id}
                        </div>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-4 px-6">
                        <select
                          value={lead.status}
                          onChange={(e) =>
                            handleStatusChange(
                              lead.id,
                              e.target.value as LeadStatus
                            )
                          }
                          className="bg-slate-950 border border-slate-700 text-xs font-semibold rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-blue-500"
                        >
                          <option value="new">🆕 New</option>
                          <option value="contacted">📞 Contacted</option>
                          <option value="qualified">⭐ Qualified</option>
                          <option value="converted">✅ Converted</option>
                          <option value="archived">📁 Archived</option>
                        </select>
                      </td>

                      {/* Intent Tags */}
                      <td className="py-4 px-6">
                        <div className="flex flex-wrap gap-1.5 max-w-xs">
                          {lead.intent_tags && lead.intent_tags.length > 0 ? (
                            lead.intent_tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="bg-blue-950/80 text-blue-300 border border-blue-800/50 text-[11px] font-medium px-2 py-0.5 rounded-md"
                              >
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-600 italic">
                              No tags assigned
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Notes Section */}
                      <td className="py-4 px-6">
                        {editingNotesId === lead.id ? (
                          <div className="flex flex-col gap-2">
                            <textarea
                              value={tempNotes}
                              onChange={(e) => setTempNotes(e.target.value)}
                              className="bg-slate-950 border border-slate-700 text-xs text-white p-2 rounded-lg w-48 h-20 focus:outline-none focus:border-blue-500"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleSaveNotes(lead.id)}
                                className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded hover:bg-blue-500"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingNotesId(null)}
                                className="bg-slate-800 text-slate-400 text-[10px] font-bold px-2 py-1 rounded hover:text-white"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            onClick={() => {
                              setEditingNotesId(lead.id);
                              setTempNotes(lead.notes || '');
                            }}
                            className="cursor-pointer group"
                          >
                            <p className="text-xs text-slate-300 max-w-xs truncate">
                              {lead.notes || (
                                <span className="text-slate-600 italic">
                                  Click to add note...
                                </span>
                              )}
                            </p>
                          </div>
                        )}
                      </td>

                      {/* Last Active */}
                      <td className="py-4 px-6 text-xs text-slate-400 whitespace-nowrap">
                        {lead.last_active
                          ? new Date(lead.last_active).toLocaleString('en-CA', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
