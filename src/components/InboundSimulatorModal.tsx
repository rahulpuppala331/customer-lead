import React, { useState } from 'react';
import {
  X,
  Zap,
  Globe,
  Calendar,
  Users2,
  Mail,
  Sparkles,
  Building2,
  User,
  Phone,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  FileText,
} from 'lucide-react';
import { Lead, LeadChannel } from '../types';

interface InboundSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadCreated: (newLead: Lead) => void;
}

interface PresetLead {
  channel: LeadChannel;
  name: string;
  role: string;
  company: string;
  companySize: string;
  email: string;
  phone: string;
  sourceDetails: string;
  message: string;
  titleBadge: string;
}

const PRESET_LEADS: PresetLead[] = [
  {
    channel: 'website',
    name: 'Kavita Sundaram',
    role: 'VP of Data Engineering',
    company: 'FinPulse Systems',
    companySize: '1,200 employees',
    email: 'kavita.s@finpulse.com',
    phone: '+1 (415) 321-9876',
    sourceDetails: 'Enterprise Demo Request Form (High Intent)',
    message: 'We are processing over 800 million financial transactions daily and our current legacy ETL pipeline is stalling during market close spikes. Need to evaluate real-time stream ingestion and SOC2/HIPAA compliance. We have earmarked $120k budget for Q1 rollout and need an architect-led demo next Tuesday.',
    titleBadge: 'High-Urgency FinTech Enterprise Demo ($120k Budget)',
  },
  {
    channel: 'event',
    name: 'Thomas Becker',
    role: 'Head of Infrastructure Security',
    company: 'Vanguard Aerospace',
    companySize: '3,400 employees',
    email: 't.becker@vanguard-aero.com',
    phone: '+1 (206) 555-7812',
    sourceDetails: 'Gartner Security Summit 2026 - Booth #312 Badge Scan & Notes',
    message: 'Scanned badge after the Zero Trust panel. Thomas spent 20 minutes discussing their air-gapped compliance needs and telemetry encryption. They are re-evaluating Splunk due to high licensing overhead. Looking for a 30-day proof of concept for 60 engineers starting next month.',
    titleBadge: 'Gartner Summit Booth Badge Scan (Replacing Splunk)',
  },
  {
    channel: 'referral',
    name: 'Alisha Morales',
    role: 'Chief Operating Officer (COO)',
    company: 'NextGen HealthTech',
    companySize: '750 employees',
    email: 'alisha@nextgenhealth.org',
    phone: '+1 (617) 889-4321',
    sourceDetails: 'Warm Intro from Partner Board Member at Bessemer',
    message: 'Hi team, Sarah from Bessemer suggested we connect immediately. Our clinical operations team is bogged down by manual triage between care teams and patient intake. We need an enterprise platform that can unify routing with strict HIPAA compliance before our board update on the 15th.',
    titleBadge: 'Bessemer Board Member Warm Referral (C-Suite)',
  },
  {
    channel: 'email',
    name: 'David O\'Connor',
    role: 'Director of IT & Enterprise Systems',
    company: 'OmniGlobal Retail',
    companySize: '5,000+ employees',
    email: 'david.oconnor@omniglobal.com',
    phone: '+1 (312) 443-9080',
    sourceDetails: 'Direct Inbound Email to enterprise-sales@',
    message: 'Hello, our CIO asked me to reach out directly regarding your workflow orchestration solution. We have 450 store managers across North America needing standardized escalation routing. Can you provide your SOC2 report, pricing for 500 seats, and schedule a 30-minute discovery call this Thursday?',
    titleBadge: 'Direct Inbound CIO Escalation (500 Seats RFP)',
  },
];

export const InboundSimulatorModal: React.FC<InboundSimulatorModalProps> = ({
  isOpen,
  onClose,
  onLeadCreated,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');

  // Custom Form State
  const [channel, setChannel] = useState<LeadChannel>('website');
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [companySize, setCompanySize] = useState('250-500 employees');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [sourceDetails, setSourceDetails] = useState('');
  const [message, setMessage] = useState('');

  // Loading & Animation State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');

  const runAiAnalysis = async (leadData: {
    channel: LeadChannel;
    name: string;
    role: string;
    company: string;
    companySize?: string;
    email: string;
    phone?: string;
    sourceDetails: string;
    message: string;
  }) => {
    setIsAnalyzing(true);
    setAnalysisStep('⚡ Step 1/4: Parsing unstructured text & firmographics...');

    try {
      setTimeout(() => {
        setAnalysisStep('🎯 Step 2/4: Evaluating ICP fit, intent signals & BANT authority...');
      }, 700);

      setTimeout(() => {
        setAnalysisStep('🛡️ Step 3/4: Auditing competitor churn indicators & SLA risk...');
      }, 1400);

      setTimeout(() => {
        setAnalysisStep('📝 Step 4/4: Drafting tailored AE brief & personalized outreach...');
      }, 2100);

      const response = await fetch('/api/leads/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData),
      });

      const aiData = await response.json();

      // Compute SLA deadline
      const now = new Date();
      const slaMinutes = aiData.slaMinutes || 60;
      const slaDeadline = new Date(now.getTime() + slaMinutes * 60 * 1000).toISOString();

      const newLead: Lead = {
        id: `lead-${Date.now()}`,
        createdAt: now.toISOString(),
        channel: leadData.channel,
        name: leadData.name,
        email: leadData.email,
        company: leadData.company,
        role: leadData.role,
        phone: leadData.phone,
        companySize: leadData.companySize,
        message: leadData.message,
        sourceDetails: leadData.sourceDetails || `Simulated ${leadData.channel} intake`,
        status: 'new',
        score: aiData.score || 85,
        scoreBreakdown: aiData.scoreBreakdown || {
          icpFit: 25,
          intentDepth: 25,
          decisionAuthority: 22,
          opportunityUrgency: 13,
        },
        priorityTier: aiData.priorityTier || 'P1-High',
        slaMinutes: slaMinutes,
        slaDeadline: slaDeadline,
        estimatedDealArr: aiData.estimatedDealArr || '$50,000 - $85,000 ARR',
        buyingStage: aiData.buyingStage || 'Active Evaluation',
        intentSummary: aiData.intentSummary || 'Prospect seeking enterprise workflow solution.',
        painPoints: aiData.painPoints || ['Operational friction in legacy workflows'],
        risksAndRedFlags: aiData.risksAndRedFlags || ['Verify procurement cycle'],
        competitorMentions: aiData.competitorMentions || [],
        bantAudit: aiData.bantAudit || {
          budget: 'Under Assessment',
          authority: leadData.role,
          need: 'Streamline operations',
          timeline: '< 60 Days',
        },
        executiveBrief:
          aiData.executiveBrief ||
          `${leadData.name} (${leadData.role} @ ${leadData.company}) reached out via ${leadData.channel}. Immediate follow-up recommended.`,
        recommendedNextAction:
          aiData.recommendedNextAction || 'Schedule discovery call with Solutions Engineer',
        suggestedAssignedRole: aiData.suggestedAssignedRole || 'Strategic Enterprise AE',
        suggestedQuestions: aiData.suggestedQuestions || [
          'What is your target timeline for rollout?',
          'What are the key integration requirements with your existing stack?',
        ],
        generatedEmailDraft: aiData.generatedEmailDraft || {
          subject: `Connecting regarding ${leadData.company}'s requirements`,
          body: `Hi ${leadData.name.split(' ')[0]},\n\nThank you for reaching out. We would love to discuss how we can help ${leadData.company} streamline workflows.\n\nBest regards,\nSales Team`,
        },
        isAiGenerated: true,
        tags: [
          leadData.channel.toUpperCase(),
          aiData.priorityTier || 'P1',
          aiData.competitorMentions?.[0] ? `Competitor: ${aiData.competitorMentions[0]}` : 'Enterprise',
        ],
        notes: [
          {
            id: `note-${Date.now()}`,
            author: 'LeadPulse AI Ingestion',
            text: `Intake processed via ${leadData.channel}. Assigned initial priority: ${aiData.priorityTier}.`,
            createdAt: now.toISOString(),
          },
        ],
      };

      onLeadCreated(newLead);
      onClose();
    } catch (err) {
      console.error('Error during AI lead ingestion:', err);
      alert('Error analyzing lead with AI. Please check server logs.');
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep('');
    }
  };

  const handleSelectPreset = (preset: PresetLead) => {
    runAiAnalysis({
      channel: preset.channel,
      name: preset.name,
      role: preset.role,
      company: preset.company,
      companySize: preset.companySize,
      email: preset.email,
      phone: preset.phone,
      sourceDetails: preset.sourceDetails,
      message: preset.message,
    });
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !company.trim() || !message.trim()) {
      alert('Please provide contact name, company, and inquiry message.');
      return;
    }

    runAiAnalysis({
      channel,
      name: name.trim(),
      role: role.trim() || 'Business Leader',
      company: company.trim(),
      companySize,
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@${company.toLowerCase().replace(/[^a-z]/g, '')}.com`,
      phone: phone.trim(),
      sourceDetails: sourceDetails.trim() || `Custom ${channel} Inbound Entry`,
      message: message.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl shadow-black/80 overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-400 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                <span>Multi-Channel Inbound Lead Simulator</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  AI Triage
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Simulate real-world inbound inquiries across Website, Events, Referrals &amp; Email
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isAnalyzing}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Presets vs Custom Form */}
        <div className="flex items-center gap-2 px-4 sm:px-6 pt-3 border-b border-slate-800 bg-slate-950/40 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('presets')}
            className={`pb-3 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'presets'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            ⚡ 1-Click Multi-Channel Scenarios (4 Presets)
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`pb-3 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'custom'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            ✍️ Custom Inbound Raw Entry (Paste Email / Form)
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {isAnalyzing ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 animate-pulse">
                  <Sparkles className="w-8 h-8 text-indigo-400" />
                </div>
                <div className="absolute -inset-1 rounded-2xl bg-indigo-500/20 filter blur-sm -z-10 animate-spin" />
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-100">
                  AI Lead Intelligence Engine Active
                </h3>
                <p className="text-xs text-indigo-300 font-mono mt-1 animate-fade-in">
                  {analysisStep}
                </p>
              </div>

              <div className="w-64 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-sky-400 h-1.5 rounded-full animate-pulse w-3/4" />
              </div>

              <p className="text-[11px] text-slate-500 max-w-sm">
                Extracting intent, decision maker role, budget signals, competitor mentions, and drafting personalized AE outreach...
              </p>
            </div>
          ) : activeTab === 'presets' ? (
            <div className="space-y-3">
              <p className="text-xs text-slate-400 mb-2">
                Click any scenario below to trigger real-time AI extraction, BANT scoring, and automatic SLA tier routing:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {PRESET_LEADS.map((preset, idx) => {
                  const getChannelMeta = () => {
                    switch (preset.channel) {
                      case 'website':
                        return { icon: Globe, label: 'Website Form', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' };
                      case 'event':
                        return { icon: Calendar, label: 'Event Booth', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' };
                      case 'referral':
                        return { icon: Users2, label: 'Board Referral', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
                      case 'email':
                        return { icon: Mail, label: 'Direct Email', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
                    }
                  };
                  const meta = getChannelMeta();
                  const ChannelIcon = meta.icon;

                  return (
                    <div
                      key={idx}
                      onClick={() => handleSelectPreset(preset)}
                      className="group p-4 rounded-xl bg-slate-950/70 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer flex flex-col justify-between gap-3 shadow-sm hover:shadow-indigo-950/20"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${meta.color}`}
                          >
                            <ChannelIcon className="w-3 h-3" />
                            <span>{meta.label}</span>
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {preset.companySize}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-1">
                          {preset.titleBadge}
                        </h4>

                        <div className="text-[11px] text-slate-300 mt-1 font-medium">
                          {preset.name} • {preset.role} at {preset.company}
                        </div>

                        <p className="text-[11px] text-slate-400 mt-2 line-clamp-2 leading-relaxed italic bg-slate-900/60 p-2 rounded border border-slate-800/60">
                          "{preset.message}"
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-xs text-indigo-400 font-semibold pt-2 border-t border-slate-800/80">
                        <span>Simulate &amp; AI Triage</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <form onSubmit={handleCustomSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Inbound Channel
                  </label>
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value as LeadChannel)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="website">🌐 Website (Demo / Pricing Form)</option>
                    <option value="event">🎪 Event (Conference / Booth Scan)</option>
                    <option value="referral">🤝 Referral (VC / Executive Intro)</option>
                    <option value="email">✉️ Inbound Email (Direct to Sales)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Company Size Tier
                  </label>
                  <select
                    value={companySize}
                    onChange={(e) => setCompanySize(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="1,000+ employees (Enterprise)">1,000+ employees (Enterprise)</option>
                    <option value="250-1,000 employees (Mid-Market)">250-1,000 employees (Mid-Market)</option>
                    <option value="50-250 employees (Growth)">50-250 employees (Growth)</option>
                    <option value="1-50 employees (Startup / SMB)">1-50 employees (Startup / SMB)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rachel Torres"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Title / Job Role
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. VP of Cloud Engineering / CISO"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Apex Health Systems"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Work Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. rachel.t@apexhealth.org"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="text-xs">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Inbound Message / Booth Notes / Email Body *
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Paste raw email body, web inquiry form submission, or booth scan notes. Mention pain points, urgency, or competitor evaluations to test AI scoring..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-indigo-500 font-sans leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-semibold rounded-lg shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Run AI Triage &amp; Intake</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
