"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { getSettings, updateSettings, resetDemoData } from "@/lib/api";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
import { Settings, Moon, Sun, Globe, Building2, Shield, RotateCcw, Check, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const [data, setData] = useState<any>(null);
  const [resetting, setResetting] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();

  useEffect(() => {
    getSettings().then(setData).catch(() => {});
  }, []);

  const handleReset = async () => {
    if (!confirm("Are you sure you want to reset all demo data to pristine initial state for Ali Garments?")) return;
    try {
      setResetting(true);
      await resetDemoData();
      alert("Demo data successfully reset! Refreshing dashboard.");
      window.location.href = "/";
    } catch (err) {
      alert("Failed to reset: " + err);
    } finally {
      setResetting(false);
    }
  };

  const handleSavePreferences = async (newTheme: "dark" | "light", newLang: "en" | "ur") => {
    setTheme(newTheme);
    setLanguage(newLang);
    try {
      await updateSettings({ theme: newTheme, language: newLang });
      setSavedMsg("Preferences updated successfully!");
      setTimeout(() => setSavedMsg(""), 3000);
    } catch {}
  };

  return (
    <Sidebar>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Settings className="text-emerald-400" size={24} />
              Platform Settings
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Configure system themes, bilingual language preferences, and business identity.
            </p>
          </div>
          {savedMsg && (
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 animate-pulse">
              <Check size={14} />
              {savedMsg}
            </span>
          )}
        </div>

        {/* Business Profile Card */}
        <div className="app-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Building2 size={16} className="text-emerald-400" />
            Registered Business Entity
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="text-slate-400 block mb-1">Business Name</span>
              <span className="text-sm font-bold text-white">Ali Garments</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="text-slate-400 block mb-1">Showroom Location</span>
              <span className="text-sm font-bold text-emerald-400">Hyderabad, Pakistan</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="text-slate-400 block mb-1">Business Owner</span>
              <span className="text-sm font-bold text-white">Ahmed Ali</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="text-slate-400 block mb-1">Operating Currency</span>
              <span className="text-sm font-bold text-white">Pakistani Rupee (PKR / Rs)</span>
            </div>
          </div>
        </div>

        {/* Theme Settings (Dark / Light) */}
        <div className="app-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sun size={16} className="text-amber-400" />
                Theme Mode (Dark / Light)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Switch between high-contrast dark mode and modern crisp light mode.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleSavePreferences("dark", language as any)}
              className={`p-4 rounded-xl border text-left transition-all ${
                theme === "dark"
                  ? "bg-slate-900 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                  : "bg-white/5 border-white/10 opacity-70 hover:opacity-100"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Moon size={18} className="text-emerald-400" />
                {theme === "dark" && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                    Active
                  </span>
                )}
              </div>
              <div className="text-xs font-bold text-white">Dark Theme</div>
              <p className="text-[11px] text-slate-400 mt-1">Deep navy & high-contrast emerald</p>
            </button>

            <button
              onClick={() => handleSavePreferences("light", language as any)}
              className={`p-4 rounded-xl border text-left transition-all ${
                theme === "light"
                  ? "bg-slate-100 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                  : "bg-white/5 border-white/10 opacity-70 hover:opacity-100"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Sun size={18} className="text-amber-500" />
                {theme === "light" && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600">
                    Active
                  </span>
                )}
              </div>
              <div className="text-xs font-bold text-slate-900">Light Theme</div>
              <p className="text-[11px] text-slate-600 mt-1">Clean crisp slate & white backgrounds</p>
            </button>
          </div>
        </div>

        {/* Language Settings (English / Urdu) */}
        <div className="app-card p-6 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Globe size={16} className="text-emerald-400" />
              Language & Localization (اردو / English)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Select your preferred language interface for all agents and dashboards.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleSavePreferences(theme as any, "en")}
              className={`p-4 rounded-xl border text-left transition-all ${
                language === "en"
                  ? "bg-emerald-500/10 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                  : "bg-white/5 border-white/10 opacity-70 hover:opacity-100"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-white">English</span>
                {language === "en" && <Check size={14} className="text-emerald-400" />}
              </div>
              <p className="text-[11px] text-slate-400">Default International English Interface</p>
            </button>

            <button
              onClick={() => handleSavePreferences(theme as any, "ur")}
              className={`p-4 rounded-xl border text-right transition-all ${
                language === "ur"
                  ? "bg-emerald-500/10 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                  : "bg-white/5 border-white/10 opacity-70 hover:opacity-100"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                {language === "ur" && <Check size={14} className="text-emerald-400" />}
                <span className="text-sm font-bold text-white font-urdu">اردو (Urdu)</span>
              </div>
              <p className="text-[11px] text-slate-400 font-urdu">مکمل اردو انٹرفیس اور نستعلیق خط</p>
            </button>
          </div>
        </div>

        {/* Demo Data Management */}
        <div className="app-card p-6 border-rose-500/20 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <RotateCcw size={16} className="text-rose-400" />
                Reset Demonstration Data
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-lg leading-relaxed">
                Restore pristine seed records for Ali Garments (Hyderabad). Clears modified order executions and resets
                Embroidered Kurti White stock to 5 units for fresh demo runs.
              </p>
            </div>
            <button
              onClick={handleReset}
              disabled={resetting}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {resetting ? <Loader2 size={13} className="animate-spin" /> : <RotateCcw size={13} />}
              <span>Reset Demo State</span>
            </button>
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
