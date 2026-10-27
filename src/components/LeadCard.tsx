import React from 'react';
import {
  Globe,
  Calendar,
  Users2,
  Mail,
  Clock,
  AlertCircle,
  Flame,
  Sparkles,
  ArrowRight,
  Send,
  Building2,
  CheckCircle2,
  UserCheck,
} from 'lucide-react';
import { Lead, LeadChannel } from '../types';

interface LeadCardProps {
  lead: Lead;
  onSelectLead: (lead: Lead) => void;
  onQuickOutreach: (lead: Lead) => void;
  onUpdateStatus: (leadId: string, newStatus: Lead['status']) => void;
}

export const LeadCard: React.FC<LeadCardProps> = ({
  lead,
  onSelectLead,
  onQuickOutreach,
  onUpdateStatus,
}) => {
  // Calculate SLA countdown
  const now = Date.now();
  const deadline = new Date(lead.slaDeadline).getTime();
  const diffMinutes = Math.round((deadline - now) / (1000 * 60));
  const isBreached = diffMinutes < 0 && lead.status === 'new';
  const isUrgent = diffMinutes >= 0 && diffMinutes <= 15 && lead.status === 'new';

  const getChannelBadge = (channel: LeadChannel) => {
    switch (channel) {
      case 'website':
        return {
          icon: Globe,
          label: 'Website Demo',
          color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
        };
      case 'event':
        return {
          icon: Calendar,
          label: 'Event Badge',
          color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
        };
      case 'referral':
        return {
          icon: Users2,
          label: 'Exec Referral',
          color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
        };
      case 'email':
        return {
          icon: Mail,
          label: 'Inbound Email',
          color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
        };
    }
  };

  const channelMeta = getChannelBadge(lead.channel);
  const ChannelIcon = channelMeta.icon;

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (score >= 75) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    if (score >= 50) return 'text-sky-400 bg-sky-500/10 border-sky-500/30';
    return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
  };

  return (
    <div
      onClick={() => onSelectLead(lead)}
      className={`group relative bg-slate-900/90 hover:bg-slate-850 border rounded-xl p-4 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md hover:border-slate-700 flex flex-col justify-between gap-3 ${
        isBreached
          ? 'border-rose-500/60 ring-1 ring-rose-500/30 shadow-rose-950/20'
          : isUrgent
          ? 'border-amber-500/60 ring-1 ring-amber-500/30'
          : lead.priorityTier === 'P0-Critical'
          ? 'border-rose-900/60'
          : 'border-slate-800'
      }`}
    >
      {/* Top Header: Channel, Priority, SLA & Score */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Channel Badge */}
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${channelMeta.color}`}
            >
              <ChannelIcon className="w-3 h-3" />
              <span>{channelMeta.label}</span>
            </span>

            {/* Priority Tier */}
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
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
              <span>{lead.priorityTier}</span>
            </span>
          </div>

          {/* AI Score Badge */}
          <div
            className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-xs font-bold shrink-0 ${getScoreColor(
              lead.score
            )}`}
            title={`Lead AI Score: ${lead.score}/100 (ICP Fit: ${lead.scoreBreakdown.icpFit}/30, Intent: ${lead.scoreBreakdown.intentDepth}/30)`}
          >
            <Sparkles className="w-3 h-3" />
            <span>{lead.score}</span>
          </div>
        </div>

        {/* Prospect & Company Identity */}
        <div className="mb-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-1">
                {lead.name}
              </h3>
              <p className="text-xs text-slate-400 line-clamp-1 font-medium">{lead.role}</p>
            </div>
            {lead.estimatedDealArr && lead.estimatedDealArr !== '$0' && (
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 shrink-0">
                {lead.estimatedDealArr.split(' ')[0]}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
            <span className="flex items-center gap-1 text-slate-300 font-medium">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              {lead.company}
            </span>
            {lead.companySize && (
              <>
                <span className="text-slate-600">•</span>
                <span className="text-[11px] text-slate-400">{lead.companySize}</span>
              </>
            )}
          </div>
        </div>

        {/* AI Intent Summary Snippet */}
        <div className="bg-slate-950/60 rounded-lg p-2.5 border border-slate-800/80 mb-2">
          <div className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 mb-0.5 flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" />
            <span>AI Intent Extract</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
            {lead.intentSummary}
          </p>
        </div>

        {/* Tags */}
        {lead.tags && lead.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {lead.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="text-[10px] px-1.5 py-0.5 bg-slate-800/80 text-slate-400 rounded border border-slate-700/60"
              >
                {tag}
              </span>
            ))}
            {lead.tags.length > 3 && (
              <span className="text-[10px] px-1 py-0.5 text-slate-500">
                +{lead.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer: SLA Timer & Quick Action Buttons */}
      <div className="pt-2 border-t border-slate-800/70 flex items-center justify-between gap-2">
        {/* SLA Status indicator */}
        <div className="flex items-center gap-1 text-[11px]">
          <Clock
            className={`w-3.5 h-3.5 ${
              isBreached
                ? 'text-rose-400 animate-spin'
                : isUrgent
                ? 'text-amber-400'
                : 'text-slate-500'
            }`}
          />
          {isBreached ? (
            <span className="text-rose-400 font-bold">
              Breached by {Math.abs(diffMinutes)}m
            </span>
          ) : isUrgent ? (
            <span className="text-amber-400 font-bold">{diffMinutes}m SLA left</span>
          ) : (
            <span className="text-slate-400">
              {diffMinutes > 60
                ? `${Math.round(diffMinutes / 60)}h left`
                : `${diffMinutes}m left`}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickOutreach(lead);
            }}
            className="px-2 py-1 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 hover:text-indigo-200 border border-indigo-500/30 rounded text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
            title="Open AI Personalized Outreach Draft"
          >
            <Send className="w-3 h-3" />
            <span>Outreach</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectLead(lead);
            }}
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors cursor-pointer"
            title="View Full AI Triage Briefing"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
