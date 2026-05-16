import React, { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "bb-theme";

const ThemeContext = createContext({ theme: "system", setTheme: () => {} });

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || "system";
    } catch (e) {
      return "system";
    }
  });

  useEffect(() => {
    const apply = (t) => {
      const root = document.documentElement;
      if (t === "system") {
        const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
        root.setAttribute("data-theme", prefersDark ? "dark" : "light");
      } else {
        root.setAttribute("data-theme", t);
      }
    };

    apply(theme);

    // listen for system changes when in system mode
    let mql;
    const onChange = (e) => {
      if (theme === "system") {
        document.documentElement.setAttribute("data-theme", e.matches ? "dark" : "light");
      }
    };
    if (window.matchMedia) {
      mql = window.matchMedia("(prefers-color-scheme: dark)");
      try { mql.addEventListener('change', onChange); } catch (e) { mql.addListener(onChange); }
    }

    return () => {
      if (mql) {
        try { mql.removeEventListener('change', onChange); } catch (e) { mql.removeListener(onChange); }
      }
    };
  }, [theme]);

  const setTheme = (t) => {
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch (e) {}
    setThemeState(t);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export default ThemeProvider;
