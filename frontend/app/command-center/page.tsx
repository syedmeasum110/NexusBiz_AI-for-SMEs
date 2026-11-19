"use client";

import React, { useEffect, useRef, useState } from "react";
import Sidebar from "@/components/Sidebar";
import {
  streamCEOOrchestration,
  decideWorkflowAction,
  getLatestWorkflow,
  type CEOAnalysisResponse,
  type WorkflowExecution,
  type OrchestrationSSEEvent,
  type AgentStatus,
  type AgentId,
} from "@/lib/api";
import { formatPKR } from "@/lib/format";
import {
  Crown,
  Sparkles,
  Send,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lightbulb,
  Search,
  ShieldCheck,
  Loader2,
  Calculator,
  Package,
  Megaphone,
  Headphones,
  BarChart3,
  Check,
  ArrowRight,
  ShieldAlert,
  Clock,
  Activity,
  Layers,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SAMPLE_QUESTIONS = [
  "Why is my business profit decreasing and what should I do?",
  "Analyze my business performance and tell me how to increase profit.",
  "Why are delivery complaints spiking in Hyderabad?",
  "Check stock levels and inventory costs for Kurti",
  "Which marketing campaigns should I pause or scale?",
  "Business ki current situation analyze karo",
];

const AGENT_META: Record<
  AgentId,
  {
    name: string;
    role: string;
    icon: React.ElementType;
    themeColor: string;
    glowClass: string;
    bgAccent: string;
    borderAccent: string;
    textAccent: string;
  }
> = {
  ceo: {
    name: "CEO Agent",
    role: "Orchestrator & Executive Decisions",
    icon: Crown,
    themeColor: "purple",
    glowClass: "glow-agent-ceo",
    bgAccent: "bg-purple-500/10",
    borderAccent: "border-purple-500/40",
    textAccent: "text-purple-400",
  },
  finance: {
    name: "Finance Agent",
    role: "Revenue, Margins & Cost Burn",
    icon: Calculator,
    themeColor: "emerald",
    glowClass: "glow-agent-finance",
    bgAccent: "bg-emerald-500/10",
    borderAccent: "border-emerald-500/40",
    textAccent: "text-emerald-400",
  },
  inventory: {
    name: "Inventory Agent",
    role: "Stock Levels & Inventory Risk",
    icon: Package,
    themeColor: "blue",
    glowClass: "glow-agent-inventory",
    bgAccent: "bg-blue-500/10",
    borderAccent: "border-blue-500/40",
    textAccent: "text-blue-400",
  },
  marketing: {
    name: "Marketing Agent",
    role: "Campaign ROAS & Growth Opportunities",
    icon: Megaphone,
    themeColor: "amber",
    glowClass: "glow-agent-marketing",
    bgAccent: "bg-amber-500/10",
    borderAccent: "border-amber-500/40",
    textAccent: "text-amber-400",
  },
  support: {
    name: "Customer Support Agent",
    role: "Customer Feedback & Courier SLA",
    icon: Headphones,
    themeColor: "rose",
    glowClass: "glow-agent-support",
    bgAccent: "bg-rose-500/10",
    borderAccent: "border-rose-500/40",
    textAccent: "text-rose-400",
  },
  bi: {
    name: "Business Intelligence Agent",
    role: "Cross-Domain Telemetry & Health Score",
    icon: BarChart3,
    themeColor: "violet",
    glowClass: "glow-agent-bi",
    bgAccent: "bg-violet-500/10",
    borderAccent: "border-violet-500/40",
    textAccent: "text-violet-400",
  },
};

const PRIORITY_BADGES: Record<string, string> = {
  urgent: "bg-rose-500/20 text-rose-400 border border-rose-500/30",
  high: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
  medium: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  low: "bg-slate-500/20 text-slate-300 border border-slate-500/30",
};

const RISK_BADGES: Record<string, string> = {
  low: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  moderate: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  high: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  critical: "text-rose-400 bg-rose-500/10 border-rose-500/20",
};

interface AgentCardState {
  id: AgentId;
  status: AgentStatus;
  task: string;
  preview?: string;
  result?: any;
  error?: string;
  selected?: boolean;
}

interface TimelineItem {
  id: string;
  timestamp: string;
  agentId: AgentId;
  title: string;
  detail: string;
  status: AgentStatus;
}

type StageType =
  | "standby"
  | "routing"
  | "specialists"
  | "bi"
  | "synthesis"
  | "completed"
  | "failed";

export default function CommandCenterPage() {
  const [question, setQuestion] = useState(
    "Why is my business profit decreasing and what should I do?"
  );
  const [activeQuestion, setActiveQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState<StageType>("standby");
  const [stageMessage, setStageMessage] = useState(
    "AI Workforce standing by. Submit any question to initiate autonomous orchestration."
  );
  const [progress, setProgress] = useState(0);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [showTimeline, setShowTimeline] = useState(true);
  const [analysis, setAnalysis] = useState<CEOAnalysisResponse | null>(null);
  const [activeWorkflow, setActiveWorkflow] = useState<WorkflowExecution | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const abortStreamRef = useRef<(() => void) | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const [agentStates, setAgentStates] = useState<Record<AgentId, AgentCardState>>({
    ceo: { id: "ceo", status: "idle", task: "Standing by for business query" },
    finance: { id: "finance", status: "idle", task: "Standing by · Ready for financial audit" },
    inventory: { id: "inventory", status: "idle", task: "Standing by · Ready for stock & SKU audit" },
    marketing: { id: "marketing", status: "idle", task: "Standing by · Ready for campaign evaluation" },
    support: { id: "support", status: "idle", task: "Standing by · Ready for ticket & delivery audit" },
    bi: { id: "bi", status: "idle", task: "Standing by · Ready for cross-domain synthesis" },
  });

  // Load latest background workflow on mount
  useEffect(() => {
    getLatestWorkflow()
      .then(setActiveWorkflow)
      .catch(() => {});
  }, []);

  const addTimelineEvent = (
    agentId: AgentId,
    title: string,
    detail: string,
    status: AgentStatus
  ) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setTimeline((prev) => [
      {
        id: `tl-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: timeStr,
        agentId,
        title,
        detail,
        status,
      },
      ...prev,
    ]);
  };

  const resetAgentStates = () => {
    setAgentStates({
      ceo: { id: "ceo", status: "idle", task: "Standing by for business query" },
      finance: { id: "finance", status: "idle", task: "Standing by · Ready for financial audit" },
      inventory: { id: "inventory", status: "idle", task: "Standing by · Ready for stock & SKU audit" },
      marketing: { id: "marketing", status: "idle", task: "Standing by · Ready for campaign evaluation" },
      support: { id: "support", status: "idle", task: "Standing by · Ready for ticket & delivery audit" },
      bi: { id: "bi", status: "idle", task: "Standing by · Ready for cross-domain synthesis" },
    });
  };

  const runOrchestration = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed || loading) return;

    if (abortStreamRef.current) {
      abortStreamRef.current();
    }

    setLoading(true);
    setActiveQuestion(trimmed);
    setAnalysis(null);
    setErrorMessage(null);
    setTimeline([]);
    setProgress(5);
    setStage("routing");
    setStageMessage("CEO Agent received query. Initializing autonomous multi-agent orchestration...");
    resetAgentStates();

    // Start streaming SSE events from the backend
    const abort = streamCEOOrchestration(
      trimmed,
      (event: OrchestrationSSEEvent) => {
        handleServerEvent(event);
      },
      (err: Error) => {
        console.error("Orchestration Stream Error:", err);
        setLoading(false);
        setStage("failed");
        setErrorMessage(err.message || "Connection to multi-agent backend interrupted.");
        setStageMessage("Orchestration interrupted. You can retry with the button below.");
        addTimelineEvent("ceo", "Stream Disrupted", err.message, "failed");
      },
      () => {
        setLoading(false);
      }
    );

    abortStreamRef.current = abort;
  };

  const handleServerEvent = (event: OrchestrationSSEEvent) => {
    const { data } = event;

    switch (event.event) {
      case "workflow_started": {
        setStage("routing");
        setProgress(10);
        setStageMessage(data.message || "CEO Agent received query. Analyzing requirements...");
        addTimelineEvent("ceo", "Workflow Started", data.message || "Starting orchestration", "analyzing");
        break;
      }

      case "agent_started": {
        const agId = data.agent_id;
        if (!agId) return;

        setAgentStates((prev) => ({
          ...prev,
          [agId]: {
            ...prev[agId],
            status: data.status || "working",
            task: data.task || data.message || "Executing assigned business scope...",
            selected: true,
          },
        }));

        if (agId === "ceo") {
          setStage("routing");
          setProgress(15);
          setStageMessage(data.message || "CEO Agent is analyzing your request...");
        } else if (agId === "bi") {
          setStage("bi");
          setProgress(75);
          setStageMessage(data.message || "Business Intelligence Agent is combining findings...");
        } else {
          setStage("specialists");
          setProgress((prev) => Math.min(68, Math.max(prev + 12, 30)));
          setStageMessage(data.message || `${AGENT_META[agId].name} activated.`);
        }

        addTimelineEvent(
          agId,
          `${AGENT_META[agId].name} Activated`,
          data.message || data.task || "Agent task initiated",
          data.status || "working"
        );
        break;
      }

      case "agent_selected": {
        const selected = data.selected_agents || [];
        const unselected = data.unselected_agents || [];

        setAgentStates((prev) => {
          const next = { ...prev };
          for (const ag of Object.keys(next) as AgentId[]) {
            if (selected.includes(ag)) {
              next[ag] = { ...next[ag], selected: true };
            } else if (unselected.includes(ag)) {
              next[ag] = {
                ...next[ag],
                status: "idle",
                selected: false,
                task: "Idle · Not relevant to this query scope",
              };
            }
          }
          return next;
        });

        const selectedNames = selected
          .filter((id) => id !== "ceo" && id !== "bi")
          .map((id) => AGENT_META[id as AgentId]?.name || id)
          .join(", ");

        setStageMessage(`CEO Agent delegated tasks to: ${selectedNames || "Specialized Agents"}`);
        addTimelineEvent(
          "ceo",
          "Delegation Complete",
          `Consulting specialized agents: ${selectedNames}. Unrelated agents kept idle.`,
          "analyzing"
        );
        break;
      }

      case "agent_completed": {
        const agId = data.agent_id;
        if (!agId) return;

        setAgentStates((prev) => ({
          ...prev,
          [agId]: {
            ...prev[agId],
            status: "completed",
            task: data.task || "Task analysis complete",
            preview: data.preview,
            result: data.result,
          },
        }));

        addTimelineEvent(
          agId,
          `${AGENT_META[agId].name} Completed Task`,
          data.preview || data.message || "Findings verified and recorded",
          "completed"
        );
        break;
      }

      case "agent_result_received": {
        const agId = data.agent_id;
        const targetId = data.to_agent || (agId === "bi" ? "ceo" : "bi");
        if (!agId) return;

        addTimelineEvent(
          agId,
          "Result Transferred",
          data.message || `Findings delivered to ${AGENT_META[targetId as AgentId]?.name || "Coordinator"}`,
          "completed"
        );
        break;
      }

      case "agent_failed": {
        const agId = data.agent_id;
        if (!agId) return;

        setAgentStates((prev) => ({
          ...prev,
          [agId]: {
            ...prev[agId],
            status: "failed",
            error: data.error || data.message || "Agent execution failed",
          },
        }));

        addTimelineEvent(
          agId,
          `${AGENT_META[agId].name} Failed`,
          data.error || data.message || "Unexpected failure during execution",
          "failed"
        );
        break;
      }

      case "synthesis_started": {
        setStage("synthesis");
        setProgress(88);
        setStageMessage(
          data.message || "All agent reports received. Preparing your consolidated business analysis..."
        );
        setAgentStates((prev) => ({
          ...prev,
          ceo: {
            ...prev.ceo,
            status: "analyzing",
            task: data.task || "Synthesizing root causes and executive action plan",
          },
        }));

        addTimelineEvent(
          "ceo",
          "Synthesis Initiated",
          data.message || "Consolidating verified outputs from specialized workforce",
          "analyzing"
        );
        break;
      }

      case "workflow_completed": {
        setStage("completed");
        setProgress(100);
        setLoading(false);
        setStageMessage("Consolidated business analysis and prioritized action plan ready.");

        if (data.response) {
          setAnalysis(data.response);
        }

        addTimelineEvent(
          "ceo",
          "Orchestration Complete",
          "Executive recommendations formulated from real telemetry data",
          "completed"
        );

        // Smooth scroll down to analysis cards
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 300);
        break;
      }
    }
  };

  const handleActionDecision = async (actionId: number, decision: "approve" | "reject") => {
    try {
      setActionLoading(actionId);
      const updated = await decideWorkflowAction(actionId, decision, "Confirmed by Business Owner in Command Center");
      if (activeWorkflow) {
        setActiveWorkflow({
          ...activeWorkflow,
          actions: activeWorkflow.actions.map((a) => (a.id === actionId ? updated : a)),
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  // Cleanup abort on unmount
  useEffect(() => {
    return () => {
      if (abortStreamRef.current) {
        abortStreamRef.current();
      }
    };
  }, []);

  // Compute active specialists vs idle
  const specialistList: AgentId[] = ["finance", "inventory", "marketing", "support"];
  const completedCount = Object.values(agentStates).filter((s) => s.status === "completed").length;
  const activeCount = Object.values(agentStates).filter((s) => s.status === "working" || s.status === "analyzing").length;

  return (
    <Sidebar>
      <div className="space-y-6 max-w-6xl mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
              <Sparkles size={13} className="text-emerald-400 animate-pulse" />
              Autonomous AI Workforce
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <Crown className="text-purple-400" size={26} />
              AI Command Center
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Ask CEO Agent any natural-language business question. Watch the 6 specialized agents activate, collaborate, and formulate an evidence-backed action plan.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/25 flex items-center gap-1.5 shadow-[0_0_12px_rgba(168,85,247,0.2)]">
              <span className={`w-2 h-2 rounded-full ${loading ? "bg-purple-400 animate-ping" : "bg-purple-400"}`} />
              {loading ? "Orchestrating Live" : "Orchestrator Ready"}
            </span>
          </div>
        </div>

        {/* Question Input Box */}
        <div className="app-card p-5 space-y-3.5 border-white/10 shadow-xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (question.trim()) runOrchestration(question);
            }}
            className="flex items-center gap-2.5"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask about sales decline, stockouts, ad ROAS, or logistics issues..."
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition-colors shadow-inner"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="px-6 py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 flex items-center gap-2 transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(16,185,129,0.25)] flex-shrink-0 cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin text-slate-950" />
                  <span>Orchestrating...</span>
                </>
              ) : (
                <>
                  <Send size={15} />
                  <span>Ask CEO</span>
                </>
              )}
            </button>
          </form>

          {/* Suggested Question Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1 scrollbar-none">
            <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap flex items-center gap-1">
              <Sparkles size={11} className="text-emerald-400" />
              Suggested:
            </span>
            {SAMPLE_QUESTIONS.map((sq, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQuestion(sq);
                  runOrchestration(sq);
                }}
                disabled={loading}
                className="px-3 py-1.5 rounded-lg text-xs bg-white/5 hover:bg-emerald-500/10 hover:border-emerald-500/30 text-slate-300 hover:text-white border border-white/5 whitespace-nowrap transition-all disabled:opacity-50 cursor-pointer"
              >
                {sq}
              </button>
            ))}
          </div>
        </div>

        {/* ── LIVE MULTI-AGENT VISUAL ORCHESTRATION PANEL ──────────────────────── */}
        <div className="app-card p-6 space-y-6 border-white/10 relative overflow-hidden backdrop-blur-xl">
          {/* Panel Header & Live Stage Progress */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Layers size={16} className="text-emerald-400" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                  Real-Time Multi-Agent Orchestration Map
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Visualizing live execution of specialized agents, cross-domain telemetry routing, and executive consolidation.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 font-mono">
                {completedCount}/6 Agents Completed
              </span>
              <button
                onClick={() => setShowTimeline(!showTimeline)}
                className="text-xs px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 flex items-center gap-1 border border-white/10 transition-colors cursor-pointer"
              >
                <Activity size={13} className="text-emerald-400" />
                <span>Live Feed</span>
                {showTimeline ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
            </div>
          </div>

          {/* Active Live Status Banner */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    loading
                      ? "bg-emerald-400 animate-ping"
                      : stage === "completed"
                      ? "bg-emerald-400"
                      : stage === "failed"
                      ? "bg-rose-400"
                      : "bg-slate-500"
                  }`}
                />
                <span className="text-xs font-bold text-white uppercase tracking-wide">
                  {stage === "standby" && "Workforce Standing By"}
                  {stage === "routing" && "Stage 1: CEO Agent Routing"}
                  {stage === "specialists" && "Stage 2: Specialist Agents Executing"}
                  {stage === "bi" && "Stage 3: Business Intelligence Consolidation"}
                  {stage === "synthesis" && "Stage 4: Executive Synthesis"}
                  {stage === "completed" && "Orchestration Complete"}
                  {stage === "failed" && "Orchestration Interrupted"}
                </span>
              </div>

              {activeQuestion && (
                <span className="text-[11px] text-slate-400 font-mono truncate max-w-xs sm:max-w-md">
                  Query: &quot;{activeQuestion}&quot;
                </span>
              )}
            </div>

            <p className="text-xs text-slate-300 font-medium pl-5 leading-relaxed">
              {stageMessage}
            </p>

            {/* Progress Bar */}
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-emerald-500 via-cyan-400 to-purple-500 h-1.5 rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* ── THE SIX AGENTS VISUAL WORKFLOW GRAPH ──────────────────────── */}
          <div className="space-y-6 pt-2">
            {/* LEVEL 1: CEO AGENT (The Orchestrator) */}
            <div className="max-w-md mx-auto">
              <AgentCard
                agentId="ceo"
                state={agentStates.ceo}
                meta={AGENT_META.ceo}
              />
            </div>

            {/* FLOW CONNECTOR 1: CEO → Specialists */}
            <div className="relative w-full flex justify-center h-8">
              <div className={`w-0.5 h-full relative transition-colors ${
                stage === "routing" || stage === "specialists"
                  ? "bg-emerald-500/70"
                  : stage === "completed"
                  ? "bg-emerald-500/40"
                  : "bg-white/10"
              }`}>
                {(stage === "routing" || stage === "specialists") && (
                  <div className="connector-particle-down" />
                )}
              </div>
            </div>

            {/* LEVEL 2: SPECIALIZED OPERATIONAL AGENTS (Finance, Inventory, Marketing, Support) */}
            <div>
              <div className="text-center mb-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
                  Specialized Domain Agents
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {specialistList.map((id) => (
                  <AgentCard
                    key={id}
                    agentId={id}
                    state={agentStates[id]}
                    meta={AGENT_META[id]}
                  />
                ))}
              </div>
            </div>

            {/* FLOW CONNECTOR 2: Specialists → Business Intelligence */}
            <div className="relative w-full flex justify-center h-8">
              <div className={`w-0.5 h-full relative transition-colors ${
                stage === "bi"
                  ? "bg-violet-500/70"
                  : stage === "completed"
                  ? "bg-violet-500/40"
                  : "bg-white/10"
              }`}>
                {stage === "bi" && <div className="connector-particle-down" />}
              </div>
            </div>

            {/* LEVEL 3: BUSINESS INTELLIGENCE AGENT */}
            <div className="max-w-md mx-auto">
              <div className="text-center mb-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
                  Cross-Domain Aggregation &amp; Health Scoring
                </span>
              </div>
              <AgentCard
                agentId="bi"
                state={agentStates.bi}
                meta={AGENT_META.bi}
              />
            </div>

            {/* FLOW CONNECTOR 3: BI → CEO (Result Transfer) */}
            <div className="flex flex-col items-center justify-center pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[11px] font-semibold text-purple-400">
                <Zap size={12} className={stage === "synthesis" ? "animate-pulse" : ""} />
                <span>Result Transfer Pipeline · Specialized Reports Return to CEO</span>
              </div>
              <div className="w-0.5 h-6 relative bg-purple-500/30 my-1">
                {(stage === "synthesis" || stage === "completed") && (
                  <div className="connector-particle-up" />
                )}
              </div>
            </div>
          </div>

          {/* Interrupted / Error Recovery Banner */}
          {stage === "failed" && errorMessage && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-center space-y-2">
              <XCircle size={22} className="text-rose-400 mx-auto" />
              <h4 className="text-xs font-bold text-rose-300">Orchestration Disconnected</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">{errorMessage}</p>
              <button
                onClick={() => runOrchestration(question)}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-rose-500 hover:bg-rose-400 text-slate-950 transition-colors inline-flex items-center gap-1.5 cursor-pointer mt-1"
              >
                <RefreshCw size={13} />
                <span>Retry Multi-Agent Workflow</span>
              </button>
            </div>
          )}

          {/* ── LIVE AGENT EXECUTION TIMELINE FEED (Collapsible) ─────────── */}
          {showTimeline && timeline.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-white/5 pt-4 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Clock size={13} className="text-emerald-400" />
                  Live Agent Execution Timeline
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {timeline.length} event{timeline.length !== 1 ? "s" : ""} logged
                </span>
              </div>

              <div className="max-h-56 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                {timeline.map((item) => {
                  const meta = AGENT_META[item.agentId];
                  const Icon = meta.icon;
                  return (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-lg bg-black/30 border border-white/5 flex items-start gap-2.5 text-xs hover:border-white/10 transition-colors"
                    >
                      <span className="text-[10px] font-mono text-slate-500 mt-0.5 flex-shrink-0">
                        {item.timestamp}
                      </span>
                      <div className={`p-1 rounded ${meta.bgAccent} ${meta.textAccent} flex-shrink-0`}>
                        <Icon size={12} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-[11px]">{item.title}</span>
                          <StatusPill status={item.status} compact />
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug break-words">
                          {item.detail}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>

        {/* ── CEO AGENT'S FINAL COMPREHENSIVE ANSWER ──────────────────────── */}
        <div ref={resultsRef}>
          {analysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Executive Decision Header */}
              <div className="app-card border-emerald-500/40 p-6 bg-gradient-to-r from-purple-950/20 via-slate-900 to-emerald-950/20 space-y-4 shadow-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      <Crown size={20} />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-white">CEO Consolidated Synthesis</h2>
                      <span className="text-[11px] text-purple-300 font-medium">
                        Evidence-Backed Business Assessment for Ali Garments (Hyderabad)
                      </span>
                    </div>
                  </div>

                  {analysis.answer.health_score && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-400">Health Score:</span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${RISK_BADGES[analysis.answer.health_score.risk_level] || "text-emerald-400"}`}>
                        <ShieldCheck size={13} className="inline mr-1 -mt-0.5" />
                        {analysis.answer.health_score.score}/100 ({analysis.answer.health_score.risk_level} risk)
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line pt-1">
                  {analysis.answer.executive_summary}
                </p>

                {/* Consulted vs Idle Agent Badges */}
                <div className="pt-2 border-t border-white/5 flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-semibold text-slate-400">Workforce Status:</span>
                  {analysis.answer.routing.map((r) => (
                    <span
                      key={r.domain}
                      className={`text-[10px] px-2.5 py-1 rounded-full border flex items-center gap-1 font-semibold ${
                        r.consulted
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          : "bg-white/5 border-white/10 text-slate-500"
                      }`}
                      title={r.reason}
                    >
                      {r.consulted ? <CheckCircle2 size={11} /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />}
                      {r.domain}: {r.consulted ? "Consulted" : "Idle"}
                    </span>
                  ))}
                  <span className="text-[10px] px-2.5 py-1 rounded-full border bg-violet-500/10 border-violet-500/30 text-violet-400 flex items-center gap-1 font-semibold">
                    <CheckCircle2 size={11} />
                    BI Agent: Consolidated
                  </span>
                </div>
              </div>

              {/* Key Findings from Specialized Agents */}
              {analysis.answer.key_findings.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Search className="text-blue-400" size={15} />
                    Specialized Agent Verified Telemetry
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {analysis.answer.key_findings.map((kf, i) => (
                      <div
                        key={i}
                        className="app-card p-4 flex items-start gap-3 border-white/5 hover:border-white/10 transition-colors"
                      >
                        <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                          kf.severity === "negative" ? "bg-rose-500" : kf.severity === "positive" ? "bg-emerald-500" : "bg-amber-500"
                        }`} />
                        <div className="min-w-0">
                          <span className="text-[11px] font-bold text-white block mb-0.5">
                            {kf.agent_name}
                          </span>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {kf.statement}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Evidence-Backed Root Causes */}
              {analysis.answer.root_causes.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <AlertTriangle className="text-rose-400" size={15} />
                    Identified Causal Factors (Evidence-Backed)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysis.answer.root_causes.map((rc) => (
                      <div key={rc.id} className="app-card p-5 space-y-2.5 border-white/5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-rose-400">{rc.agent_name}</span>
                          <span className="text-[10px] text-slate-400 uppercase bg-white/5 px-2 py-0.5 rounded font-mono">
                            {rc.domain}
                          </span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-white">{rc.title}</h4>
                        <p className="text-xs text-slate-300 leading-relaxed">{rc.explanation}</p>
                        <div className="pt-2 text-[11px] text-slate-400 border-t border-white/5 font-mono">
                          <strong className="text-slate-300">Evidence:</strong> {rc.evidence}
                        </div>
                        {rc.financial_impact && (
                          <div className="text-[11px] text-rose-400 font-semibold">
                            Impact: {rc.financial_impact}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Prioritized Action Plan & Human Approval Gate */}
              {analysis.answer.recommended_actions.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Lightbulb className="text-amber-400" size={15} />
                    Prioritized Action Plan
                  </h3>
                  <div className="space-y-3">
                    {analysis.answer.recommended_actions.map((act) => (
                      <div
                        key={act.id}
                        className="app-card p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-white/10 hover:border-emerald-500/30 transition-all"
                      >
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${PRIORITY_BADGES[act.priority] || PRIORITY_BADGES.medium}`}>
                              {act.priority}
                            </span>
                            <span className="text-xs font-bold text-emerald-400">{act.assigned_agent}</span>
                            {act.financial_commitment > 0 && (
                              <span className="text-xs font-semibold text-white bg-white/10 px-2 py-0.5 rounded">
                                {formatPKR(act.financial_commitment)}
                              </span>
                            )}
                            {act.requires_approval && (
                              <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-semibold">
                                Human Approval Required
                              </span>
                            )}
                          </div>
                          <h4 className="text-xs sm:text-sm font-bold text-white">{act.title}</h4>
                          <p className="text-xs text-slate-300 leading-relaxed">{act.description}</p>
                          <span className="text-[11px] text-emerald-400 font-medium inline-block">
                            Expected Impact: {act.expected_impact}
                          </span>
                        </div>

                        <div className="flex-shrink-0">
                          <button
                            onClick={() => {
                              const actionId = activeWorkflow?.actions?.[0]?.id || 1;
                              handleActionDecision(actionId, "approve");
                            }}
                            className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                          >
                            <Check size={14} />
                            <span>Approve Action</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Simulated Database Execution State (from activeWorkflow) */}
              {activeWorkflow && activeWorkflow.actions.length > 0 && (
                <div className="app-card p-6 border-emerald-500/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <ShieldAlert size={16} className="text-amber-400" />
                      Live Business Execution State (Database)
                    </h3>
                    <span className="text-xs text-emerald-400 font-mono">Workflow #{activeWorkflow.id}</span>
                  </div>

                  <div className="space-y-3">
                    {activeWorkflow.actions.map((act) => (
                      <div
                        key={act.id}
                        className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="font-bold text-white">{act.title}</div>
                          <div className="text-slate-400 text-[11px] mt-0.5">{act.description}</div>
                          {act.execution_result && (
                            <div className="text-emerald-400 text-[11px] mt-1 font-mono">
                              Result: {act.execution_result}
                            </div>
                          )}
                        </div>

                        <div>
                          {act.status === "executed" ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                              <CheckCircle2 size={12} />
                              Executed in Database
                            </span>
                          ) : (
                            <button
                              onClick={() => handleActionDecision(act.id, "approve")}
                              disabled={actionLoading === act.id}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1 shadow-sm disabled:opacity-50 cursor-pointer"
                            >
                              {actionLoading === act.id ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                              Approve PO
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </Sidebar>
  );
}

// ── Agent Card Component ────────────────────────────────────────────────────

function AgentCard({
  agentId,
  state,
  meta,
}: {
  agentId: AgentId;
  state: AgentCardState;
  meta: (typeof AGENT_META)[AgentId];
}) {
  const Icon = meta.icon;
  const isActive = state.status === "working" || state.status === "analyzing";
  const isCompleted = state.status === "completed";
  const isFailed = state.status === "failed";
  const isIdle = state.status === "idle";

  return (
    <div
      className={`app-card p-4 transition-all duration-300 relative rounded-2xl ${
        isActive
          ? `${meta.borderAccent} ${meta.glowClass} shadow-2xl`
          : isCompleted
          ? "border-emerald-500/40 bg-slate-900/90"
          : isFailed
          ? "border-rose-500/50 bg-rose-950/20"
          : "border-white/5 opacity-75 hover:opacity-100"
      }`}
    >
      {/* Top row: Icon, Name, and Status Badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-9 h-9 rounded-xl ${meta.bgAccent} ${meta.textAccent} border ${meta.borderAccent} flex items-center justify-center flex-shrink-0 relative`}
          >
            <Icon size={17} className={isActive ? "animate-pulse" : ""} />
            {isActive && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-white truncate tracking-tight">{meta.name}</h3>
            <p className="text-[10px] text-slate-400 truncate">{meta.role}</p>
          </div>
        </div>

        <StatusPill status={state.status} />
      </div>

      {/* Task Description */}
      <div className="mt-3 pt-2.5 border-t border-white/5">
        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">
          {isActive ? "Executing Task" : isCompleted ? "Completed Scope" : "Assigned Scope"}
        </span>
        <p className="text-[11px] text-slate-300 leading-snug line-clamp-2">
          {state.task}
        </p>
      </div>

      {/* Result Preview upon Completion */}
      {isCompleted && state.preview && (
        <div className="mt-2.5 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 mb-0.5">
            <CheckCircle2 size={11} />
            <span>Verified Finding</span>
          </div>
          <p className="text-[11px] text-slate-200 leading-snug line-clamp-2">
            {state.preview}
          </p>
        </div>
      )}

      {/* Error display if failed */}
      {isFailed && state.error && (
        <div className="mt-2.5 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-300">
          {state.error}
        </div>
      )}
    </div>
  );
}

// ── Status Pill Badge Component ─────────────────────────────────────────────

function StatusPill({ status, compact = false }: { status: AgentStatus; compact?: boolean }) {
  if (status === "working") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300 flex-shrink-0">
        <Loader2 size={10} className="animate-spin text-amber-400" />
        {!compact && "Working"}
      </span>
    );
  }

  if (status === "analyzing") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 border border-purple-500/30 text-purple-300 flex-shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
        {!compact && "Analyzing"}
      </span>
    );
  }

  if (status === "completed") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex-shrink-0">
        <CheckCircle2 size={10} className="text-emerald-400" />
        {!compact && "Completed"}
      </span>
    );
  }

  if (status === "failed") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 border border-rose-500/30 text-rose-300 flex-shrink-0">
        <XCircle size={10} className="text-rose-400" />
        {!compact && "Failed"}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/5 border border-white/10 text-slate-400 flex-shrink-0">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
      {!compact && "Idle"}
    </span>
  );
}
