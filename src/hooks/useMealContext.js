import { useState, useCallback } from "react";

/**
 * Sticky meal context state
 * Persists in sessionStorage (session-only, resets on page refresh)
 * Tracks: mealType (Breakfast/Lunch/Dinner), madeByType (person/restaurant), orderType (delivery/dine-in)
 */
export function useMealContext() {
  const STORAGE_KEY = "bitebook_mealContext";

  const readStorage = () => {
    try {
      return sessionStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  };

  const writeStorage = (value) => {
    try {
      sessionStorage.setItem(STORAGE_KEY, value);
    } catch {
      // Ignore storage failures on restricted browsers/devices
    }
  };

  const emptyContext = {
    mealType: null,
    madeByType: "person",
    orderType: "dine-in",
  };

  const [context, setContextState] = useState(() => {
    const stored = readStorage();
    return stored ? JSON.parse(stored) : emptyContext;
  });

  const setContext = useCallback((partial) => {
    setContextState((prev) => {
      const next = { ...prev, ...partial };
      writeStorage(JSON.stringify(next));
      return next;
    });
  }, []);

  const resetContext = useCallback(() => {
    setContextState(emptyContext);
    writeStorage(JSON.stringify(emptyContext));
  }, []);

  return { context, setContext, resetContext };
}
