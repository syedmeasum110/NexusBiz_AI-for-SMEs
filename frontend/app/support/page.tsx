"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { getSupportAnalysis } from "@/lib/api";
import { Headphones, AlertTriangle, CheckCircle2, MessageSquare, Truck, ShieldAlert } from "lucide-react";

export default function SupportPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSupportAnalysis()
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
              <Headphones className="text-rose-400" size={24} />
              Customer Support & Retention
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Complaint tracking, courier delivery bottleneck detection & sentiment intelligence for Ali Garments.
            </p>
          </div>
          <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            Customer Support Agent Active
          </span>
        </div>

        {/* Courier Issue Alert Banner if Spike */}
        {data.delivery_issue_spike && (
          <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 flex items-start gap-3">
            <Truck className="text-rose-400 mt-0.5 flex-shrink-0" size={20} />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400">
                Logistics Partner SLA Breach Detected
              </h4>
              <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                {data.delivery_complaint_count} customer complaints cite courier delays (TCS / Leopards) in Hyderabad and surrounding districts.
                Automated dispatch alerts and SLA escalation notices have been prepared by the agent.
              </p>
            </div>
          </div>
        )}

        {/* Support KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="app-card p-5">
            <span className="text-xs text-slate-400 font-semibold">Total Support Tickets</span>
            <div className="text-2xl font-extrabold text-white mt-1">
              {data.total_tickets} Tickets
            </div>
            <p className="text-xs text-slate-400 mt-2">WhatsApp, Phone, Web & Email</p>
          </div>

          <div className="app-card p-5">
            <span className="text-xs text-slate-400 font-semibold">Open / Action Required</span>
            <div className="text-2xl font-extrabold text-amber-400 mt-1">
              {data.open_tickets} Unresolved
            </div>
            <p className="text-xs text-slate-400 mt-2">Active customer interactions</p>
          </div>

          <div className="app-card p-5">
            <span className="text-xs text-slate-400 font-semibold">Negative Sentiment Rate</span>
            <div className="text-2xl font-extrabold text-rose-400 mt-1">
              {data.negative_sentiment_rate}%
            </div>
            <p className="text-xs text-rose-400 mt-2 font-medium">Primarily courier delivery related</p>
          </div>

          <div className="app-card p-5">
            <span className="text-xs text-slate-400 font-semibold">Resolved Cases</span>
            <div className="text-2xl font-extrabold text-emerald-400 mt-1">
              {data.resolved_tickets} Closed
            </div>
            <p className="text-xs text-slate-400 mt-2">Exchanges & inquiries cleared</p>
          </div>
        </div>

        {/* Root Causes & Retention Strategies */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="app-card p-6 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert size={16} className="text-rose-400" />
              Primary Customer Complaint Drivers
            </h3>
            {data.top_complaint_drivers.map((driver: string, idx: number) => (
              <div key={idx} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-slate-300">
                {driver}
              </div>
            ))}
          </div>

          <div className="app-card p-6 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400" />
              Retention & Mitigation Directives
            </h3>
            {data.retention_strategies.map((strat: string, idx: number) => (
              <div key={idx} className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-slate-200">
                <span className="font-bold text-emerald-300 mr-1.5">Action #{idx + 1}:</span>
                {strat}
              </div>
            ))}
          </div>
        </div>

        {/* Support Tickets Table */}
        <div className="app-card p-6">
          <h3 className="text-sm font-bold text-white mb-4">Customer Support Logs (Hyderabad)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 pb-2">
                  <th className="py-2.5 font-semibold">Customer</th>
                  <th className="py-2.5 font-semibold">Channel</th>
                  <th className="py-2.5 font-semibold">Issue Description</th>
                  <th className="py-2.5 font-semibold">Sentiment</th>
                  <th className="py-2.5 font-semibold">Status</th>
                  <th className="py-2.5 font-semibold text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.recent_tickets.map((t: any) => (
                  <tr key={t.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 font-semibold text-white">{t.customer_name}</td>
                    <td className="py-3 text-slate-400">{t.channel}</td>
                    <td className="py-3 text-slate-200 max-w-xs truncate">{t.description}</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                          t.sentiment === "negative"
                            ? "text-rose-400 bg-rose-500/10"
                            : t.sentiment === "positive"
                            ? "text-emerald-400 bg-emerald-500/10"
                            : "text-slate-400 bg-slate-500/10"
                        }`}
                      >
                        {t.sentiment}
                      </span>
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                          t.status === "open"
                            ? "text-amber-400 bg-amber-500/10 border border-amber-500/20"
                            : "text-emerald-400 bg-emerald-500/10"
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3 text-right text-slate-400">{t.created_at}</td>
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
