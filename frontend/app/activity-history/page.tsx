"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { getActivities } from "@/lib/api";
import { History, Filter, Search, Clock, Bot, ShieldCheck } from "lucide-react";

export default function ActivityHistoryPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [agentFilter, setAgentFilter] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchLogs = (agent?: string) => {
    setLoading(true);
    getActivities(agent)
      .then(setActivities)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs(agentFilter || undefined);
  }, [agentFilter]);

  const filtered = activities.filter((a) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      a.agent_name.toLowerCase().includes(term) ||
      a.action.toLowerCase().includes(term) ||
      (a.finding && a.finding.toLowerCase().includes(term))
    );
  });

  return (
    <Sidebar>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <History className="text-emerald-400" size={24} />
              AI Workforce Activity History
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Verifiable audit trail of all automated agent findings, cross-agent delegations & workflow executions.
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
            {filtered.length} Recorded Events
          </span>
        </div>

        {/* Filters */}
        <div className="app-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
              <Filter size={13} />
              Filter Agent:
            </span>
            {["", "CEO Agent", "Finance Agent", "Inventory Agent", "Marketing Agent", "Customer Support Agent", "Business Intelligence Agent"].map((a) => (
              <button
                key={a}
                onClick={() => setAgentFilter(a)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  agentFilter === a
                    ? "bg-emerald-500 text-slate-950 font-bold"
                    : "bg-white/5 text-slate-400 hover:text-white"
                }`}
              >
                {a || "All Agents"}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search actions or findings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-black/40 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Activity Timeline */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="app-card text-center py-12">
            <p className="text-xs text-slate-400">No activity matching your search criteria.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((item, idx) => (
              <div
                key={item.id || idx}
                className="app-card p-5 flex items-start gap-4 hover:border-emerald-500/30 transition-all"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-xs font-bold text-emerald-400">{item.agent_name}</span>
                    <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                      <Clock size={11} />
                      {item.created_at}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white mt-1">{item.action}</h4>
                  {item.finding && (
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed bg-white/[0.02] p-3 rounded-lg border border-white/5">
                      {item.finding}
                    </p>
                  )}
                  {item.data_points && (
                    <div className="mt-2 text-[10px] text-slate-400 font-mono truncate">
                      <strong>Telemetry:</strong> {item.data_points}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Sidebar>
  );
}
