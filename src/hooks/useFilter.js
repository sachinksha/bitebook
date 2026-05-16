import { useMemo } from "react";

export function useFilter(data, filters) {
  return useMemo(() => {
    if (!filters) return data;

    return data.filter((entry) => {
      // Filter by meal type
      if (
        filters.mealType &&
        entry.meal !== filters.mealType
      ) {
        return false;
      }

      // Filter by made-by type
      if (
        filters.madeByType &&
        entry.madeByType !== filters.madeByType
      ) {
        return false;
      }

      // Filter by order type (only for "Ordered" meals)
      if (
        filters.orderType &&
        entry.type === "Ordered" &&
        entry.orderType !== filters.orderType
      ) {
        return false;
      }

      // Filter by food search (case-insensitive substring match)
      if (
        filters.foodSearch &&
        filters.foodSearch.trim().length > 0
      ) {
        const searchLower = filters.foodSearch.toLowerCase();
        if (!entry.dish || !entry.dish.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      return true;
    });
  }, [data, filters]);
}
