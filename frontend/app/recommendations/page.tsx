"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { getCEOAnalysis, type CEOAnalysisResponse } from "@/lib/api";
import Link from "next/link";
import { Lightbulb, Sparkles, ArrowRight, ShieldCheck, CheckCircle2, Clock } from "lucide-react";
import { formatPKR } from "@/lib/format";

const PRIORITY_BADGES: Record<string, string> = {
  urgent: "bg-rose-500/20 text-rose-400 border border-rose-500/30",
  high: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
  medium: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  low: "bg-slate-500/20 text-slate-300 border border-slate-500/30",
};

export default function RecommendationsPage() {
  const [analysis, setAnalysis] = useState<CEOAnalysisResponse | null>(null);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCEOAnalysis("Recommend prioritized actions for Ali Garments")
      .then(setAnalysis)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Sidebar>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      </Sidebar>
    );
  }

  const actions = analysis?.answer.recommended_actions || [];
  const filtered = actions.filter((a) => {
    if (filter === "all") return true;
    return a.priority === filter || a.domain === filter;
  });

  return (
    <Sidebar>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Lightbulb className="text-amber-400" size={24} />
              AI Recommendations & Action Plan
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Evidence-based, prioritized action plan synthesized by CEO Agent from cross-workforce findings.
            </p>
          </div>
          <Link
            href="/command-center"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-md"
          >
            <Sparkles size={13} />
            <span>Open Command Center</span>
          </Link>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {["all", "urgent", "high", "medium", "low", "inventory", "marketing", "finance", "support"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                filter === f
                  ? "bg-emerald-500 text-slate-950 font-bold"
                  : "bg-white/5 text-slate-400 hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Action Cards */}
        <div className="space-y-4">
          {filtered.map((action, idx) => (
            <div
              key={action.id || idx}
              className="app-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 hover:border-emerald-500/30 transition-all"
            >
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className={`px-2.5 py-0.5 rounded text-[10px] uppercase font-bold ${PRIORITY_BADGES[action.priority]}`}>
                    {action.priority}
                  </span>
                  <span className="text-xs font-bold text-emerald-400">{action.assigned_agent}</span>
                  <span className="text-[10px] text-slate-500 uppercase bg-white/5 px-2 py-0.5 rounded">
                    {action.domain}
                  </span>
                  {action.financial_commitment > 0 && (
                    <span className="text-xs font-semibold text-slate-200 bg-white/10 px-2 py-0.5 rounded">
                      Capital: {formatPKR(action.financial_commitment)}
                    </span>
                  )}
                  {action.requires_approval && (
                    <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      Requires Approval
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-white">{action.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{action.description}</p>

                <div className="pt-1 flex items-center gap-2 text-xs">
                  <span className="text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded">
                    Expected Outcome: {action.expected_impact}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Link
                  href="/command-center"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1.5"
                >
                  <span>Review in Workflow</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Sidebar>
  );
}
