"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { getBIAnalysis } from "@/lib/api";
import { BarChart3, ShieldCheck, AlertTriangle, Lightbulb, Zap, TrendingUp, Layers } from "lucide-react";

export default function BIPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBIAnalysis()
      .then(setData)
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

  const hs = data.facts.health_score;

  return (
    <Sidebar>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <BarChart3 className="text-emerald-400" size={24} />
              Business Intelligence & Health Score
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Cross-department pattern synthesis, weighted health matrix & macro systemic risk evaluation.
            </p>
          </div>
          <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            BI Agent Active
          </span>
        </div>

        {/* Health Score Composite Banner */}
        <div className="app-card border-emerald-500/30 p-6 bg-gradient-to-r from-emerald-950/30 via-slate-900 to-slate-900">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                <span className="text-3xl font-extrabold text-emerald-400">{hs.score}</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">Business Health Score</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    {hs.risk_level} Risk
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                  Formula: <span className="font-mono text-emerald-400">{hs.formula}</span>
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                  <span>Weakest Domain: <strong className="text-amber-400 uppercase">{hs.weakest_domain}</strong></span>
                  <span>·</span>
                  <span>Strongest Domain: <strong className="text-emerald-400 uppercase">{hs.strongest_domain}</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Domain Sub-Score Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {hs.domain_scores.map((d: any) => (
            <div key={d.domain} className="app-card p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase">{d.label}</span>
                  <span className="text-[10px] font-semibold text-slate-400 bg-white/5 px-2 py-0.5 rounded">
                    Weight: {(d.weight * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="text-3xl font-extrabold text-white mt-3">
                  {d.score}
                  <span className="text-xs text-slate-500 font-normal"> / 100</span>
                </div>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{d.key_signal}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 text-[11px] font-medium text-emerald-400">
                Score Contribution: +{d.contribution} pts
              </div>
            </div>
          ))}
        </div>

        {/* Cross-Domain Patterns */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="text-purple-400" size={18} />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Cross-Department Pattern Recognition
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.facts.cross_domain_patterns.map((p: any, idx: number) => (
              <div key={idx} className="app-card p-5 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      {p.severity}
                    </span>
                    <div className="flex gap-1">
                      {p.domains_involved.map((dom: string) => (
                        <span key={dom} className="text-[10px] text-slate-400 uppercase bg-white/5 px-1.5 py-0.5 rounded">
                          {dom}
                        </span>
                      ))}
                    </div>
                  </div>
                  <h4 className="text-xs font-bold text-white mt-2.5">{p.title}</h4>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{p.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Macro Opportunities & Systemic Risks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="app-card p-6 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Lightbulb className="text-amber-400" size={17} />
              Macro Revenue Opportunities
            </h3>
            {data.facts.macro_opportunities.map((opp: string, idx: number) => (
              <div key={idx} className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-slate-200">
                <span className="font-bold text-amber-300 mr-1.5">Opportunity #{idx + 1}:</span>
                {opp}
              </div>
            ))}
          </div>

          <div className="app-card p-6 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="text-rose-400" size={17} />
              Systemic Risk Alerts
            </h3>
            {data.facts.systemic_risks.map((risk: string, idx: number) => (
              <div key={idx} className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-slate-200">
                <span className="font-bold text-rose-300 mr-1.5">Risk #{idx + 1}:</span>
                {risk}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
