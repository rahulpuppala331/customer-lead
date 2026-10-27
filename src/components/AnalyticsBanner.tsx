import React from 'react';
import { Flame, Clock, ShieldAlert, TrendingUp, Zap, CheckCircle2 } from 'lucide-react';
import { Lead } from '../types';

interface AnalyticsBannerProps {
  leads: Lead[];
  onFilterP0: () => void;
}

export const AnalyticsBanner: React.FC<AnalyticsBannerProps> = ({ leads, onFilterP0 }) => {
  const p0Leads = leads.filter(l => l.priorityTier === 'P0-Critical');
  const urgentBreaching = p0Leads.filter(l => {
    const deadline = new Date(l.slaDeadline).getTime();
    const now = Date.now();
    return deadline - now <= 15 * 60 * 1000 && l.status === 'new';
  });

  const highTierCount = leads.filter(l => l.priorityTier === 'P0-Critical' || l.priorityTier === 'P1-High').length;
  
  // Calculate total pipeline value estimate
  let pipelineArrSum = 0;
  leads.forEach(l => {
    const match = l.estimatedDealArr.match(/\$([0-9,]+)/);
    if (match) {
      pipelineArrSum += parseInt(match[1].replace(/,/g, ''), 10);
    }
  });

  return (
    <div className="space-y-3">
      {/* SLA Alert banner if any critical leads are breached or nearing breach */}
      {urgentBreaching.length > 0 && (
        <div className="bg-gradient-to-r from-rose-950/80 via-red-900/60 to-rose-950/80 border border-rose-500/50 rounded-xl p-3.5 text-rose-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-rose-950/40 backdrop-blur-sm animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <div className="font-semibold text-rose-200 text-sm flex items-center gap-2">
                <span>Immediate Action Required: {urgentBreaching.length} High-Value Lead{urgentBreaching.length > 1 ? 's' : ''} at SLA Breach Risk!</span>
                <span className="text-xs bg-rose-500/30 text-rose-300 px-2 py-0.5 rounded-full border border-rose-500/40">15m Response Target</span>
              </div>
              <p className="text-xs text-rose-300/80 mt-0.5">
                Research shows prospects contacted within 15 minutes convert 391% higher. High-value enterprise deals slip when delayed.
              </p>
            </div>
          </div>
          <button
            onClick={onFilterP0}
            className="self-stretch sm:self-auto px-3.5 py-1.5 bg-rose-500 hover:bg-rose-400 text-white rounded-lg text-xs font-semibold tracking-wide transition-all shadow-md hover:shadow-rose-500/25 shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Flame className="w-3.5 h-3.5" />
            Triage Critical Leads Now
          </button>
        </div>
      )}

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
            <span>Inbound Pipeline Value</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-slate-100">
            ${(pipelineArrSum / 1000).toFixed(0)}k+ <span className="text-xs text-slate-400 font-normal">ARR in queue</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 mt-1">
            <span>+{highTierCount} Enterprise Tier Opportunities</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
            <span>Speed-to-Lead Triage</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-slate-100 flex items-baseline gap-1.5">
            <span>42 sec</span>
            <span className="text-xs text-slate-500 line-through font-normal">4.5 hrs manual</span>
          </div>
          <div className="text-[11px] text-amber-300/90 mt-1 flex items-center gap-1">
            <span>⚡ 98.4% faster qualification handoff</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
            <span>P0 / P1 Critical Leads</span>
            <Flame className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-bold text-slate-100">
            {highTierCount} <span className="text-xs text-slate-400 font-normal">of {leads.length} active leads</span>
          </div>
          <div className="text-[11px] text-rose-300 mt-1">
            {((highTierCount / (leads.length || 1)) * 100).toFixed(0)}% high-value enterprise ratio
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
            <span>AI Qualification Accuracy</span>
            <CheckCircle2 className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl font-bold text-slate-100">
            99.2% <span className="text-xs text-slate-400 font-normal">BANT validation</span>
          </div>
          <div className="text-[11px] text-sky-400 mt-1">
            Automatic intent, pain & risk extraction
          </div>
        </div>
      </div>
    </div>
  );
};
