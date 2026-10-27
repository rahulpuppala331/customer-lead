import React, { useState } from 'react';
import {
  X,
  Sliders,
  ShieldCheck,
  Flame,
  Clock,
  Sparkles,
  Zap,
  Building2,
  Bell,
  CheckCircle2,
} from 'lucide-react';

interface ScoringRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScoringRulesModal: React.FC<ScoringRulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [slackAlertsEnabled, setSlackAlertsEnabled] = useState(true);
  const [autoEscalateCompetitor, setAutoEscalateCompetitor] = useState(true);
  const [autoEscalateCSuite, setAutoEscalateCSuite] = useState(true);
  const [p0Threshold, setP0Threshold] = useState(85);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl shadow-black/80 overflow-hidden text-xs">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                AI Lead Qualification &amp; SLA Routing Configuration
              </h2>
              <p className="text-slate-400">
                Transparent heuristics &amp; AI guardrails governing B2B lead triage
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Section 1: Scoring Attribution Model */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
            <h3 className="font-bold text-slate-200 uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span>Composite AI Score Weighting (100 Points Total)</span>
              <span className="text-indigo-400 font-mono">B2B SaaS Model v3.4</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-indigo-400 font-bold text-base block">30%</span>
                <span className="font-semibold text-slate-200 block">ICP Fit</span>
                <span className="text-slate-500 text-[10px]">
                  Company size, revenue tier, industry &amp; tech stack match.
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-emerald-400 font-bold text-base block">30%</span>
                <span className="font-semibold text-slate-200 block">Intent Depth</span>
                <span className="text-slate-500 text-[10px]">
                  Detailed pain points, specific use-case, seat count mentioned.
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-amber-400 font-bold text-base block">25%</span>
                <span className="font-semibold text-slate-200 block">Authority</span>
                <span className="text-slate-500 text-[10px]">
                  C-level, VP, or Director with direct budget sign-off power.
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-rose-400 font-bold text-base block">15%</span>
                <span className="font-semibold text-slate-200 block">Urgency</span>
                <span className="text-slate-500 text-[10px]">
                  Active evaluation timeline, impending renewal, budget deadline.
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: SLA Response Targets by Priority Tier */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
            <h3 className="font-bold text-slate-200 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>Speed-to-Lead SLA Windows</span>
            </h3>

            <div className="space-y-2">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-rose-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  <span className="font-bold text-rose-300">P0-Critical (Score ≥ {p0Threshold})</span>
                  <span className="text-slate-400 text-[11px] hidden sm:inline">• Enterprise high-intent</span>
                </div>
                <div className="text-rose-400 font-bold font-mono bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
                  Target: &lt; 15 Mins
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-amber-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="font-bold text-amber-300">P1-High (Score 70 - 84)</span>
                  <span className="text-slate-400 text-[11px] hidden sm:inline">• Qualified Mid-Market</span>
                </div>
                <div className="text-amber-400 font-bold font-mono bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                  Target: &lt; 60 Mins
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-blue-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="font-bold text-blue-300">P2-Medium (Score 50 - 69)</span>
                  <span className="text-slate-400 text-[11px] hidden sm:inline">• Exploring / Next quarter</span>
                </div>
                <div className="text-blue-400 font-bold font-mono bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/30">
                  Target: &lt; 4 Hours
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-500" />
                  <span className="font-bold text-slate-400">P3-Low (Score &lt; 50)</span>
                  <span className="text-slate-500 text-[11px] hidden sm:inline">• Academic / Non-commercial</span>
                </div>
                <div className="text-slate-400 font-mono bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  Target: Automated Nurture
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Smart Routing Rules & Auto-Escalation */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="font-bold text-slate-200 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Smart Auto-Escalation Triggers</span>
            </h3>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
              <div>
                <div className="font-semibold text-slate-200">
                  Auto-Escalate Competitor Churn Triggers to P0
                </div>
                <div className="text-[10px] text-slate-400">
                  When prospects mention impending renewal dates (e.g. Datadog, Splunk renewal in &lt; 30 days)
                </div>
              </div>
              <input
                type="checkbox"
                checked={autoEscalateCompetitor}
                onChange={(e) => setAutoEscalateCompetitor(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
              <div>
                <div className="font-semibold text-slate-200">
                  Auto-Escalate C-Level &amp; VP Inquiries
                </div>
                <div className="text-[10px] text-slate-400">
                  Automatically elevate CISO, CTO, VP Platform roles to VIP 15-minute SLA
                </div>
              </div>
              <input
                type="checkbox"
                checked={autoEscalateCSuite}
                onChange={(e) => setAutoEscalateCSuite(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
              <div>
                <div className="font-semibold text-slate-200">
                  Instant Slack &amp; Mobile Push Alerts for P0 Breaches
                </div>
                <div className="text-[10px] text-slate-400">
                  Dispatches webhook to #sales-urgent when an enterprise lead reaches 50% SLA elapsed
                </div>
              </div>
              <input
                type="checkbox"
                checked={slackAlertsEnabled}
                onChange={(e) => setSlackAlertsEnabled(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between">
          <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Active across Website, Events, Referrals &amp; Email
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
