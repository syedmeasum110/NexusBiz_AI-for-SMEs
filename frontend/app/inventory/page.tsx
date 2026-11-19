"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { getInventoryAnalysis } from "@/lib/api";
import { formatPKR, formatPKRFull } from "@/lib/format";
import { Package, AlertCircle, CheckCircle2, Clock, RefreshCw } from "lucide-react";

export default function InventoryPage() {
  const [data, setData] = useState<any>(null);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getInventoryAnalysis()
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

  const filteredProducts = data.products.filter((p: any) => {
    if (filter === "all") return true;
    return p.status === filter;
  });

  return (
    <Sidebar>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Package className="text-purple-400" size={24} />
              Inventory & Supply Chain
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Autonomous warehouse monitoring, stockout mitigation & SKU replenishment for Hyderabad depot.
            </p>
          </div>
          <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            Inventory Agent Active
          </span>
        </div>

        {/* Inventory KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="app-card p-5">
            <span className="text-xs text-slate-400 font-semibold">Critical Stockouts</span>
            <div className="text-2xl font-extrabold text-rose-400 mt-1">
              {data.critical_stockouts} SKU
            </div>
            <p className="text-xs text-slate-400 mt-2">Embroidered Kurti White (5 units left)</p>
          </div>

          <div className="app-card p-5">
            <span className="text-xs text-slate-400 font-semibold">Revenue at Risk</span>
            <div className="text-2xl font-extrabold text-white mt-1">
              {formatPKR(data.revenue_at_risk_stockouts)}
            </div>
            <p className="text-xs text-rose-400 mt-2 font-medium">Immediate loss if unreplenished</p>
          </div>

          <div className="app-card p-5">
            <span className="text-xs text-slate-400 font-semibold">Trapped Overstock Capital</span>
            <div className="text-2xl font-extrabold text-purple-400 mt-1">
              {formatPKR(data.capital_tied_in_overstock)}
            </div>
            <p className="text-xs text-slate-400 mt-2">480 units Formal Shalwar Navy</p>
          </div>

          <div className="app-card p-5">
            <span className="text-xs text-slate-400 font-semibold">Active SKU Catalog</span>
            <div className="text-2xl font-extrabold text-white mt-1">
              {data.total_skus} Products
            </div>
            <p className="text-xs text-emerald-400 mt-2 font-medium">Lawn, Pret, Kurti & Bridal</p>
          </div>
        </div>

        {/* Agent Recommendations & Demand Forecast */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="app-card p-6 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <RefreshCw size={16} className="text-purple-400" />
              Replenishment & Clearance Directives
            </h3>
            {data.recommendations.map((r: string, idx: number) => (
              <div key={idx} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-slate-200">
                <span className="font-bold text-purple-300 mr-1.5">Action #{idx + 1}:</span>
                {r}
              </div>
            ))}
          </div>

          <div className="app-card p-6 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock size={16} className="text-blue-400" />
              Demand Velocity & Seasonal Forecast
            </h3>
            {data.forecast_notes.map((note: string, idx: number) => (
              <div key={idx} className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-slate-200">
                {note}
              </div>
            ))}
          </div>
        </div>

        {/* Product Catalog & Warehouse Stock Table */}
        <div className="app-card p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <h3 className="text-sm font-bold text-white">SKU Warehouse Stock Status</h3>
            <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl">
              {["all", "critical", "low", "adequate", "overstock"].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilter(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-colors ${
                    filter === st
                      ? "bg-purple-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 pb-2">
                  <th className="py-2.5 font-semibold">Product Name & SKU</th>
                  <th className="py-2.5 font-semibold">Category</th>
                  <th className="py-2.5 font-semibold text-right">Retail Price</th>
                  <th className="py-2.5 font-semibold text-right">Current Stock</th>
                  <th className="py-2.5 font-semibold text-right">Weekly Velocity</th>
                  <th className="py-2.5 font-semibold text-right">Stock Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredProducts.map((p: any) => (
                  <tr key={p.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 font-semibold text-white">
                      <div>{p.name}</div>
                      <span className="text-[10px] text-slate-400 font-mono">{p.sku}</span>
                    </td>
                    <td className="py-3 text-slate-400">{p.category}</td>
                    <td className="py-3 text-right font-bold text-slate-200">{formatPKRFull(p.price)}</td>
                    <td className="py-3 text-right font-bold text-white">
                      <span className={p.stock_qty <= 5 ? "text-rose-400 font-extrabold" : ""}>
                        {p.stock_qty}
                      </span>
                    </td>
                    <td className="py-3 text-right text-slate-300 font-medium">{p.weekly_velocity} units/wk</td>
                    <td className="py-3 text-right">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          p.status === "critical"
                            ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                            : p.status === "low"
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : p.status === "overstock"
                            ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                            : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        }`}
                      >
                        {p.status}
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
