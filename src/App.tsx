import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Flame,
  Clock,
  LayoutGrid,
  List,
  PlusCircle,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Filter,
  Send,
  Building2,
  Calendar,
  Globe,
  Users2,
  Mail,
  Zap,
} from 'lucide-react';
import { Lead, LeadChannel, PriorityTier, LeadStatus } from './types';
import { INITIAL_LEADS } from './data/initialLeads';
import { Header } from './components/Header';
import { AnalyticsBanner } from './components/AnalyticsBanner';
import { LeadCard } from './components/LeadCard';
import { LeadTableRow } from './components/LeadTableRow';
import { LeadDetailModal } from './components/LeadDetailModal';
import { InboundSimulatorModal } from './components/InboundSimulatorModal';
import { ScoringRulesModal } from './components/ScoringRulesModal';

const STORAGE_KEY = 'leadpulse_ai_leads_v2';

export default function App() {
  // Load saved leads or fallback to initial realistic leads
  const [leads, setLeads] = useState<Lead[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not load leads from localStorage', e);
    }
    return INITIAL_LEADS;
  });

  // Save to localStorage whenever leads update
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
    } catch (e) {
      console.warn('Could not save leads to localStorage', e);
    }
  }, [leads]);

  // Filtering & View state
  const [selectedChannel, setSelectedChannel] = useState<LeadChannel | 'all'>('all');
  const [selectedPriority, setSelectedPriority] = useState<PriorityTier | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

  // Modals
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isScoringRulesOpen, setIsScoringRulesOpen] = useState(false);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Filter leads
  const filteredLeads = leads.filter((lead) => {
    if (selectedChannel !== 'all' && lead.channel !== selectedChannel) return false;
    if (selectedPriority !== 'all' && lead.priorityTier !== selectedPriority) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        lead.name.toLowerCase().includes(q) ||
        lead.company.toLowerCase().includes(q) ||
        lead.role.toLowerCase().includes(q) ||
        lead.intentSummary.toLowerCase().includes(q) ||
        lead.painPoints.some((p) => p.toLowerCase().includes(q)) ||
        (lead.competitorMentions &&
          lead.competitorMentions.some((c) => c.toLowerCase().includes(q)));
      if (!match) return false;
    }
    return true;
  });

  // Lead update handler
  const handleUpdateLead = (updatedLead: Lead) => {
    setLeads((prev) => prev.map((l) => (l.id === updatedLead.id ? updatedLead : l)));
    if (activeLead && activeLead.id === updatedLead.id) {
      setActiveLead(updatedLead);
    }
    showToast(`Updated "${updatedLead.company}" status to ${updatedLead.status.replace('_', ' ')}`);
  };

  // Status update
  const handleUpdateStatus = (leadId: string, newStatus: LeadStatus) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
    );
    showToast(`Lead status updated to ${newStatus.replace('_', ' ')}`);
  };

  // Send outreach
  const handleSendOutreach = (leadId: string, emailDraft: { subject: string; body: string }) => {
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId
          ? {
              ...l,
              status: 'contacted',
              notes: [
                ...(l.notes || []),
                {
                  id: `note-${Date.now()}`,
                  author: 'Outreach Sent',
                  text: `Dispatched outreach email: "${emailDraft.subject}"`,
                  createdAt: new Date().toISOString(),
                },
              ],
            }
          : l
      )
    );
    showToast(`Outreach sent successfully! Lead moved to "Contacted".`);
  };

  // Reset demo data
  const handleResetData = () => {
    if (confirm('Reset all leads to default demo pipeline?')) {
      setLeads(INITIAL_LEADS);
      localStorage.removeItem(STORAGE_KEY);
      showToast('Pipeline restored to initial B2B demo dataset.');
    }
  };

  // Quick outreach from card
  const handleQuickOutreach = (lead: Lead) => {
    setActiveLead(lead);
  };

  // Add new lead from simulator
  const handleLeadCreated = (newLead: Lead) => {
    setLeads((prev) => [newLead, ...prev]);
    setActiveLead(newLead);
    showToast(`🎉 New Lead from ${newLead.company} triaged! AI Score: ${newLead.score}/100`);
  };

  // Kanban Columns definition
  const KANBAN_COLUMNS: Array<{
    status: LeadStatus;
    title: string;
    desc: string;
    color: string;
    dotColor: string;
  }> = [
    {
      status: 'new',
      title: 'New Inbound Intake',
      desc: 'Awaiting first touch / review',
      color: 'border-rose-500/30 bg-rose-950/10',
      dotColor: 'bg-rose-500',
    },
    {
      status: 'triaged',
      title: 'AI Triaged & Assigned',
      desc: 'Scored & routed to AE queue',
      color: 'border-indigo-500/30 bg-indigo-950/10',
      dotColor: 'bg-indigo-400',
    },
    {
      status: 'contacted',
      title: 'Contacted / In Outreach',
      desc: 'First touch / draft delivered',
      color: 'border-amber-500/30 bg-amber-950/10',
      dotColor: 'bg-amber-400',
    },
    {
      status: 'meeting_scheduled',
      title: 'Discovery Booked',
      desc: 'VIP demo or architecture review',
      color: 'border-emerald-500/30 bg-emerald-950/10',
      dotColor: 'bg-emerald-400',
    },
    {
      status: 'nurture',
      title: 'Nurture / Low Intent',
      desc: 'Self-serve / marketing tracks',
      color: 'border-slate-700/40 bg-slate-900/30',
      dotColor: 'bg-slate-400',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-indigo-600 text-white px-4 py-3 rounded-xl shadow-2xl shadow-indigo-900/50 text-xs font-semibold animate-in slide-in-from-bottom-5 duration-200 border border-indigo-400/30">
          <Sparkles className="w-4 h-4 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <Header
        leads={leads}
        selectedChannel={selectedChannel}
        onSelectChannel={setSelectedChannel}
        selectedPriority={selectedPriority}
        onSelectPriority={setSelectedPriority}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        onOpenScoringRules={() => setIsScoringRulesOpen(true)}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
        {/* Analytics & SLA Warning Bar */}
        <AnalyticsBanner
          leads={leads}
          onFilterP0={() => {
            setSelectedPriority('P0-Critical');
          }}
        />

        {/* Action Header / Reset Button */}
        <div className="flex items-center justify-between gap-3 text-xs text-slate-400 pt-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-200">
              Showing {filteredLeads.length} of {leads.length} Leads
            </span>
            {(selectedChannel !== 'all' || selectedPriority !== 'all' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedChannel('all');
                  setSelectedPriority('all');
                  setSearchQuery('');
                }}
                className="text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetData}
              className="px-2.5 py-1 text-slate-500 hover:text-slate-300 rounded hover:bg-slate-900 transition-colors flex items-center gap-1 cursor-pointer"
              title="Reset dataset to default realistic leads"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Demo Leads</span>
            </button>
          </div>
        </div>

        {/* View: KANBAN Pipeline */}
        {viewMode === 'kanban' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
            {KANBAN_COLUMNS.map((col) => {
              const colLeads = filteredLeads.filter((l) => l.status === col.status);

              return (
                <div
                  key={col.status}
                  className={`rounded-2xl border p-3 flex flex-col gap-3 min-h-[500px] ${col.color}`}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${col.dotColor}`} />
                      <h3 className="text-xs font-bold text-slate-100">{col.title}</h3>
                    </div>
                    <span className="text-xs font-bold text-slate-400 bg-slate-900/90 px-2 py-0.5 rounded-full border border-slate-800">
                      {colLeads.length}
                    </span>
                  </div>

                  {/* Cards in Column */}
                  <div className="space-y-3 flex-1">
                    {colLeads.length === 0 ? (
                      <div className="h-32 border-2 border-dashed border-slate-800/60 rounded-xl flex items-center justify-center text-center p-3 text-slate-600 text-[11px]">
                        No leads in this stage
                      </div>
                    ) : (
                      colLeads.map((lead) => (
                        <LeadCard
                          key={lead.id}
                          lead={lead}
                          onSelectLead={setActiveLead}
                          onQuickOutreach={handleQuickOutreach}
                          onUpdateStatus={handleUpdateStatus}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* View: Dense Table */}
        {viewMode === 'table' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Priority &amp; SLA</th>
                    <th className="py-3 px-3">Score</th>
                    <th className="py-3 px-4">Prospect &amp; Company</th>
                    <th className="py-3 px-4">AI Intent &amp; Needs</th>
                    <th className="py-3 px-4">Est. Deal ARR</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-4">Assigned Rep</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-xs text-slate-500">
                        No leads match current filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredLeads.map((lead) => (
                      <LeadTableRow
                        key={lead.id}
                        lead={lead}
                        onSelectLead={setActiveLead}
                        onQuickOutreach={handleQuickOutreach}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-4 text-center text-xs text-slate-500">
        LeadPulse AI Prototype • Enterprise B2B Lead Triage, Scoring &amp; Outreach Engine
      </footer>

      {/* Modals */}
      <LeadDetailModal
        lead={activeLead}
        onClose={() => setActiveLead(null)}
        onUpdateLead={handleUpdateLead}
        onSendOutreach={handleSendOutreach}
      />

      <InboundSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        onLeadCreated={handleLeadCreated}
      />

      <ScoringRulesModal
        isOpen={isScoringRulesOpen}
        onClose={() => setIsScoringRulesOpen(false)}
      />
    </div>
  );
}
