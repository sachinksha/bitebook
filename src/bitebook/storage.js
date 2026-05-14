import { KEY, READ_KEYS } from "./constants.js";
import { normalizeEntry } from "./normalize.js";

export function loadData() {
  try {
    let raw = null;
    for (const k of READ_KEYS) {
      const v = localStorage.getItem(k);
      if (v) { raw = v; break; }
    }
    const arr = JSON.parse(raw || "[]");
    if (!Array.isArray(arr)) return [];
    return arr.map(normalizeEntry).filter(Boolean);
  } catch {
    return [];
  }
}

export const persist = d => localStorage.setItem(KEY, JSON.stringify(d));
