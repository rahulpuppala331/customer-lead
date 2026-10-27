import React from 'react';
import {
  Globe,
  Calendar,
  Users2,
  Mail,
  Clock,
  Sparkles,
  Flame,
  ArrowRight,
  Send,
  Building2,
  User,
} from 'lucide-react';
import { Lead, LeadChannel } from '../types';

interface LeadTableRowProps {
  lead: Lead;
  onSelectLead: (lead: Lead) => void;
  onQuickOutreach: (lead: Lead) => void;
}

export const LeadTableRow: React.FC<LeadTableRowProps> = ({
  lead,
  onSelectLead,
  onQuickOutreach,
}) => {
  const now = Date.now();
  const deadline = new Date(lead.slaDeadline).getTime();
  const diffMinutes = Math.round((deadline - now) / (1000 * 60));
  const isBreached = diffMinutes < 0 && lead.status === 'new';
  const isUrgent = diffMinutes >= 0 && diffMinutes <= 15 && lead.status === 'new';

  const getChannelBadge = (channel: LeadChannel) => {
    switch (channel) {
      case 'website':
        return { icon: Globe, label: 'Website', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' };
      case 'event':
        return { icon: Calendar, label: 'Event', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' };
      case 'referral':
        return { icon: Users2, label: 'Referral', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
      case 'email':
        return { icon: Mail, label: 'Email', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
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
    <tr
      onClick={() => onSelectLead(lead)}
      className="border-b border-slate-800/80 hover:bg-slate-850/80 transition-colors cursor-pointer text-xs"
    >
      {/* Priority & SLA */}
      <td className="py-3 px-4 whitespace-nowrap">
        <div className="flex flex-col gap-1">
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border w-fit ${
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
          <span
            className={`flex items-center gap-1 text-[10px] ${
              isBreached ? 'text-rose-400 font-bold' : isUrgent ? 'text-amber-400 font-semibold' : 'text-slate-500'
            }`}
          >
            <Clock className="w-2.5 h-2.5" />
            {isBreached
              ? `Breached (${Math.abs(diffMinutes)}m)`
              : isUrgent
              ? `${diffMinutes}m SLA left`
              : `${diffMinutes}m left`}
          </span>
        </div>
      </td>

      {/* AI Score */}
      <td className="py-3 px-3 whitespace-nowrap">
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border font-bold text-xs ${getScoreColor(
            lead.score
          )}`}
        >
          <Sparkles className="w-3 h-3" />
          {lead.score}
        </span>
      </td>

      {/* Prospect & Company */}
      <td className="py-3 px-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-100 hover:text-indigo-300 transition-colors">
              {lead.name}
            </span>
            <span
              className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.2 rounded-full border ${channelMeta.color}`}
            >
              <ChannelIcon className="w-2.5 h-2.5" />
              {channelMeta.label}
            </span>
          </div>
          <span className="text-slate-400 text-[11px] font-medium">{lead.role}</span>
          <span className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
            <Building2 className="w-3 h-3" />
            {lead.company} {lead.companySize ? `(${lead.companySize})` : ''}
          </span>
        </div>
      </td>

      {/* AI Intent Summary */}
      <td className="py-3 px-4 max-w-xs md:max-w-md">
        <p className="text-slate-300 text-xs line-clamp-2 leading-relaxed">
          {lead.intentSummary}
        </p>
        {lead.competitorMentions && lead.competitorMentions.length > 0 && (
          <span className="inline-block text-[10px] text-amber-300/90 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20 mt-1">
            vs {lead.competitorMentions[0]}
          </span>
        )}
      </td>

      {/* Deal ARR */}
      <td className="py-3 px-4 whitespace-nowrap">
        <span className="font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 text-xs">
          {lead.estimatedDealArr}
        </span>
      </td>

      {/* Status */}
      <td className="py-3 px-3 whitespace-nowrap">
        <span
          className={`px-2 py-0.5 rounded-full text-[11px] font-medium border capitalize ${
            lead.status === 'new'
              ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
              : lead.status === 'triaged'
              ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
              : lead.status === 'contacted'
              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
              : lead.status === 'meeting_scheduled'
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}
        >
          {lead.status.replace('_', ' ')}
        </span>
      </td>

      {/* Assigned Role / Territory */}
      <td className="py-3 px-4 whitespace-nowrap text-slate-400 text-xs">
        <div className="flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-slate-500" />
          <span>{lead.assignedTo || lead.suggestedAssignedRole}</span>
        </div>
      </td>

      {/* Actions */}
      <td className="py-3 px-4 whitespace-nowrap text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickOutreach(lead);
            }}
            className="px-2.5 py-1 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 rounded border border-indigo-500/30 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
            title="Open Email Outreach"
          >
            <Send className="w-3 h-3" />
            <span>Outreach</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectLead(lead);
            }}
            className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded transition-colors cursor-pointer"
            title="Open Full Lead Intelligence Drawer"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};
