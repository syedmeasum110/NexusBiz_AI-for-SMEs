"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  X,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Loader2,
  Play,
  RotateCcw,
  Check,
  Send,
  Building,
} from "lucide-react";
import {
  launchDemoScenario,
  decideWorkflowAction,
  type WorkflowExecution,
  type WorkflowAction,
} from "@/lib/api";
import { formatPKR } from "@/lib/format";

interface DemoScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWorkflowUpdated?: () => void;
}

export default function DemoScenarioModal({
  isOpen,
  onClose,
  onWorkflowUpdated,
}: DemoScenarioModalProps) {
  const [running, setRunning] = useState(false);
  const [workflow, setWorkflow] = useState<WorkflowExecution | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const startDemo = async () => {
    try {
      setRunning(true);
      setActiveStepIndex(0);
      const res = await launchDemoScenario();
      setWorkflow(res.workflow);

      // Animate steps progression
      for (let i = 0; i < (res.workflow.steps?.length || 6); i++) {
        await new Promise((r) => setTimeout(r, 600));
        setActiveStepIndex(i + 1);
      }
    } catch (err) {
      console.error("Failed to launch demo:", err);
    } finally {
      setRunning(false);
      onWorkflowUpdated?.();
    }
  };

  const handleAction = async (actionId: number, decision: "approve" | "reject") => {
    try {
      setActionLoading(actionId);
      const updated = await decideWorkflowAction(actionId, decision, "Confirmed by Business Owner");
      if (workflow) {
        setWorkflow({
          ...workflow,
          actions: workflow.actions.map((a) => (a.id === actionId ? updated : a)),
        });
      }
      onWorkflowUpdated?.();
    } catch (err) {
      console.error("Action error:", err);
    } finally {
      setActionLoading(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-[#0e1522] text-white border border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.15)] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-emerald-950/40 via-slate-900 to-emerald-950/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Sparkles size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">
                  Autonomous Multi-Agent Workflow Runner
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Live Demonstration
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Target Business: <span className="text-emerald-300 font-semibold">Ali Garments</span> (Hyderabad, Pakistan) · Currency: <span className="text-white font-semibold">PKR</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Scenario Overview */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Trigger Condition
              </span>
              <button
                onClick={startDemo}
                disabled={running}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md disabled:opacity-50"
              >
                {running ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    Executing Agents...
                  </>
                ) : (
                  <>
                    <Play size={13} />
                    Run 10-Step Workflow
                  </>
                )}
              </button>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              Sales in Hyderabad dipped 8.3% MoM. Inventory Agent flags that top-seller{" "}
              <strong className="text-white">Embroidered Kurti White (AG-KT-001)</strong> is down to{" "}
              <span className="text-rose-400 font-bold">5 units</span>, threatening Rs 25,000/day in lost turnover.
            </p>
          </div>

          {/* 10-Step Workflow Progression */}
          {workflow ? (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Autonomous Agentic Coordination
              </h3>
              <div className="space-y-3">
                {workflow.steps.map((step, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-3.5 rounded-xl bg-white/[0.04] border border-white/5 flex items-start gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 text-xs font-bold border border-emerald-500/40">
                      {step.step_number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-400">{step.agent_name}</span>
                        <span className="text-[10px] text-slate-500">{step.timestamp}</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-200 mt-0.5">{step.action}</p>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{step.finding}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Human Approval Gate */}
              <div className="mt-6 p-5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <ShieldAlert size={16} className="text-amber-400" />
                      Human-in-the-Loop Approval Gate
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      The CEO Agent has formulated actions involving capital allocation. Review and approve simulated execution.
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    Awaiting Decision
                  </span>
                </div>

                <div className="space-y-3">
                  {workflow.actions.map((act) => (
                    <div
                      key={act.id}
                      className="p-4 rounded-xl bg-slate-900/80 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                              act.priority === "urgent"
                                ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            }`}
                          >
                            {act.priority}
                          </span>
                          <span className="text-xs text-emerald-400 font-semibold">{act.agent_name}</span>
                          {act.financial_impact > 0 && (
                            <span className="text-xs font-bold text-white bg-white/10 px-2 py-0.5 rounded">
                              {formatPKR(act.financial_impact)}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-slate-100 mt-1">{act.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{act.description}</p>
                        {act.execution_result && (
                          <p className="text-xs text-emerald-400/90 mt-2 bg-emerald-500/10 p-2 rounded border border-emerald-500/20">
                            <strong>Execution Result:</strong> {act.execution_result}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {act.status === "pending_approval" ? (
                          <>
                            <button
                              onClick={() => handleAction(act.id, "approve")}
                              disabled={actionLoading === act.id}
                              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-slate-950 transition-all flex items-center gap-1.5 shadow-md disabled:opacity-50"
                            >
                              {actionLoading === act.id ? (
                                <Loader2 size={13} className="animate-spin" />
                              ) : (
                                <Check size={14} />
                              )}
                              Approve & Execute
                            </button>
                            <button
                              onClick={() => handleAction(act.id, "reject")}
                              disabled={actionLoading === act.id}
                              className="px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
                            >
                              Dismiss
                            </button>
                          </>
                        ) : (
                          <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle2 size={14} />
                            {act.status === "executed" ? "Executed in Database" : "Rejected"}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
                <Play size={20} className="ml-1" />
              </div>
              <h3 className="text-sm font-bold text-white">Demonstration Ready</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Click &quot;Run 10-Step Workflow&quot; to witness the 6 AI agents communicate, evaluate budget,
                forecast demand, resolve delivery issues, and present actions for your approval.
              </p>
              <button
                onClick={startDemo}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all"
              >
                Launch Demonstration Scenario
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between bg-black/30">
          <span className="text-xs text-slate-400">
            NexusBiz AI · Fully autonomous multi-agent orchestration
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
