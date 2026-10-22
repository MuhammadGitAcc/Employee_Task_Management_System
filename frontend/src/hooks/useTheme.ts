import { useCallback, useEffect, useState } from "react";
import { storage } from "~/services/storage";

export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "theme";

const readCurrentTheme = (): Theme =>
  document.documentElement.classList.contains("dark") ? "dark" : "light";

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(readCurrentTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  const toggleTheme = useCallback(() => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    storage.set(THEME_STORAGE_KEY, next);
    setTheme(next);
  }, [theme]);

  return { theme, toggleTheme };
};
