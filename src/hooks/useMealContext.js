import { useState, useCallback, useEffect } from "react";

/**
 * Sticky meal context state
 * Persists in sessionStorage (session-only, resets on page refresh)
 * Tracks: mealType (Breakfast/Lunch/Dinner), madeByType (person/restaurant), orderType (delivery/dine-in)
 */
export function useMealContext() {
  const STORAGE_KEY = "bitebook_mealContext";

  const [context, setContextState] = useState(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      return stored
        ? JSON.parse(stored)
        : {
            mealType: null,
            madeByType: "person",
            orderType: "dine-in",
          };
    } catch {
      return {
        mealType: null,
        madeByType: "person",
        orderType: "dine-in",
      };
    }
  });

  const setContext = useCallback((partial) => {
    setContextState((prev) => {
      const next = { ...prev, ...partial };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const resetContext = useCallback(() => {
    const empty = {
      mealType: null,
      madeByType: "person",
      orderType: "dine-in",
    };
    setContextState(empty);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(empty));
  }, []);

  return { context, setContext, resetContext };
}
