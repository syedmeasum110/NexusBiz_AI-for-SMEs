"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  toggleTheme: () => {},
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("nexusbiz_theme") as Theme | null;
    const initial = saved === "light" ? "light" : "dark";
    setThemeState(initial);
    applyThemeClass(initial);
    setMounted(true);
  }, []);

  const applyThemeClass = (t: Theme) => {
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(t);
  };

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem("nexusbiz_theme", t);
    applyThemeClass(t);
  };

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
