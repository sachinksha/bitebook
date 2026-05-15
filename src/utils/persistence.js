const KEY = "bitebook_v3";

export const loadData = () => {
  try {
    const data = JSON.parse(
      localStorage.getItem(KEY) ||
        localStorage.getItem("bitebook_v2") ||
        localStorage.getItem("foodData") ||
        "[]"
    );
    // Migrate old entries to include new fields
    const migrated = migrateData(data);
    // Only persist if migration actually changed something
    if (JSON.stringify(data) !== JSON.stringify(migrated)) {
      persistData(migrated);
    }
    return migrated;
  } catch {
    return [];
  }
};

/**
 * Migrate old entries to include madeByType and orderType fields
 * - madeByType: 'person' | 'restaurant'
 * - orderType: 'delivery' | 'dine-in'
 * These fields only apply to 'Ordered' meals; Home and Skipped entries ignore them.
 */
export const migrateData = (data) => {
  return data.map((entry) => ({
    ...entry,
    madeByType: entry.madeByType || "person",
    orderType: entry.orderType || "dine-in",
  }));
};

export const persistData = (data) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // Ignore write failures when localStorage is unavailable
  }
};
