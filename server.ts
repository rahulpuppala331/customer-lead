import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));

const PORT = parseInt(process.env.PORT || '3000', 10);

// Initialize Gemini SDK with User-Agent header as required
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper for AI Lead Analysis
interface LeadAnalysisRequest {
  id?: string;
  channel: 'website' | 'event' | 'referral' | 'email';
  name: string;
  email: string;
  company: string;
  role: string;
  phone?: string;
  message: string;
  sourceDetails?: string;
  companySize?: string;
}

// Fallback intelligent heuristic generator if API fails or key is missing
function generateHeuristicAnalysis(lead: LeadAnalysisRequest) {
  const text = `${lead.name} ${lead.role} ${lead.company} ${lead.message} ${lead.sourceDetails || ''}`.toLowerCase();
  
  const isEnterpriseRole = /vp|director|head|chief|cxo|cto|cfo|cio|ceo|founder|president|svp/.test(text);
  const isHighUrgency = /urgent|asap|next week|end of month|q[1-4]|evaluating|migrat|replace|budget approved|deadline/.test(text);
  const hasCompetitor = /datadog|salesforce|hubspot|splunk|snowflake|competitor|alternative|switching/.test(text);
  const hasEnterpriseScale = /500|1000|5000|enterprise|global|team of|seats|multi-region|soc2|hipaa/.test(text);

  let fitScore = isEnterpriseRole ? 26 : 18;
  if (hasEnterpriseScale) fitScore += 4;
  
  let intentScore = isHighUrgency ? 28 : 20;
  if (lead.message.length > 120) intentScore += 2;

  let authorityScore = isEnterpriseRole ? 24 : 14;
  let urgencyScore = isHighUrgency ? 15 : 9;

  const totalScore = Math.min(98, Math.max(35, fitScore + intentScore + authorityScore + urgencyScore));

  let priorityTier: 'P0-Critical' | 'P1-High' | 'P2-Medium' | 'P3-Low' = 'P2-Medium';
  let slaMinutes = 120; // 2 hours
  if (totalScore >= 85 || (isEnterpriseRole && isHighUrgency)) {
    priorityTier = 'P0-Critical';
    slaMinutes = 15; // 15 mins
  } else if (totalScore >= 70) {
    priorityTier = 'P1-High';
    slaMinutes = 60; // 1 hour
  } else if (totalScore < 50) {
    priorityTier = 'P3-Low';
    slaMinutes = 1440; // 24 hours
  }

  const dealRange = totalScore > 80 ? '$65,000 - $120,000 ARR' : totalScore > 65 ? '$30,000 - $60,000 ARR' : '$12,000 - $25,000 ARR';

  return {
    score: totalScore,
    scoreBreakdown: {
      icpFit: fitScore,
      intentDepth: intentScore,
      decisionAuthority: authorityScore,
      opportunityUrgency: urgencyScore,
    },
    priorityTier,
    slaMinutes,
    estimatedDealArr: dealRange,
    buyingStage: isHighUrgency ? 'Active Vendor Selection' : 'Problem Exploration & Evaluation',
    intentSummary: `Prospect from ${lead.company} is seeking solutions to scale workflows and eliminate manual bottlenecks. ${isHighUrgency ? 'Demonstrates high timeline pressure.' : 'Gathering information for upcoming initiatives.'}`,
    painPoints: [
      'Manual, inefficient legacy workflow slowing down operations',
      'Need for automated data synchronization and team visibility',
      'Lack of real-time alerting for critical stakeholder handoffs',
    ],
    risksAndRedFlags: hasCompetitor 
      ? ['Actively benchmarking competitors; pricing pressure likely', 'Requires fast proof-of-concept to lock in deal']
      : ['Confirm budget sign-off timeline before scheduling technical deep-dive', 'Verify procurement cycle constraints'],
    competitorMentions: hasCompetitor ? ['Competitor evaluation in progress'] : [],
    bantAudit: {
      budget: totalScore > 75 ? 'Identified / Enterprise Ready' : 'Under Assessment',
      authority: isEnterpriseRole ? 'Direct Economic Buyer / Decision Maker' : 'Technical Evaluator / Internal Champion',
      need: 'High strategic priority to replace legacy bottlenecks',
      timeline: isHighUrgency ? '< 30-45 Days (Active Q-cycle)' : 'Next 3-6 Months',
    },
    executiveBrief: `${lead.name} (${lead.role} at ${lead.company}) reached out via ${lead.channel}. Clear enterprise requirements with high alignment to our core platform. Needs immediate initial contact to secure discovery before competitors intervene.`,
    recommendedNextAction: totalScore >= 80 
      ? 'Assign to Strategic Enterprise AE and book VIP 30-min discovery call with Solutions Architect'
      : 'Send customized demo booking link with enterprise case study and security brief',
    suggestedAssignedRole: totalScore >= 80 ? 'Strategic Enterprise AE' : 'Mid-Market Account Executive',
    suggestedQuestions: [
      `What is your target go-live date at ${lead.company}?`,
      `Who else from your engineering and security teams will be part of the evaluation?`,
      `What specific metrics will your leadership use to determine project success?`,
    ],
    generatedEmailDraft: {
      subject: `Accelerating ${lead.company}'s initiatives - next steps`,
      body: `Hi ${lead.name.split(' ')[0]},\n\nThank you for reaching out via our ${lead.channel}. I noticed your focus on solving key workflow bottlenecks at ${lead.company}.\n\nGiven your role as ${lead.role}, we'd love to share how similar teams scaled their operational velocity while cutting manual triage time by 75%.\n\nDo you have 15 minutes this Thursday or Friday for a focused conversation?\n\nBest regards,\nB2B Sales Acceleration Team`,
    },
  };
}

// API: Analyze Lead with Gemini
app.post('/api/leads/analyze', async (req: Request, res: Response) => {
  try {
    const lead: LeadAnalysisRequest = req.body;

    if (!lead || !lead.name || !lead.company) {
      return res.status(400).json({ error: 'Missing required lead details (name, company)' });
    }

    if (!apiKey) {
      const result = generateHeuristicAnalysis(lead);
      return res.json({ ...result, isAiGenerated: false, notice: 'Analyzed via LeadPulse Intelligence Engine' });
    }

    const prompt = `You are the Chief Revenue Operations & Lead Intelligence AI for a high-growth B2B enterprise SaaS platform.
Analyze this newly received inbound B2B lead and extract deep qualification intelligence, intent, scoring, risk factors, and recommended sales rep actions.

LEAD INTAKE DATA:
- Channel: ${lead.channel} (e.g., website demo request, event badge scan, referral intro, direct email)
- Contact Name: ${lead.name}
- Title / Role: ${lead.role}
- Company: ${lead.company}
- Email: ${lead.email}
- Phone: ${lead.phone || 'N/A'}
- Stated Company Size: ${lead.companySize || 'Unknown'}
- Channel Context / Referral / Event Notes: ${lead.sourceDetails || 'Direct intake'}
- Inbound Message / Raw Text:
"""
${lead.message}
"""

Evaluate this prospect strictly for a B2B SaaS deal. High value enterprise prospects often have senior executive titles (VP, Director, CXO), corporate emails, urgent timelines, explicit problem descriptions, team scale requirements, or are evaluating competitors.
Low value or nurture leads are student/personal emails, vague questions, or non-commercial inquiries.

Return valid JSON adhering to the following structure:
{
  "score": <integer from 0 to 100>,
  "scoreBreakdown": {
    "icpFit": <integer 0-30>,
    "intentDepth": <integer 0-30>,
    "decisionAuthority": <integer 0-25>,
    "opportunityUrgency": <integer 0-15>
  },
  "priorityTier": <"P0-Critical" | "P1-High" | "P2-Medium" | "P3-Low">,
  "slaMinutes": <integer: 15 for P0, 60 for P1, 240 for P2, 1440 for P3>,
  "estimatedDealArr": <string, e.g. "$75,000 - $140,000 ARR">,
  "buyingStage": <string, e.g. "Active Vendor Evaluation", "Urgent Replacement", "Exploratory Budgeting">,
  "intentSummary": <string, 2 sentences clearly explaining what the prospect specifically wants and why they reached out now>,
  "painPoints": [<string>, <string>, <string>],
  "risksAndRedFlags": [<string>, <string>],
  "competitorMentions": [<string>],
  "bantAudit": {
    "budget": <string, e.g. "Likely Approved Enterprise" or "Needs Scoping">,
    "authority": <string, e.g. "Direct Decision Maker (VP)" or "Technical Champion">,
    "need": <string, 1 sentence summary of critical need>,
    "timeline": <string, e.g. "< 30 Days (Urgent Q4)" or "3-6 Months">
  },
  "executiveBrief": <string, exactly 2-3 sentences for an Account Executive to read in 15 seconds before calling the prospect>,
  "recommendedNextAction": <string, specific next tactical sales step>,
  "suggestedAssignedRole": <string, e.g. "Strategic Enterprise AE" | "Mid-Market Account Executive" | "Inbound SDR Specialist">,
  "suggestedQuestions": [<string>, <string>, <string>],
  "generatedEmailDraft": {
    "subject": <string, compelling personalized email subject line>,
    "body": <string, personalized, high-converting outreach email addressing their exact problem and proposing specific times>
  }
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text?.trim() || '';
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = generateHeuristicAnalysis(lead);
    }

    return res.json({ ...parsed, isAiGenerated: true });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Error analyzing lead with Gemini:', error.message);
    const fallback = generateHeuristicAnalysis(req.body);
    return res.json({ ...fallback, isAiGenerated: false, errorFallback: true });
  }
});

// API: AI Sales Copilot - Ask tactical questions or generate battlecards / objection handling
app.post('/api/leads/copilot', async (req: Request, res: Response) => {
  try {
    const { lead, userQuery } = req.body;
    if (!lead || !userQuery) {
      return res.status(400).json({ error: 'Missing lead or userQuery' });
    }

    if (!apiKey) {
      return res.json({
        answer: `Strategic Assessment for ${lead.company}: For this ${lead.role}, emphasize ROI, enterprise security compliance (SOC2/SSO), and rapid deployment. Anticipate objections around migration friction and existing tool contracts. Recommend scheduling a 20-minute architecture review.`,
        isAiGenerated: false,
      });
    }

    const prompt = `You are an elite B2B Enterprise Sales Director and Deal Coach advising an Account Executive.
LEAD DETAILS:
- Prospect: ${lead.name} (${lead.role})
- Company: ${lead.company}
- Channel: ${lead.channel}
- Stated Needs: ${lead.message}
- AI Summary: ${lead.intentSummary || 'N/A'}
- Priority: ${lead.priorityTier || 'High'}

SALES REP QUESTION:
"${userQuery}"

Provide a tactical, actionable, expert sales coaching response. Include specific talk-tracks, objection handling tips, or battlecard points tailored specifically to this prospect and company. Keep it concise, punchy, and formatted with bullet points where appropriate.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return res.json({
      answer: response.text || 'Unable to generate copilot guidance.',
      isAiGenerated: true,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Error in sales copilot:', error.message);
    return res.status(500).json({ error: error.message || 'Failed to generate copilot advice' });
  }
});

// API: Custom Email Drafter with tone options
app.post('/api/leads/draft-email', async (req: Request, res: Response) => {
  try {
    const { lead, tone = 'executive-consultative', customInstruction = '' } = req.body;
    if (!lead) {
      return res.status(400).json({ error: 'Missing lead' });
    }

    if (!apiKey) {
      return res.json({
        subject: `Follow-up: Next steps for ${lead.company} & ${lead.name.split(' ')[0]}`,
        body: `Hi ${lead.name.split(' ')[0]},\n\nI reviewed your inquiry regarding ${lead.company}'s requirements. Given your timeline and priority, I would love to connect for 15 minutes this week.\n\nLet me know if tomorrow at 2:00 PM EST works for a quick discovery.\n\nBest regards,\nAccount Executive Team`,
        isAiGenerated: false,
      });
    }

    const prompt = `You are drafting a B2B sales email from an Account Executive to a prospective enterprise buyer.
PROSPECT:
- Name: ${lead.name}
- Title: ${lead.role}
- Company: ${lead.company}
- Channel: ${lead.channel}
- Inquiry: ${lead.message}
- Tone required: ${tone} (e.g. "executive-consultative", "high-urgency-accelerator", "technical-deepdive", "gentle-nurture")
- Extra Instructions: ${customInstruction || 'None'}

Generate a compelling, personalized B2B outreach email. It must not sound generic or automated. Refer specifically to their company and stated needs.
Return valid JSON:
{
  "subject": "<Subject line>",
  "body": "<Email body with newlines>"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Error drafting email:', error.message);
    return res.status(500).json({ error: 'Failed to draft email' });
  }
});

// Production static file serving vs Development Vite middleware
async function setupServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LeadPulse Server running on http://0.0.0.0:${PORT}`);
  });
}

setupServer();
