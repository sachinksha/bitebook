import { useMemo, useState, useEffect } from "react";
import { THEME } from "../../styles/theme.js";
import "./RecentMealsPanel.css";

const PAGE_SIZE = 12;

/**
 * Drag-and-drop panel showing recent meals
 * Allows dragging recent meal cards onto meal slots to auto-fill
 */
export function RecentMealsPanel({ meals, onDragStart }) {
  if (!meals || meals.length === 0) {
    return null;
  }

  const uniqueMeals = useMemo(() => {
    const seen = new Set();
    const items = [];

    meals
      .slice()
      .reverse()
      .forEach((meal) => {
        const key = (meal.dish || "").trim().toLowerCase();
        if (!key || seen.has(key)) {
          return;
        }
        seen.add(key);
        items.push(meal);
      });

    return items;
  }, [meals]);

  const totalPages = Math.max(1, Math.ceil(uniqueMeals.length / PAGE_SIZE));
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (page >= totalPages) {
      setPage(totalPages - 1);
    }
  }, [page, totalPages]);

  const recentMeals = uniqueMeals.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  if (recentMeals.length === 0) {
    return null;
  }

  const handleCardDragStart = (e, meal) => {
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({
        dish: meal.dish,
        preparedBy: meal.preparedBy,
        madeByType: meal.madeByType,
        orderType: meal.orderType,
        type: meal.type,
      })
    );

    if (typeof onDragStart === "function") {
      onDragStart(e, meal);
    }
  };

  return (
    <div className="recent-meals-panel">
      <div className="recent-meals-header">
        <span className="recent-meals-title">📜 Recent Meals (Drag to use)</span>
        <span className="recent-meals-count">
          {uniqueMeals.length} unique items
        </span>
      </div>

      <div className="recent-meals-grid">
        {recentMeals.map((meal, idx) => (
          <div
            key={`${meal.dish}-${meal.meal}-${meal.date}-${idx}`}
            className="recent-meal-card"
            draggable
            onDragStart={(e) => handleCardDragStart(e, meal)}
            title={`${meal.meal} on ${meal.date}`}
          >
            <div className="recent-meal-label">
              {meal.meal === "Breakfast"
                ? "🌅"
                : meal.meal === "Lunch"
                ? "☀️"
                : "🌙"}
            </div>
            <div className="recent-meal-dish">
              {meal.dish || "No dish"}
            </div>
            <div className="recent-meal-by">
              {meal.preparedBy}
            </div>
            {meal.type === "Ordered" && (
              <div className="recent-meal-badges">
                {meal.madeByType === "restaurant" && (
                  <span className="badge-small">🏪</span>
                )}
                {meal.orderType === "delivery" && (
                  <span className="badge-small">📦</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="recent-meals-footer">
          <button
            type="button"
            className="recent-meals-page-btn"
            onClick={() => setPage((current) => Math.max(0, current - 1))}
            disabled={page === 0}
          >
            ← Previous
          </button>
          <span className="recent-meals-page-info">
            Page {page + 1} of {totalPages}
          </span>
          <button
            type="button"
            className="recent-meals-page-btn"
            onClick={() => setPage((current) => Math.min(totalPages - 1, current + 1))}
            disabled={page === totalPages - 1}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
