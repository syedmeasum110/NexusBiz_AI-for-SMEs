"use client";

import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle dark/light theme"
      className="p-2 rounded-xl transition-all border border-slate-700/40 dark:border-white/10 bg-slate-800/40 dark:bg-white/5 hover:bg-slate-700/50 dark:hover:bg-white/10 text-slate-300 dark:text-slate-200"
      title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {theme === "dark" ? (
        <Sun size={18} className="text-amber-400 hover:rotate-45 transition-transform" />
      ) : (
        <Moon size={18} className="text-blue-500 hover:-rotate-12 transition-transform" />
      )}
    </button>
  );
}
