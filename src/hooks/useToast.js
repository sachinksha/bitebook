import { useState, useCallback, useRef } from "react";

export function useToast() {
  const [toast, setToast] = useState(null);
  const timer = useRef(null);

  const show = useCallback((msg, variant = "success") => {
    setToast({ msg, variant, id: Date.now() });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 2800);
  }, []);

  return { toast, show };
}
