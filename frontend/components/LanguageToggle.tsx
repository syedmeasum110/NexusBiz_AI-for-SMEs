"use client";

import React from "react";
import { Globe } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      aria-label="Toggle language"
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border border-slate-700/40 dark:border-white/10 bg-slate-800/40 dark:bg-white/5 hover:bg-slate-700/50 dark:hover:bg-white/10 text-emerald-400"
      title="Switch English / Urdu"
    >
      <Globe size={15} />
      <span>{language === "en" ? "اردو" : "English"}</span>
    </button>
  );
}
