"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-9 w-9" />; // Placeholder
  }

  const currentTheme = theme;

  return (
    <button
      onClick={() => toggleTheme()}
      className="flex h-9 w-9 items-center justify-center rounded-full text-soul-fg/80 hover:bg-black/10 hover:text-soul-fg dark:text-white/80 dark:hover:bg-white/10 dark:hover:text-white transition"
      aria-label="تبديل المظهر"
    >
      {currentTheme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  );
}
