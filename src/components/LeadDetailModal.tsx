import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Flame,
  Globe,
  Calendar,
  Users2,
  Mail,
  Clock,
  Building2,
  User,
  Phone,
  Copy,
  Check,
  Send,
  AlertTriangle,
  ShieldAlert,
  HelpCircle,
  MessageSquare,
  Bot,
  RefreshCw,
  FileText,
  DollarSign,
  TrendingUp,
  Tag,
  CheckCircle2,
  ChevronRight,
  Sliders,
} from 'lucide-react';
import { Lead, LeadChannel, PriorityTier, LeadStatus } from '../types';

interface LeadDetailModalProps {
  lead: Lead | null;
  onClose: () => void;
  onUpdateLead: (updatedLead: Lead) => void;
  onSendOutreach: (leadId: string, emailDraft: { subject: string; body: string }) => void;
}

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({
  lead,
  onClose,
  onUpdateLead,
  onSendOutreach,
}) => {
  if (!lead) return null;

  const [activeTab, setActiveTab] = useState<'intelligence' | 'outreach' | 'copilot' | 'notes'>('intelligence');
  const [copiedBrief, setCopiedBrief] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedQuestionIdx, setCopiedQuestionIdx] = useState<number | null>(null);

  // Outreach Studio State
  const [emailSubject, setEmailSubject] = useState(lead.generatedEmailDraft?.subject || '');
  const [emailBody, setEmailBody] = useState(lead.generatedEmailDraft?.body || '');
  const [selectedTone, setSelectedTone] = useState<'executive-consultative' | 'high-urgency-accelerator' | 'technical-deepdive' | 'gentle-nurture'>('executive-consultative');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);

  // Copilot Chat State
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: `Hello! I'm your LeadPulse Deal Coach for **${lead.company}**. I've digested the prospect's intent, authority level, and competitive landscape. Ask me anything about objection handling, battlecards, or call scripts.`,
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isCopilotThinking, setIsCopilotThinking] = useState(false);

  // Notes state
  const [newNoteText, setNewNoteText] = useState('');

  const now = Date.now();
  const deadline = new Date(lead.slaDeadline).getTime();
  const diffMinutes = Math.round((deadline - now) / (1000 * 60));
  const isBreached = diffMinutes < 0 && lead.status === 'new';

  const copyToClipboard = (text: string, type: 'brief' | 'email') => {
    navigator.clipboard.writeText(text);
    if (type === 'brief') {
      setCopiedBrief(true);
      setTimeout(() => setCopiedBrief(false), 2000);
    } else {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  const copyQuestion = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedQuestionIdx(idx);
    setTimeout(() => setCopiedQuestionIdx(null), 2000);
  };

  // Tone regeneration
  const handleRegenerateEmail = async (tone: typeof selectedTone) => {
    setSelectedTone(tone);
    setIsGeneratingEmail(true);
    try {
      const res = await fetch('/api/leads/draft-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead,
          tone,
          customInstruction: customPrompt,
        }),
      });
      const data = await res.json();
      if (data.subject && data.body) {
        setEmailSubject(data.subject);
        setEmailBody(data.body);
      }
    } catch (err) {
      console.error('Error generating email draft:', err);
    } finally {
      setIsGeneratingEmail(false);
    }
  };

  // Copilot query submission
  const handleSendCopilotQuery = async (queryText?: string) => {
    const query = queryText || chatInput.trim();
    if (!query) return;

    const newChat = [...chatMessages, { sender: 'user' as const, text: query }];
    setChatMessages(newChat);
    setChatInput('');
    setIsCopilotThinking(true);

    try {
      const res = await fetch('/api/leads/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead, userQuery: query }),
      });
      const data = await res.json();
      setChatMessages((prev) => [
        ...prev,
        { sender: 'ai', text: data.answer || 'No guidance returned.' },
      ]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        { sender: 'ai', text: 'Error connecting to AI Sales Coach. Please try again.' },
      ]);
    } finally {
      setIsCopilotThinking(false);
    }
  };

  // Add Rep Note
  const handleAddNote = () => {
    if (!newNoteText.trim()) return;
    const newNote = {
      id: `note-${Date.now()}`,
      author: 'Current Rep (You)',
      text: newNoteText.trim(),
      createdAt: new Date().toISOString(),
    };
    const updatedNotes = [...(lead.notes || []), newNote];
    onUpdateLead({ ...lead, notes: updatedNotes });
    setNewNoteText('');
  };

  const getChannelBadge = (channel: LeadChannel) => {
    switch (channel) {
      case 'website':
        return { icon: Globe, label: 'Website Demo Form', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' };
      case 'event':
        return { icon: Calendar, label: 'Event Badge Scan', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' };
      case 'referral':
        return { icon: Users2, label: 'Executive Referral', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
      case 'email':
        return { icon: Mail, label: 'Inbound Direct Email', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
    }
  };

  const channelMeta = getChannelBadge(lead.channel);
  const ChannelIcon = channelMeta.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl shadow-black/80 overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 bg-slate-950/90 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${channelMeta.color}`}
              >
                <ChannelIcon className="w-3.5 h-3.5" />
                {channelMeta.label}
              </span>

              <span
                className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                  lead.priorityTier === 'P0-Critical'
                    ? 'text-rose-300 bg-rose-500/20 border-rose-500/40 animate-pulse'
                    : lead.priorityTier === 'P1-High'
                    ? 'text-amber-300 bg-amber-500/20 border-amber-500/40'
                    : lead.priorityTier === 'P2-Medium'
                    ? 'text-blue-300 bg-blue-500/20 border-blue-500/40'
                    : 'text-slate-400 bg-slate-800 border-slate-700'
                }`}
              >
                {lead.priorityTier === 'P0-Critical' && <Flame className="w-3 h-3 text-rose-400" />}
                {lead.priorityTier}
              </span>

              <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                <Clock className="w-3 h-3 text-slate-500" />
                {isBreached ? (
                  <span className="text-rose-400 font-bold">
                    SLA Breached ({Math.abs(diffMinutes)}m ago)
                  </span>
                ) : (
                  <span className="text-emerald-400 font-medium">
                    SLA: {diffMinutes}m remaining ({lead.slaMinutes}m window)
                  </span>
                )}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
              <span>{lead.name}</span>
              <span className="text-slate-500 font-normal text-base">•</span>
              <span className="text-indigo-300 text-lg font-semibold">{lead.role}</span>
            </h2>

            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap">
              <span className="flex items-center gap-1 text-slate-200 font-medium">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                {lead.company}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {lead.email}
              </span>
              {lead.phone && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {lead.phone}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Right Header: AI Score, Deal ARR & Close Button */}
          <div className="flex items-center gap-3 self-end md:self-center">
            {/* Lead Score Circle */}
            <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl flex items-center gap-2.5">
              <div className="w-11 h-11 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex flex-col items-center justify-center text-center">
                <span className="text-base font-extrabold text-indigo-400 leading-none">
                  {lead.score}
                </span>
                <span className="text-[9px] text-indigo-300 font-semibold uppercase">Score</span>
              </div>
              <div className="text-xs">
                <div className="font-semibold text-slate-200">
                  {lead.score >= 85 ? 'High Win Probability' : lead.score >= 65 ? 'Qualified Opportunity' : 'Nurture Prospect'}
                </div>
                <div className="text-emerald-400 font-bold">{lead.estimatedDealArr}</div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 30-Second AE Briefing Banner */}
        <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900 to-indigo-950/40 border-b border-indigo-500/30 p-3.5 sm:px-6 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <span>30-Second AE Pre-Call Brief</span>
                <span className="text-[10px] bg-indigo-500/20 px-1.5 py-0.2 rounded text-indigo-300">
                  Instant Executive Context
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 mt-1 leading-relaxed">
                {lead.executiveBrief}
              </p>
            </div>
          </div>
          <button
            onClick={() => copyToClipboard(lead.executiveBrief, 'brief')}
            className="px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 text-xs font-medium border border-indigo-500/40 flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
          >
            {copiedBrief ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Brief</span>
              </>
            )}
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-4 sm:px-6 border-b border-slate-800 bg-slate-950/50 text-xs font-semibold overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('intelligence')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'intelligence'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Qualification &amp; BANT</span>
          </button>

          <button
            onClick={() => setActiveTab('outreach')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'outreach'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>AI Outreach Studio</span>
          </button>

          <button
            onClick={() => setActiveTab('copilot')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'copilot'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Deal Coach Copilot</span>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'notes'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Rep Notes &amp; History ({lead.notes?.length || 0})</span>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: AI Qualification & BANT */}
          {activeTab === 'intelligence' && (
            <div className="space-y-6">
              {/* Score Breakdown Bars */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center justify-between">
                  <span>AI Score Attribution Breakdown</span>
                  <span className="text-indigo-400 font-semibold">{lead.score} / 100 Overall</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">ICP Fit</span>
                      <span className="font-bold text-indigo-400">
                        {lead.scoreBreakdown.icpFit} / 30
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <div
                        className="bg-indigo-500 h-2 rounded-full"
                        style={{ width: `${(lead.scoreBreakdown.icpFit / 30) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Intent Depth</span>
                      <span className="font-bold text-emerald-400">
                        {lead.scoreBreakdown.intentDepth} / 30
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <div
                        className="bg-emerald-500 h-2 rounded-full"
                        style={{ width: `${(lead.scoreBreakdown.intentDepth / 30) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Authority</span>
                      <span className="font-bold text-amber-400">
                        {lead.scoreBreakdown.decisionAuthority} / 25
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <div
                        className="bg-amber-500 h-2 rounded-full"
                        style={{ width: `${(lead.scoreBreakdown.decisionAuthority / 25) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Urgency</span>
                      <span className="font-bold text-rose-400">
                        {lead.scoreBreakdown.opportunityUrgency || 14} / 15
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <div
                        className="bg-rose-500 h-2 rounded-full"
                        style={{
                          width: `${((lead.scoreBreakdown.opportunityUrgency || 14) / 15) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* BANT Qualification Matrix */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>BANT Qualification Audit</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block font-semibold mb-1">💰 Budget Status</span>
                    <span className="text-slate-200 font-medium">{lead.bantAudit.budget}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block font-semibold mb-1">👑 Decision Authority</span>
                    <span className="text-slate-200 font-medium">{lead.bantAudit.authority}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block font-semibold mb-1">🎯 Core Problem / Need</span>
                    <span className="text-slate-200 font-medium">{lead.bantAudit.need}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block font-semibold mb-1">⏳ Buying Timeline</span>
                    <span className="text-slate-200 font-medium">{lead.bantAudit.timeline}</span>
                  </div>
                </div>
              </div>

              {/* Pain Points vs Red Flags Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Pain Points */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Extracted Pain Points</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {lead.painPoints.map((pain, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-400 mt-0.5">•</span>
                        <span>{pain}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Risks & Competitors */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Risks, Red Flags &amp; Competitors</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {lead.risksAndRedFlags.map((risk, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-400 mt-0.5">⚠️</span>
                        <span>{risk}</span>
                      </li>
                    ))}
                    {lead.competitorMentions && lead.competitorMentions.length > 0 && (
                      <li className="flex items-start gap-2 pt-1 border-t border-slate-800 text-amber-300/90 font-medium">
                        <span>⚔️ Competitor:</span>
                        <span>{lead.competitorMentions.join(', ')}</span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Suggested Discovery Questions for Sales Rep */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-indigo-400" />
                  <span>Suggested Discovery Questions for AE Call</span>
                </h4>
                <div className="space-y-2">
                  {lead.suggestedQuestions.map((q, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-slate-900 border border-slate-800/90 flex items-center justify-between gap-3 text-xs text-slate-200"
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-indigo-400 font-bold shrink-0">{idx + 1}.</span>
                        <span>{q}</span>
                      </div>
                      <button
                        onClick={() => copyQuestion(q, idx)}
                        className="text-slate-400 hover:text-slate-200 p-1.5 rounded hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
                        title="Copy Question"
                      >
                        {copiedQuestionIdx === idx ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Original Raw Intake Message */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Original Inbound Submission / Raw Notes</span>
                  <span className="text-[11px] text-slate-500 font-normal">Source: {lead.sourceDetails}</span>
                </h4>
                <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                  {lead.message}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AI Outreach Studio */}
          {activeTab === 'outreach' && (
            <div className="space-y-5">
              {/* Tone Presets */}
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                  Outreach Persona Tone:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    {
                      id: 'executive-consultative',
                      label: 'Executive Consultative',
                      desc: 'Strategic, ROI-focused, peer-to-peer',
                    },
                    {
                      id: 'high-urgency-accelerator',
                      label: 'High Urgency / Fast-Track',
                      desc: 'Timeline focused, fast deployment',
                    },
                    {
                      id: 'technical-deepdive',
                      label: 'Technical Deep-Dive',
                      desc: 'Architectural benchmarks & specs',
                    },
                    {
                      id: 'gentle-nurture',
                      label: 'Warm Partner & Case Study',
                      desc: 'Supportive, low-pressure trial',
                    },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleRegenerateEmail(t.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedTone === t.id
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 ring-1 ring-indigo-500/40'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs font-bold">{t.label}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Prompt Tweak */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Optional instruction: e.g., 'Mention our SOC2 report and 15% discount for closing this month'..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={() => handleRegenerateEmail(selectedTone)}
                  disabled={isGeneratingEmail}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingEmail ? 'animate-spin' : ''}`} />
                  <span>{isGeneratingEmail ? 'Drafting...' : 'Regenerate Draft'}</span>
                </button>
              </div>

              {/* Subject Line & Email Body */}
              <div className="space-y-3 bg-slate-950/80 border border-slate-800 rounded-xl p-4">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Email Subject
                  </label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs font-semibold text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Personalized Email Body
                  </label>
                  <textarea
                    rows={9}
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-3 text-xs text-slate-200 font-sans focus:outline-none focus:border-indigo-500 leading-relaxed"
                  />
                </div>

                {/* Email Action Buttons */}
                <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800">
                  <button
                    onClick={() =>
                      copyToClipboard(`Subject: ${emailSubject}\n\n${emailBody}`, 'email')
                    }
                    className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedEmail ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Email Text</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      onSendOutreach(lead.id, { subject: emailSubject, body: emailBody });
                      setActiveTab('notes');
                    }}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send &amp; Mark as Contacted</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AI Deal Coach Copilot */}
          {activeTab === 'copilot' && (
            <div className="space-y-4">
              {/* Preset Deal Coach Prompts */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Instant Deal Strategy Prompts:
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    `How should I position us against competitors for ${lead.company}?`,
                    `What are the top 3 objections ${lead.name.split(' ')[0]} will likely raise?`,
                    `Draft a 30-second phone opening talk-track for this prospect`,
                    `What enterprise security / compliance guarantees does a ${lead.role} care about most?`,
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendCopilotQuery(preset)}
                      className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-indigo-500/50 text-slate-300 hover:text-indigo-300 text-left transition-colors cursor-pointer"
                    >
                      💡 {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Message Box */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 min-h-[300px] max-h-[380px] overflow-y-auto space-y-3">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-2.5 ${
                      msg.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.sender === 'ai' && (
                      <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4 text-indigo-400" />
                      </div>
                    )}
                    <div
                      className={`p-3 rounded-xl text-xs max-w-xl leading-relaxed whitespace-pre-wrap ${
                        msg.sender === 'user'
                          ? 'bg-indigo-600 text-white rounded-br-none'
                          : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isCopilotThinking && (
                  <div className="flex items-center gap-2 text-xs text-indigo-400 font-medium">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing deal dynamics &amp; strategy...</span>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendCopilotQuery()}
                  placeholder={`Ask anything about closing ${lead.company} (${lead.role})...`}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={() => handleSendCopilotQuery()}
                  disabled={isCopilotThinking || !chatInput.trim()}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Ask Coach</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: Rep Notes & Activity History */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              {/* Add Note */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Add Internal Sales Rep Note / Touchpoint Log
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                    placeholder="e.g. 'Spoke to their platform architect on LinkedIn. Scheduled demo for Thursday at 2 PM'..."
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={handleAddNote}
                    disabled={!newNoteText.trim()}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Add Note
                  </button>
                </div>
              </div>

              {/* Notes List */}
              <div className="space-y-2.5">
                {lead.notes && lead.notes.length > 0 ? (
                  lead.notes.map((note) => (
                    <div
                      key={note.id}
                      className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-300"
                    >
                      <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500 mb-1">
                        <span className="font-semibold text-indigo-400">{note.author}</span>
                        <span>{new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p>{note.text}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-xs text-slate-500">
                    No rep notes recorded yet. Add your first note above!
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Sticky Bottom Controls: Status & Assignment */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/95 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Status Selector */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-medium">Status:</span>
              <select
                value={lead.status}
                onChange={(e) =>
                  onUpdateLead({ ...lead, status: e.target.value as LeadStatus })
                }
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="new">🔴 New / Unassigned</option>
                <option value="triaged">🔵 Triaged &amp; Scored</option>
                <option value="contacted">🟡 Contacted / Outreach Sent</option>
                <option value="meeting_scheduled">🟢 Meeting Scheduled</option>
                <option value="nurture">⚪ Marketing Nurture</option>
                <option value="disqualified">❌ Disqualified</option>
              </select>
            </div>

            {/* Assigned Rep Selector */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-medium">Assigned Rep:</span>
              <select
                value={lead.assignedTo || ''}
                onChange={(e) =>
                  onUpdateLead({
                    ...lead,
                    assignedTo: e.target.value || undefined,
                    status: lead.status === 'new' ? 'triaged' : lead.status,
                  })
                }
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="">Unassigned (Suggested: {lead.suggestedAssignedRole})</option>
                <option value="Alex Mercer (Enterprise AE)">Alex Mercer (Enterprise AE)</option>
                <option value="Marcus Lind (EMEA Enterprise AE)">Marcus Lind (EMEA AE)</option>
                <option value="Sarah Koenig (Strategic Accounts)">Sarah Koenig (Strategic AE)</option>
                <option value="Dave Chen (Commercial Inbound SDR)">Dave Chen (Inbound SDR)</option>
                <option value="Claimed by You (Current User)">Claim for Myself</option>
              </select>
            </div>
          </div>

          {/* Quick Primary Next Action CTA */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onUpdateLead({
                  ...lead,
                  status: 'meeting_scheduled',
                  notes: [
                    ...(lead.notes || []),
                    {
                      id: `note-${Date.now()}`,
                      author: 'LeadPulse Quick Action',
                      text: `Executed recommended action: "${lead.recommendedNextAction}" and scheduled discovery.`,
                      createdAt: new Date().toISOString(),
                    },
                  ],
                });
                onClose();
              }}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-semibold rounded-lg shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Execute: {lead.recommendedNextAction.slice(0, 36)}...</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
