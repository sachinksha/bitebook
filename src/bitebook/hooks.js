import {
  useState, useEffect, useCallback, useMemo, useRef,
} from "react";
import { PREPARED_RESTAURANT } from "./constants.js";
import { normalizeEntry } from "./normalize.js";
import { loadData, persist } from "./storage.js";

export function useFoodData() {
  const [data, setData] = useState(loadData);

  const _commit = useCallback(fn => {
    setData(prev => { const next = fn(prev); persist(next); return next; });
  }, []);

  const saveMeal = useCallback(entry =>
    _commit(prev => [...prev.filter(r => !(r.date === entry.date && r.meal === entry.meal)), normalizeEntry(entry)]),
  [_commit]);

  const updateEntry = useCallback((idx, entry) =>
    _commit(prev => { const n = [...prev]; n[idx] = normalizeEntry(entry); return n; }),
  [_commit]);

  const deleteEntry = useCallback(idx =>
    _commit(prev => prev.filter((_, i) => i !== idx)),
  [_commit]);

  const replaceAll = useCallback(rows => _commit(() => rows.map(normalizeEntry).filter(Boolean)), [_commit]);
  const clearAll   = useCallback(() => _commit(() => []), [_commit]);

  const suggestions = useMemo(() => {
    const dc = {}, persons = {}, restaurants = {};
    data.forEach(r => {
      if (r.dish) dc[r.dish] = (dc[r.dish] || 0) + 1;
      if (r.preparedBy) {
        if (r.preparedByKind === PREPARED_RESTAURANT) {
          restaurants[r.preparedBy] = (restaurants[r.preparedBy] || 0) + 1;
        } else {
          persons[r.preparedBy] = (persons[r.preparedBy] || 0) + 1;
        }
      }
    });
    const rank = obj => Object.keys(obj).sort((a, b) => obj[b] - obj[a]);
    const dRank = rank(dc), pRank = rank(persons), rRank = rank(restaurants);
    return {
      dishes: dRank, persons: pRank, restaurants: rRank,
      topDish: dRank[0] || "", topPerson: pRank[0] || "", topRestaurant: rRank[0] || "",
    };
  }, [data]);

  const streak = useMemo(() => {
    const logged = new Set(data.filter(r => r.type !== "Skipped").map(r => r.date));
    let n = 0, d = new Date();
    while (logged.has(d.toISOString().split("T")[0])) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }, [data]);

  return { data, saveMeal, updateEntry, deleteEntry, replaceAll, clearAll, suggestions, streak };
}

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

export function useCharts() {
  const inst = useRef({});
  const build = useCallback((key, el, type, data, options) => {
    if (!el || !window.Chart) return;
    if (inst.current[key]) inst.current[key].destroy();
    inst.current[key] = new window.Chart(el, { type, data, options });
  }, []);
  useEffect(() => () => Object.values(inst.current).forEach(c => c.destroy()), []);
  return build;
}
