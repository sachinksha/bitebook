import { useState, useCallback, useMemo, useEffect } from "react";
import { loadData, persistData } from "../utils/persistence.js";

export function useFoodData() {
  const [data, setData] = useState(loadData);

  const _commit = useCallback((fn) => {
    setData((prev) => {
      const next = fn(prev);
      persistData(next);
      return next;
    });
  }, []);

  const saveMeal = useCallback(
    (entry) =>
      _commit((prev) => [
        ...prev.filter(
          (r) => !(r.date === entry.date && r.meal === entry.meal)
        ),
        entry,
      ]),
    [_commit]
  );

  const updateEntry = useCallback(
    (idx, entry) =>
      _commit((prev) => {
        const n = [...prev];
        n[idx] = entry;
        return n;
      }),
    [_commit]
  );

  const deleteEntry = useCallback(
    (idx) =>
      _commit((prev) => prev.filter((_, i) => i !== idx)),
    [_commit]
  );

  const replaceAll = useCallback(
    (rows) => _commit(() => rows),
    [_commit]
  );

  const clearAll = useCallback(() => _commit(() => []), [_commit]);

  const suggestions = useMemo(() => {
    const dc = {},
      pc = {};
    data.forEach((r) => {
      if (r.dish) dc[r.dish] = (dc[r.dish] || 0) + 1;
      if (r.preparedBy)
        pc[r.preparedBy] = (pc[r.preparedBy] || 0) + 1;
    });
    const rank = (obj) =>
      Object.keys(obj).sort((a, b) => obj[b] - obj[a]);
    return {
      dishes: rank(dc),
      persons: rank(pc),
      topDish: rank(dc)[0] || "",
      topPerson: rank(pc)[0] || "",
    };
  }, [data]);

  const streak = useMemo(() => {
    const logged = new Set(
      data.filter((r) => r.type !== "Skipped").map((r) => r.date)
    );
    let n = 0,
      d = new Date();
    while (logged.has(d.toISOString().split("T")[0])) {
      n++;
      d.setDate(d.getDate() - 1);
    }
    return n;
  }, [data]);

  return {
    data,
    saveMeal,
    updateEntry,
    deleteEntry,
    replaceAll,
    clearAll,
    suggestions,
    streak,
  };
}
