"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { getMarketingAnalysis } from "@/lib/api";
import { formatPKR, formatPKRFull } from "@/lib/format";
import { Megaphone, TrendingUp, Target, Sparkles, BarChart2, PauseCircle, PlayCircle } from "lucide-react";

export default function MarketingPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMarketingAnalysis()
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
              <Megaphone className="text-amber-400" size={24} />
              Marketing Intelligence
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              ROAS optimization, channel conversion tracking & automated ad budget reallocation for Ali Garments.
            </p>
          </div>
          <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Marketing Agent Active
          </span>
        </div>

        {/* Marketing KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="app-card p-5">
            <span className="text-xs text-slate-400 font-semibold">Total Ad Spend</span>
            <div className="text-2xl font-extrabold text-white mt-1">
              {formatPKR(data.total_marketing_spend)}
            </div>
            <p className="text-xs text-slate-400 mt-2">Active across Meta Ads (Insta & FB)</p>
          </div>

          <div className="app-card p-5">
            <span className="text-xs text-slate-400 font-semibold">Attributed Ad Revenue</span>
            <div className="text-2xl font-extrabold text-emerald-400 mt-1">
              {formatPKR(data.total_attributed_revenue)}
            </div>
            <p className="text-xs text-emerald-500 mt-2 font-medium">High return on digital channels</p>
          </div>

          <div className="app-card p-5">
            <span className="text-xs text-slate-400 font-semibold">Blended ROAS</span>
            <div className="text-2xl font-extrabold text-white mt-1">
              {data.average_roas}x
            </div>
            <p className="text-xs text-amber-400 mt-2 font-medium">Return on advertising spend</p>
          </div>

          <div className="app-card p-5">
            <span className="text-xs text-slate-400 font-semibold">Top Performing Channel</span>
            <div className="text-sm font-extrabold text-white mt-2 truncate">
              {data.top_performing_channel}
            </div>
            <p className="text-xs text-emerald-400 mt-2 font-medium">21.3x ROAS on Instagram Reels</p>
          </div>
        </div>

        {/* AI Marketing Directives */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="app-card p-6 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles size={16} className="text-amber-400" />
              Growth Strategies & Budget Shift
            </h3>
            {data.growth_strategies.map((strat: string, idx: number) => (
              <div key={idx} className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-slate-200">
                <span className="font-bold text-amber-300 mr-1.5">Strategy #{idx + 1}:</span>
                {strat}
              </div>
            ))}
          </div>

          <div className="app-card p-6 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Target size={16} className="text-blue-400" />
              Channel Specific Optimization
            </h3>
            {data.channel_recommendations.map((rec: string, idx: number) => (
              <div key={idx} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-slate-300">
                {rec}
              </div>
            ))}
          </div>
        </div>

        {/* Active Campaigns Table */}
        <div className="app-card p-6">
          <h3 className="text-sm font-bold text-white mb-4">Meta & Social Media Ad Campaigns</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 pb-2">
                  <th className="py-2.5 font-semibold">Campaign Name</th>
                  <th className="py-2.5 font-semibold">Channel</th>
                  <th className="py-2.5 font-semibold text-right">Spend</th>
                  <th className="py-2.5 font-semibold text-right">Conversions</th>
                  <th className="py-2.5 font-semibold text-right">Conversion Rate</th>
                  <th className="py-2.5 font-semibold text-right">Attributed Sales</th>
                  <th className="py-2.5 font-semibold text-right">ROAS</th>
                  <th className="py-2.5 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.campaigns.map((c: any) => (
                  <tr key={c.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 font-semibold text-white">{c.name}</td>
                    <td className="py-3 text-slate-400">{c.channel}</td>
                    <td className="py-3 text-right font-medium text-slate-200">{formatPKRFull(c.spend)}</td>
                    <td className="py-3 text-right text-slate-300 font-bold">{c.conversions}</td>
                    <td className="py-3 text-right text-slate-300 font-semibold">{c.conversion_rate}%</td>
                    <td className="py-3 text-right font-bold text-emerald-400">{formatPKRFull(c.revenue_generated)}</td>
                    <td className="py-3 text-right font-extrabold text-amber-400">{c.roas}x</td>
                    <td className="py-3 text-right">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          c.status === "active"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-slate-500/20 text-slate-400 border border-slate-500/30"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
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
