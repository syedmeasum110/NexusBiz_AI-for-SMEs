"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingDown,
  TrendingUp,
  Package,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Zap,
  CheckCircle2,
  DollarSign,
  Users,
  ShoppingBag,
  ExternalLink,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import DemoScenarioModal from "@/components/DemoScenarioModal";
import { getDashboard, getLatestWorkflow, type DashboardData, type WorkflowExecution } from "@/lib/api";
import { formatPKR, formatDate } from "@/lib/format";
import { useLanguage } from "@/context/LanguageContext";

const RISK_BADGES: Record<string, { color: string; label: string }> = {
  low: { color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", label: "Low Risk" },
  moderate: { color: "text-amber-400 bg-amber-500/10 border-amber-500/20", label: "Moderate Risk" },
  high: { color: "text-orange-400 bg-orange-500/10 border-orange-500/20", label: "High Risk" },
  critical: { color: "text-rose-400 bg-rose-500/10 border-rose-500/20", label: "Critical Risk" },
};

const PRIORITY_BADGES: Record<string, string> = {
  urgent: "bg-rose-500/20 text-rose-400 border border-rose-500/30",
  high: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
  medium: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  low: "bg-slate-500/20 text-slate-300 border border-slate-500/30",
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [workflow, setWorkflow] = useState<WorkflowExecution | null>(null);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  const loadData = () => {
    getDashboard()
      .then(setData)
      .catch((err) => setError(err.message));
    getLatestWorkflow()
      .then(setWorkflow)
      .catch(() => {});
  };

  useEffect(() => {
    loadData();
  }, []);

  if (error) {
    return (
      <Sidebar>
        <div className="flex items-center justify-center h-64">
          <div className="app-card border-rose-500/30 p-6 text-center max-w-md">
            <AlertTriangle className="text-rose-400 mx-auto mb-2" size={32} />
            <p className="text-rose-400 font-bold">Failed to load dashboard data</p>
            <p className="text-xs text-slate-400 mt-1">{error}</p>
            <button
              onClick={() => { setError(null); loadData(); }}
              className="mt-4 px-4 py-2 text-xs font-semibold bg-emerald-500 text-slate-950 rounded-lg"
            >
              Retry Connection
            </button>
          </div>
        </div>
      </Sidebar>
    );
  }

  if (!data) {
    return (
      <Sidebar>
        <div className="flex items-center justify-center h-72">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
            <p className="text-xs text-slate-400 font-medium">Connecting to AI Workforce...</p>
          </div>
        </div>
      </Sidebar>
    );
  }

  const score = data.health_score ?? 74;
  const circumference = 2 * Math.PI * 52;
  const strokeOffset = circumference - (score / 100) * circumference;
  const riskBadge = RISK_BADGES[data.risk_level] || RISK_BADGES.moderate;

  return (
    <Sidebar>
      <div className="space-y-6">
        {/* Banner: Autonomous SME Platform */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950/40 via-blue-950/30 to-purple-950/40 border border-emerald-500/20 p-5 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399] animate-pulse" />
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Welcome to NexusBiz AI
                </h2>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Autonomous AI workforce orchestrating{" "}
                <strong className="text-white">Ali Garments (Hyderabad)</strong>: CEO Agent coordinates
                Finance, Inventory, Marketing, Customer Support, and BI agents to protect revenue and streamline growth.
              </p>
            </div>
            <button
              onClick={() => setIsDemoModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all flex-shrink-0"
            >
              <Sparkles size={14} />
              <span>Launch Demo Scenario</span>
            </button>
          </div>
        </div>

        {/* Top KPI & Health Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Health Score Gauge */}
          <div className="app-card flex flex-col items-center justify-center p-5 text-center relative overflow-hidden">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-2">
              Business Health Score
            </span>
            <div className="relative w-28 h-28 my-1">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke={score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#f43f5e"}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeOffset}
                  style={{ transition: "stroke-dashoffset 1.5s ease-out" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold text-white">{score}</span>
                <span className="text-[10px] text-slate-400">/ 100</span>
              </div>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border mt-1 ${riskBadge.color}`}>
              {riskBadge.label}
            </span>
          </div>

          {/* KPI Cards */}
          {data.metrics.map((m, idx) => (
            <div key={idx} className="app-card flex flex-col justify-between p-5">
              <span className="text-xs font-semibold text-slate-400">{m.label}</span>
              <div className="my-2">
                <div className="text-2xl font-extrabold text-white tracking-tight">
                  {m.prefix}
                  {m.value >= 1000 ? formatPKR(m.value).replace("Rs ", "") : m.value.toLocaleString()}
                </div>
                {m.change !== null && m.change !== undefined && (
                  <div
                    className={`flex items-center gap-1 text-xs font-semibold mt-1.5 ${
                      m.change >= 0 ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {m.change >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                    <span>
                      {Math.abs(m.change)}% {m.change_label || "vs last month"}
                    </span>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Real-time sync</span>
            </div>
          ))}
        </div>

        {/* Autonomous Workflow Status Banner */}
        {workflow && (
          <div className="app-card border-emerald-500/30 p-5 bg-gradient-to-r from-emerald-950/20 via-slate-900/60 to-slate-900/40">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mt-0.5">
                  <Zap size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      Active Autonomous Workflow
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      {workflow.status.replace("_", " ").toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white mt-1">{workflow.title}</h3>
                  <p className="text-xs text-slate-300 mt-0.5 max-w-3xl leading-relaxed">
                    {workflow.consolidated_decision}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDemoModalOpen(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-colors flex items-center gap-1.5 whitespace-nowrap"
              >
                <span>View & Approve Actions</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        )}

        {/* Charts & Inventory Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Revenue & Profit Area Chart */}
          <div className="app-card lg:col-span-2 p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">Revenue & Net Profit Trajectory</h3>
                <p className="text-xs text-slate-400">Monthly financial performance in Hyderabad (PKR)</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Last 6 Months
              </span>
            </div>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.sales_trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0e1522",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "10px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                    formatter={(v: any) => formatPKR(Number(v))}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fill="url(#colorRevenue)"
                    name="Revenue"
                  />
                  <Area
                    type="monotone"
                    dataKey="profit"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    fill="url(#colorProfit)"
                    name="Net Profit"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Inventory Alerts List */}
          <div className="app-card p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Package className="text-amber-400" size={17} />
                <h3 className="text-sm font-bold text-white">Inventory Health</h3>
              </div>
              <Link href="/inventory" className="text-xs text-emerald-400 hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-3 overflow-y-auto max-h-60 pr-1">
              {data.inventory_alerts.map((alert, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          alert.status === "critical"
                            ? "bg-rose-500 shadow-[0_0_8px_#f43f5e]"
                            : alert.status === "low"
                            ? "bg-amber-500 shadow-[0_0_8px_#f59e0b]"
                            : alert.status === "overstock"
                            ? "bg-purple-500 shadow-[0_0_8px_#a855f7]"
                            : "bg-blue-500"
                        }`}
                      />
                      <p className="text-xs font-semibold text-slate-200 truncate">{alert.item}</p>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {alert.status === "critical"
                        ? "Exhausts in 48 hours"
                        : alert.status === "overstock"
                        ? "Excess working capital tied"
                        : "Safety threshold breached"}
                    </p>
                  </div>
                  <div className="text-right ml-3">
                    <span
                      className={`text-xs font-bold ${
                        alert.status === "critical" ? "text-rose-400" : "text-white"
                      }`}
                    >
                      {alert.qty} units
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Products & Underperforming Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Top Revenue Drivers */}
          <div className="app-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp size={16} className="text-emerald-400" />
                Top Revenue Drivers
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Growth Leaders
              </span>
            </div>
            <div className="space-y-3">
              {data.top_products.map((p, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-100 truncate">{p.name}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {p.sales} units sold · Stock:{" "}
                      <span className={p.stock_qty <= 5 ? "text-rose-400 font-bold" : "text-white"}>
                        {p.stock_qty}
                      </span>
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-xs font-bold text-emerald-400">{formatPKR(p.revenue)}</p>
                    <span className="text-[10px] text-emerald-500 font-semibold uppercase">Top Velocity</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Underperforming Products */}
          <div className="app-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingDown size={16} className="text-rose-400" />
                Underperforming / Overstocked
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                Action Required
              </span>
            </div>
            <div className="space-y-3">
              {data.weak_products.map((p, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-100 truncate">{p.name}</p>
                    <p className="text-[11px] text-rose-400/90 mt-0.5">
                      {p.reason} · Stock: {p.stock_qty}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-xs font-bold text-slate-200">{formatPKR(p.revenue)}</p>
                    <span className="text-[10px] text-rose-400 font-semibold uppercase">Low Velocity</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Recommendations & Live Workforce Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Recommendations */}
          <div className="app-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles size={16} className="text-emerald-400" />
                AI Recommendations
              </h3>
              <Link href="/recommendations" className="text-xs text-emerald-400 hover:underline">
                Explore all
              </Link>
            </div>
            <div className="space-y-3">
              {data.recommendations.map((rec, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                        PRIORITY_BADGES[rec.priority] || PRIORITY_BADGES.medium
                      }`}
                    >
                      {rec.priority}
                    </span>
                    <span className="text-[11px] text-emerald-400 font-semibold">{rec.agent}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white">{rec.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{rec.description}</p>
                  {rec.expected_impact && (
                    <div className="pt-1">
                      <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                        Impact: {rec.expected_impact}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Live Activity Feed */}
          <div className="app-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users size={16} className="text-blue-400" />
                Live Agent Activity Feed
              </h3>
              <Link href="/activity-history" className="text-xs text-emerald-400 hover:underline">
                Full logs
              </Link>
            </div>
            <div className="space-y-4">
              {data.recent_activity.map((act, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] mt-1 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-400">{act.agent}</span>
                      <span className="text-[10px] text-slate-500">{act.time}</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-200 mt-0.5">{act.action}</p>
                    {act.finding && (
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed truncate">{act.finding}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <DemoScenarioModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        onWorkflowUpdated={loadData}
      />
    </Sidebar>
  );
}
