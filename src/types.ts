export type LeadChannel = 'website' | 'event' | 'referral' | 'email';

export type PriorityTier = 'P0-Critical' | 'P1-High' | 'P2-Medium' | 'P3-Low';

export type LeadStatus = 'new' | 'triaged' | 'contacted' | 'meeting_scheduled' | 'nurture' | 'disqualified';

export interface ScoreBreakdown {
  icpFit: number;          // 0-30
  intentDepth: number;     // 0-30
  decisionAuthority: number; // 0-25
  opportunityUrgency: number; // 0-15
}

export interface BantAudit {
  budget: string;
  authority: string;
  need: string;
  timeline: string;
}

export interface GeneratedEmailDraft {
  subject: string;
  body: string;
}

export interface Lead {
  id: string;
  createdAt: string;       // ISO string
  channel: LeadChannel;
  name: string;
  email: string;
  company: string;
  role: string;
  phone?: string;
  companySize?: string;
  message: string;
  sourceDetails: string;
  status: LeadStatus;
  assignedTo?: string;
  
  // AI Extracted & Assessed Intelligence
  score: number;           // 0-100
  scoreBreakdown: ScoreBreakdown;
  priorityTier: PriorityTier;
  slaMinutes: number;      // e.g. 15, 60, 240, 1440
  slaDeadline: string;     // ISO timestamp
  estimatedDealArr: string;
  buyingStage: string;
  intentSummary: string;
  painPoints: string[];
  risksAndRedFlags: string[];
  competitorMentions: string[];
  bantAudit: BantAudit;
  executiveBrief: string;
  recommendedNextAction: string;
  suggestedAssignedRole: string;
  suggestedQuestions: string[];
  generatedEmailDraft: GeneratedEmailDraft;
  isAiGenerated: boolean;
  tags: string[];
  notes?: { id: string; author: string; text: string; createdAt: string }[];
}

export interface TriageMetrics {
  totalLeads: number;
  unresolvedP0: number;
  totalPipelineValue: string;
  avgTriageTime: string;
  slaComplianceRate: number;
}
