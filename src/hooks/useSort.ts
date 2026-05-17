import { useMemo } from "react";

const MEAL_ORDER = { Breakfast: 0, Lunch: 1, Dinner: 2 };

export function useSort(data, sortConfig) {
  return useMemo(() => {
    if (!sortConfig || !sortConfig.field) return data;

    const sorted = [...data];
    const { field, direction } = sortConfig;
    const isAsc = direction === "asc";

    sorted.sort((a, b) => {
      let compareResult: number;

      switch (field) {
        case "date": {
          // Sort by date (ISO string comparison works for YYYY-MM-DD format)
          compareResult = new Date(a.date) - new Date(b.date);
          break;
        }

        case "mealType": {
          // Sort by meal type (Breakfast -> Lunch -> Dinner)
          compareResult =
            (MEAL_ORDER[a.meal] || 9) - (MEAL_ORDER[b.meal] || 9);
          break;
        }

        case "madeBy": {
          // Sort by prepared-by person/restaurant name
          const aPrepared = (a.preparedBy || "").toLowerCase();
          const bPrepared = (b.preparedBy || "").toLowerCase();
          compareResult = aPrepared.localeCompare(bPrepared);
          break;
        }

        case "dish": {
          // Sort by dish name alphabetically
          const aDish = (a.dish || "").toLowerCase();
          const bDish = (b.dish || "").toLowerCase();
          compareResult = aDish.localeCompare(bDish);
          break;
        }

        default: {
          compareResult = 0;
        }
      }

      return isAsc ? compareResult : -compareResult;
    });

    return sorted;
  }, [data, sortConfig]);
}
