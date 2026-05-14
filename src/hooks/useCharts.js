import { useRef, useCallback, useEffect } from "react";

export function useCharts() {
  const inst = useRef({});

  const build = useCallback((key, el, type, data, options) => {
    if (!el || !window.Chart) return;
    if (inst.current[key]) inst.current[key].destroy();
    inst.current[key] = new window.Chart(el, { type, data, options });
  }, []);

  useEffect(
    () => () =>
      Object.values(inst.current).forEach((c) => c.destroy()),
    []
  );

  return build;
}
