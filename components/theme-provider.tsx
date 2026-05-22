"use client";

import * as React from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>("dark");
  const [mounted, setMounted] = React.useState(false);

  // 1. Initial detection and hydration
  React.useEffect(() => {
    const savedTheme = localStorage.getItem("app-theme") as Theme | null;
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    
    const initialTheme = savedTheme || systemTheme;
    setThemeState(initialTheme);
    setMounted(true);
    
    // Apply immediately to avoid flash if possible
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, []);

  // 2. State update handler
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("app-theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  // Provide the context
  const value = React.useMemo(() => ({
    theme,
    setTheme,
    toggleTheme
  }), [theme]);

  // Prevent hydration mismatch by only rendering once mounted if needed, 
  // but here we just return the provider and children to keep it fast.
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}