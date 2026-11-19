"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { getFinanceAnalysis } from "@/lib/api";
import { formatPKR, formatPKRFull } from "@/lib/format";
import { DollarSign, TrendingUp, TrendingDown, ShieldAlert, Sparkles, PieChart, ArrowUpRight } from "lucide-react";

export default function FinancePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFinanceAnalysis()
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

  return (
    <Sidebar>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <DollarSign className="text-emerald-400" size={24} />
              Finance Management
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Deterministic revenue, operating expenses, cash flow runway & cost optimization for Ali Garments.
            </p>
          </div>
          <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Finance Agent Active
          </span>
        </div>

        {/* Top Financial Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="app-card p-5">
            <span className="text-xs text-slate-400 font-semibold">August Revenue</span>
            <div className="text-2xl font-extrabold text-white mt-1">
              {formatPKR(data.current_month_revenue)}
            </div>
            <div className="text-xs text-emerald-400 mt-2 font-medium flex items-center gap-1">
              <TrendingUp size={14} />
              <span>+{data.revenue_growth_mom}% MoM recovery</span>
            </div>
          </div>

          <div className="app-card p-5">
            <span className="text-xs text-slate-400 font-semibold">Net Profit</span>
            <div className="text-2xl font-extrabold text-white mt-1">
              {formatPKR(data.current_month_profit)}
            </div>
            <div className="text-xs text-slate-400 mt-2">
              Margin: <strong className="text-emerald-400">{data.profit_margin_percent}%</strong>
            </div>
          </div>

          <div className="app-card p-5">
            <span className="text-xs text-slate-400 font-semibold">Monthly Operating Expenses</span>
            <div className="text-2xl font-extrabold text-white mt-1">
              {formatPKR(data.current_month_expenses)}
            </div>
            <div className="text-xs text-amber-400 mt-2">Fixed overheads across showroom & staff</div>
          </div>

          <div className="app-card p-5">
            <span className="text-xs text-slate-400 font-semibold">Cash Flow Runway</span>
            <div className="text-2xl font-extrabold text-emerald-400 mt-1">
              2.4 Months
            </div>
            <div className="text-xs text-slate-400 mt-2">{data.cash_flow_status}</div>
          </div>
        </div>

        {/* AI Agent Analysis & Cost Optimization */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="app-card p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles size={16} className="text-emerald-400" />
              Finance Agent Audit & Findings
            </h3>
            <div className="space-y-2.5">
              {data.key_findings.map((f: string, idx: number) => (
                <div key={idx} className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-slate-300">
                  {f}
                </div>
              ))}
            </div>

            <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider pt-2 flex items-center gap-1.5">
              <ShieldAlert size={14} />
              Identified Financial Risks
            </h4>
            <div className="space-y-2">
              {data.risks.map((r: string, idx: number) => (
                <div key={idx} className="text-xs text-slate-400 pl-3 border-l-2 border-rose-500/50">
                  {r}
                </div>
              ))}
            </div>
          </div>

          <div className="app-card p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp size={16} className="text-blue-400" />
              Cost Optimization & Capital Recovery
            </h3>
            <div className="space-y-3">
              {data.cost_optimizations.map((opt: string, idx: number) => (
                <div key={idx} className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-slate-200">
                  <div className="font-semibold text-emerald-300 mb-1">Recommendation #{idx + 1}</div>
                  {opt}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Expense Breakdown Table */}
        <div className="app-card p-6">
          <h3 className="text-sm font-bold text-white mb-4">Monthly Expense Breakdown (PKR)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 pb-2">
                  <th className="py-2.5 font-semibold">Expense Category</th>
                  <th className="py-2.5 font-semibold">Description</th>
                  <th className="py-2.5 font-semibold text-right">Amount (PKR)</th>
                  <th className="py-2.5 font-semibold text-right">Share of Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.expense_breakdown.map((e: any, idx: number) => (
                  <tr key={idx} className="hover:bg-white/[0.02]">
                    <td className="py-3 font-semibold text-white">{e.category}</td>
                    <td className="py-3 text-slate-400">{e.description}</td>
                    <td className="py-3 text-right font-bold text-slate-100">{formatPKRFull(e.amount)}</td>
                    <td className="py-3 text-right text-emerald-400 font-semibold">{e.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
