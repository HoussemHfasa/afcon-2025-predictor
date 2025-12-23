"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import en from "./en.json";
import fr from "./fr.json";

export type Language = "en" | "fr";

type TranslationValue = string | { [key: string]: TranslationValue };
type Translations = { [key: string]: TranslationValue };

const translations: Record<Language, Translations> = { en, fr };

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = "afcon-language";
const TUNISIA_COUNTRY_CODES = ["TN", "TUN"];

// French-speaking African countries (for AFCON context)
const FRENCH_SPEAKING_COUNTRIES = [
  "TN", "TUN", // Tunisia
  "DZ", "DZA", // Algeria
  "MA", "MAR", // Morocco
  "SN", "SEN", // Senegal
  "CI", "CIV", // Ivory Coast
  "CM", "CMR", // Cameroon
  "ML", "MLI", // Mali
  "BF", "BFA", // Burkina Faso
  "NE", "NER", // Niger
  "TG", "TGO", // Togo
  "BJ", "BEN", // Benin
  "GN", "GIN", // Guinea
  "CG", "COG", // Congo
  "CD", "COD", // DR Congo
  "GA", "GAB", // Gabon
  "MG", "MDG", // Madagascar
  "FR", "FRA", // France
  "BE", "BEL", // Belgium (French-speaking)
  "CH", "CHE", // Switzerland (French-speaking)
  "CA", "CAN", // Canada (Quebec)
];

async function detectCountry(): Promise<string | null> {
  try {
    // Use a free geolocation API
    const response = await fetch("https://ipapi.co/json/", {
      signal: AbortSignal.timeout(3000), // 3 second timeout
    });
    if (response.ok) {
      const data = await response.json();
      return data.country_code || null;
    }
  } catch (error) {
    console.log("Geolocation detection failed, using default language");
  }
  return null;
}

function getNestedValue(obj: Translations, path: string): string {
  const keys = path.split(".");
  let current: TranslationValue = obj;
  
  for (const key of keys) {
    if (current && typeof current === "object" && key in current) {
      current = current[key];
    } else {
      return path; // Return the key if translation not found
    }
  }
  
  return typeof current === "string" ? current : path;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    async function initLanguage() {
      // First check localStorage
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "en" || stored === "fr") {
        setLanguageState(stored);
        setIsInitialized(true);
        return;
      }

      // Check browser language preference
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith("fr")) {
        setLanguageState("fr");
        localStorage.setItem(STORAGE_KEY, "fr");
        setIsInitialized(true);
        return;
      }

      // Try geolocation-based detection (Tunisia = French)
      const country = await detectCountry();
      if (country && FRENCH_SPEAKING_COUNTRIES.includes(country.toUpperCase())) {
        setLanguageState("fr");
        localStorage.setItem(STORAGE_KEY, "fr");
      } else {
        setLanguageState("en");
        localStorage.setItem(STORAGE_KEY, "en");
      }
      setIsInitialized(true);
    }

    initLanguage();
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    // Update document language for accessibility
    document.documentElement.lang = lang;
  }, []);

  const t = useCallback((key: string): string => {
    return getNestedValue(translations[language], key);
  }, [language]);

  // Don't render until initialized to prevent flash
  if (!isInitialized) {
    return null;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

export function useTranslation() {
  const { t, language } = useLanguage();
  return { t, language };
}
