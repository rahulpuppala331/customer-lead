import React from 'react';
import {
  Sparkles,
  Search,
  SlidersHorizontal,
  PlusCircle,
  LayoutGrid,
  List,
  Globe,
  Calendar,
  Users2,
  Mail,
  Zap,
} from 'lucide-react';
import { LeadChannel, PriorityTier, Lead } from '../types';

interface HeaderProps {
  leads: Lead[];
  selectedChannel: LeadChannel | 'all';
  onSelectChannel: (channel: LeadChannel | 'all') => void;
  selectedPriority: PriorityTier | 'all';
  onSelectPriority: (priority: PriorityTier | 'all') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: 'kanban' | 'table';
  onToggleViewMode: (mode: 'kanban' | 'table') => void;
  onOpenSimulator: () => void;
  onOpenScoringRules: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  leads,
  selectedChannel,
  onSelectChannel,
  selectedPriority,
  onSelectPriority,
  searchQuery,
  onSearchChange,
  viewMode,
  onToggleViewMode,
  onOpenSimulator,
  onOpenScoringRules,
}) => {
  const getChannelCount = (channel: LeadChannel) => {
    return leads.filter((l) => l.channel === channel).length;
  };

  const getPriorityCount = (priority: PriorityTier) => {
    return leads.filter((l) => l.priorityTier === priority).length;
  };

  return (
    <header className="border-b border-slate-800 bg-slate-950/95 sticky top-0 z-30 backdrop-blur-md">
      {/* Top Brand & Actions Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-100 tracking-tight">
                  LeadPulse <span className="text-indigo-400">AI</span>
                </h1>
                <span className="flex items-center gap-1 text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Triage
                </span>
              </div>
              <p className="text-xs text-slate-400">
                B2B Lead Intelligence &amp; Speed-to-Lead Engine
              </p>
            </div>
          </div>

          {/* Quick mobile simulator trigger */}
          <button
            onClick={onOpenSimulator}
            className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold shadow-md cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Simulate
          </button>
        </div>

        {/* Center: Search Bar */}
        <div className="w-full md:max-w-md relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search prospect, company, role, or pain point..."
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Right: Mode & Primary CTA */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-900 border border-slate-800 p-0.5 rounded-lg">
            <button
              onClick={() => onToggleViewMode('kanban')}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Kanban Pipeline View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kanban</span>
            </button>
            <button
              onClick={() => onToggleViewMode('table')}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Dense Table View"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>

          {/* Scoring Rules Drawer */}
          <button
            onClick={onOpenScoringRules}
            className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Inspect & Adjust AI Scoring Criteria"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">SLA &amp; Rules</span>
          </button>

          {/* Simulate New Inbound Lead */}
          <button
            onClick={onOpenSimulator}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-semibold tracking-wide transition-all shadow-md shadow-indigo-600/25 flex items-center gap-2 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-white text-transparent" />
            <span>Simulate Inbound Lead</span>
          </button>
        </div>
      </div>

      {/* Channel & Priority Filter Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80 bg-slate-950/60 text-xs">
        {/* Channel Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-slate-500 text-[11px] font-medium mr-1 uppercase tracking-wider">
            Channel:
          </span>
          <button
            onClick={() => onSelectChannel('all')}
            className={`px-2.5 py-1 rounded-full font-medium transition-all cursor-pointer ${
              selectedChannel === 'all'
                ? 'bg-slate-200 text-slate-950 font-semibold'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            All Channels ({leads.length})
          </button>
          <button
            onClick={() => onSelectChannel('website')}
            className={`px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedChannel === 'website'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 font-semibold'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Globe className="w-3 h-3 text-blue-400" />
            <span>Website Demo</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
              {getChannelCount('website')}
            </span>
          </button>
          <button
            onClick={() => onSelectChannel('event')}
            className={`px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedChannel === 'event'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-semibold'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Calendar className="w-3 h-3 text-purple-400" />
            <span>Events / Booths</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
              {getChannelCount('event')}
            </span>
          </button>
          <button
            onClick={() => onSelectChannel('referral')}
            className={`px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedChannel === 'referral'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Users2 className="w-3 h-3 text-amber-400" />
            <span>Referrals</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
              {getChannelCount('referral')}
            </span>
          </button>
          <button
            onClick={() => onSelectChannel('email')}
            className={`px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedChannel === 'email'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Mail className="w-3 h-3 text-emerald-400" />
            <span>Inbound Emails</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
              {getChannelCount('email')}
            </span>
          </button>
        </div>

        {/* Priority Quick Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 text-[11px] font-medium mr-1 uppercase tracking-wider">
            Tier:
          </span>
          <button
            onClick={() => onSelectPriority('all')}
            className={`px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${
              selectedPriority === 'all'
                ? 'bg-slate-800 text-slate-100 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => onSelectPriority('P0-Critical')}
            className={`px-2 py-0.5 rounded font-medium flex items-center gap-1 transition-colors cursor-pointer ${
              selectedPriority === 'P0-Critical'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 font-bold'
                : 'text-rose-400/80 hover:text-rose-300'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>P0 Critical ({getPriorityCount('P0-Critical')})</span>
          </button>
          <button
            onClick={() => onSelectPriority('P1-High')}
            className={`px-2 py-0.5 rounded font-medium flex items-center gap-1 transition-colors cursor-pointer ${
              selectedPriority === 'P1-High'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold'
                : 'text-amber-400/80 hover:text-amber-300'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>P1 ({getPriorityCount('P1-High')})</span>
          </button>
          <button
            onClick={() => onSelectPriority('P2-Medium')}
            className={`px-2 py-0.5 rounded font-medium flex items-center gap-1 transition-colors cursor-pointer ${
              selectedPriority === 'P2-Medium'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/50 font-bold'
                : 'text-blue-400/80 hover:text-blue-300'
            }`}
          >
            <span>P2 ({getPriorityCount('P2-Medium')})</span>
          </button>
          <button
            onClick={() => onSelectPriority('P3-Low')}
            className={`px-2 py-0.5 rounded font-medium flex items-center gap-1 transition-colors cursor-pointer ${
              selectedPriority === 'P3-Low'
                ? 'bg-slate-700 text-slate-200 font-bold'
                : 'text-slate-500 hover:text-slate-400'
            }`}
          >
            <span>P3 ({getPriorityCount('P3-Low')})</span>
          </button>
        </div>
      </div>
    </header>
  );
};
