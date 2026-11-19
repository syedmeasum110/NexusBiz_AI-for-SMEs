"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Command,
  DollarSign,
  Package,
  Megaphone,
  Headphones,
  Users,
  BarChart3,
  Lightbulb,
  History,
  Settings,
  ChevronLeft,
  Sparkles,
  Building2,
  ShieldCheck,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import ThemeToggle from "./ThemeToggle";
import LanguageToggle from "./LanguageToggle";
import DemoScenarioModal from "./DemoScenarioModal";

export default function Sidebar({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const pathname = usePathname();
  const { t, isUrdu } = useLanguage();

  const navItems = [
    { href: "/", icon: LayoutDashboard, label: t("nav.dashboard") },
    { href: "/command-center", icon: Command, label: t("nav.command_center"), highlight: true },
    { href: "/finance", icon: DollarSign, label: t("nav.finance") },
    { href: "/inventory", icon: Package, label: t("nav.inventory") },
    { href: "/marketing", icon: Megaphone, label: t("nav.marketing") },
    { href: "/support", icon: Headphones, label: t("nav.support") },
    { href: "/ai-agents", icon: Users, label: t("nav.agents") },
    { href: "/bi", icon: BarChart3, label: t("nav.bi") },
    { href: "/recommendations", icon: Lightbulb, label: t("nav.recommendations") },
    { href: "/activity-history", icon: History, label: t("nav.activity") },
    { href: "/settings", icon: Settings, label: t("nav.settings") },
  ];

  return (
    <div className={`flex h-screen overflow-hidden ${isUrdu ? "font-urdu" : ""}`}>
      {/* Sidebar Panel */}
      <motion.aside
        animate={{ width: collapsed ? 80 : 270 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="flex-shrink-0 bg-[#0e1522] dark:bg-[#0e1522] light:bg-white border-r border-slate-800 dark:border-white/5 light:border-slate-200 flex flex-col relative z-30 shadow-xl transition-colors duration-200"
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800 dark:border-white/5 light:border-slate-200 flex items-center justify-between h-[72px]">
          <Link href="/" className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <Building2 size={20} className="text-white" />
            </div>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="min-w-0 overflow-hidden"
              >
                <div className="text-sm font-bold text-white dark:text-white light:text-slate-900 tracking-tight">
                  NexusBiz AI
                </div>
                <div className="text-[11px] text-emerald-400 font-semibold truncate">
                  Ali Garments · Hyderabad
                </div>
              </motion.div>
            )}
          </Link>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="block relative">
                <div
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? item.highlight
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-300 light:bg-emerald-50 light:text-emerald-700 light:border-emerald-200"
                        : "bg-white/10 text-white dark:bg-white/10 dark:text-white light:bg-slate-100 light:text-slate-900 font-bold"
                      : "text-slate-400 dark:text-slate-400 light:text-slate-600 hover:text-white dark:hover:text-white light:hover:text-slate-900 hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-slate-50"
                  }`}
                >
                  <Icon
                    size={17}
                    className={`flex-shrink-0 ${
                      isActive
                        ? item.highlight
                          ? "text-emerald-400 dark:text-emerald-400 light:text-emerald-600"
                          : "text-emerald-400 dark:text-emerald-400 light:text-emerald-600"
                        : "text-slate-400 dark:text-slate-400 light:text-slate-500"
                    }`}
                  />
                  {!collapsed && (
                    <span className="whitespace-nowrap truncate">{item.label}</span>
                  )}
                  {isActive && !collapsed && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Demo Launcher Button in Sidebar */}
        <div className="p-3 border-t border-slate-800 dark:border-white/5 light:border-slate-200 space-y-2">
          {!collapsed ? (
            <button
              onClick={() => setIsDemoOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all"
            >
              <Sparkles size={14} />
              <span>{t("common.launch_demo")}</span>
            </button>
          ) : (
            <button
              onClick={() => setIsDemoOpen(true)}
              className="w-full p-2.5 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center"
              title={t("common.launch_demo")}
            >
              <Sparkles size={16} />
            </button>
          )}

          {/* Controls: Theme & Language */}
          <div className={`flex items-center ${collapsed ? "flex-col" : "justify-between"} gap-2 pt-1`}>
            <ThemeToggle />
            <LanguageToggle />
          </div>
        </div>

        {/* Collapse Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3.5 top-8 w-7 h-7 bg-[#1a2235] dark:bg-[#1a2235] light:bg-slate-200 border border-white/10 dark:border-white/10 light:border-slate-300 rounded-full flex items-center justify-center text-slate-400 hover:text-white dark:hover:text-white light:hover:text-slate-900 shadow-md transition-all z-40"
        >
          <ChevronLeft
            size={14}
            className={`transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
          />
        </button>
      </motion.aside>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#070b12] dark:bg-[#070b12] light:bg-[#f8fafc] text-slate-100 dark:text-slate-100 light:text-slate-900 transition-colors duration-200">
        {/* Top Navbar */}
        <header className="h-[72px] border-b border-slate-800 dark:border-white/5 light:border-slate-200 px-6 sm:px-8 flex items-center justify-between bg-[#070b12]/90 dark:bg-[#070b12]/90 light:bg-white/90 backdrop-blur-md z-20 flex-shrink-0">
          <div>
            <h1 className="text-base font-bold text-white dark:text-white light:text-slate-900 flex items-center gap-2">
              <span>Ali Garments</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Hyderabad, PK
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 dark:text-slate-400 light:text-slate-500">
              NexusBiz AI · Autonomous SME Business Management Platform
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Workforce Status Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/60 dark:bg-white/5 light:bg-slate-100 border border-slate-700/50 dark:border-white/10 light:border-slate-200 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
              <span className="text-slate-300 dark:text-slate-300 light:text-slate-700">
                {t("common.status_online")}
              </span>
            </div>

            {/* Quick Demo Launch Button */}
            <button
              onClick={() => setIsDemoOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all"
            >
              <Sparkles size={14} />
              <span className="hidden sm:inline">{t("common.launch_demo")}</span>
            </button>

            {/* Owner Avatar */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 font-bold flex items-center justify-center text-xs shadow-md">
              AA
            </div>
          </div>
        </header>

        {/* Scrollable Main Children */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 relative">
          {children}
        </main>
      </div>

      {/* Demo Scenario Modal */}
      <DemoScenarioModal
        isOpen={isDemoOpen}
        onClose={() => setIsDemoOpen(false)}
      />
    </div>
  );
}
