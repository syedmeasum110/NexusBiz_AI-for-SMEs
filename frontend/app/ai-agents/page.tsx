"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { getAgents, type AgentInfo } from "@/lib/api";
import Link from "next/link";
import {
  Users,
  Crown,
  Calculator,
  Package,
  Megaphone,
  Headphones,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

const AGENT_ICONS: Record<string, React.ElementType> = {
  crown: Crown,
  calculator: Calculator,
  package: Package,
  megaphone: Megaphone,
  headphones: Headphones,
  barchart: BarChart3,
};

const AGENT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  violet: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/30" },
  blue: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/30" },
  purple: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/30" },
  amber: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30" },
  rose: { bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/30" },
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30" },
};

export default function AIAgentsPage() {
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAgents()
      .then(setAgents)
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
              <Users className="text-emerald-400" size={24} />
              AI Workforce Platform
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Six specialized autonomous AI agents working collaboratively to manage Ali Garments (Hyderabad).
            </p>
          </div>
          <Link
            href="/command-center"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-md"
          >
            <span>Open Command Center</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {agents.map((agent) => {
            const Icon = AGENT_ICONS[agent.icon] || Users;
            const theme = AGENT_COLORS[agent.color] || AGENT_COLORS.emerald;

            return (
              <div
                key={agent.name}
                className="app-card p-6 flex flex-col justify-between space-y-4 hover:border-emerald-500/40 transition-all"
              >
                <div>
                  {/* Top Bar with Icon & Status */}
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-xl ${theme.bg} ${theme.text} border ${theme.border}`}>
                      <Icon size={22} />
                    </div>
                    <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Online
                    </span>
                  </div>

                  {/* Title & Role */}
                  <div className="mt-4">
                    <h3 className="text-base font-bold text-white tracking-tight">{agent.name}</h3>
                    <p className={`text-xs font-semibold ${theme.text} mt-0.5`}>{agent.role}</p>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">{agent.description}</p>

                  {/* Tasks Checklist */}
                  <div className="mt-4 pt-3 border-t border-white/5 space-y-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-2">
                      Core Responsibilities
                    </span>
                    {agent.tasks.slice(0, 4).map((task, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                        <CheckCircle2 size={13} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span className="leading-snug">{task}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Metrics Monitored */}
                {agent.key_metrics && agent.key_metrics.length > 0 && (
                  <div className="pt-3 border-t border-white/5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1.5">
                      Monitored Telemetry
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {agent.key_metrics.map((km, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md text-[10px] bg-white/5 text-slate-300 border border-white/5"
                        >
                          {km}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Sidebar>
  );
}
