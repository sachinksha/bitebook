import { useState } from "react";
import { THEME } from "../../styles/theme.js";
import "./RecentMealsPanel.css";

/**
 * Drag-and-drop panel showing recent meals
 * Allows dragging recent meal cards onto meal slots to auto-fill
 */
export function RecentMealsPanel({ meals, onDragStart }) {
  if (!meals || meals.length === 0) {
    return null;
  }

  const recentMeals = meals.slice(-10).reverse();

  return (
    <div className="recent-meals-panel">
      <div className="recent-meals-header">
        <span className="recent-meals-title">📜 Recent Meals (Drag to use)</span>
        <span className="recent-meals-count">{recentMeals.length} items</span>
      </div>
      <div className="recent-meals-grid">
        {recentMeals.map((meal, idx) => (
          <div
            key={`${meal.date}-${meal.meal}-${idx}`}
            className="recent-meal-card"
            draggable
            onDragStart={(e) => {
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
            }}
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
    </div>
  );
}
