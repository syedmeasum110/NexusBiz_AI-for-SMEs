"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import enTranslations from "@/locales/en.json";
import urTranslations from "@/locales/ur.json";

type Language = "en" | "ur";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
  isUrdu: boolean;
}

const translations: Record<Language, any> = {
  en: enTranslations,
  ur: urTranslations,
};

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: (key: string) => key,
  isUrdu: false,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem("nexusbiz_lang") as Language | null;
    if (saved === "ur" || saved === "en") {
      setLanguageState(saved);
      document.documentElement.dir = saved === "ur" ? "rtl" : "ltr";
      document.documentElement.lang = saved;
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("nexusbiz_lang", lang);
    document.documentElement.dir = lang === "ur" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  };

  const toggleLanguage = () => {
    const next = language === "en" ? "ur" : "en";
    setLanguage(next);
  };

  const t = (path: string): string => {
    const parts = path.split(".");
    let current = translations[language];
    for (const part of parts) {
      if (current && typeof current === "object" && part in current) {
        current = current[part];
      } else {
        // Fallback to English
        let fallback = translations.en;
        for (const fpart of parts) {
          if (fallback && typeof fallback === "object" && fpart in fallback) {
            fallback = fallback[fpart];
          } else {
            return path;
          }
        }
        return typeof fallback === "string" ? fallback : path;
      }
    }
    return typeof current === "string" ? current : path;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        isUrdu: language === "ur",
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
