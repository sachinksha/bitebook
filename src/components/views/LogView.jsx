import { useState, useCallback, useMemo } from "react";
import { THEME } from "../../styles/theme.js";
import { today, addDays, fmtShort, fmtLong } from "../../utils/dateUtils.js";
import { useApp, useToastCtx, useMealCtx } from "../../context/contexts.js";
import { Card, SectionHeading, Btn } from "../primitives/index.js";
import { MealCard, RecentMealsPanel } from "../features/index.js";
import "./LogView.css";

export function LogView() {
  const { data, saveMeal } = useApp();
  const { show } = useToastCtx();
  const { context, resetContext } = useMealCtx();
  const [logDate, setLogDate] = useState(today());
  const [dragOverMeal, setDragOverMeal] = useState(null);

  const existing = useMemo(() => {
    const m = {};
    data.filter((r) => r.date === logDate).forEach((r) => (m[r.meal] = r));
    return m;
  }, [data, logDate]);

  const handleSave = useCallback(
    (entry) => {
      saveMeal({ ...entry, date: logDate });
      show(`${entry.meal} saved for ${fmtShort(logDate)}`);
    },
    [logDate, saveMeal, show]
  );

  const handleDragOver = (e, meal) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setDragOverMeal(meal);
  };

  const handleDrop = (e, meal) => {
    e.preventDefault();
    setDragOverMeal(null);
    try {
      const data = JSON.parse(
        e.dataTransfer.getData("application/json")
      );
      if (data.dish) {
        const entryType = data.type || "Ordered";
        const entry = {
          meal,
          type: entryType,
          dish: data.dish || "",
          preparedBy: data.preparedBy || "",
          madeByType: data.madeByType || (entryType === "Ordered" ? "restaurant" : "person"),
          orderType: data.orderType || "dine-in",
        };
        handleSave(entry);
      }
    } catch (err) {
      console.error("Drop error:", err);
    }
  };

  return (
    <Card>
      <SectionHeading
        icon="📝"
        iconBg={THEME.color.sagePale}
        aside={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <Btn
              size="sm"
              variant="ghost"
              onClick={() => setLogDate((d) => addDays(d, -1))}
            >
              ←
            </Btn>
            <input
              type="date"
              value={logDate}
              onChange={(e) => setLogDate(e.target.value)}
              style={{
                width: 145,
                padding: "8px 12px",
                border: `1.5px solid ${THEME.color.border}`,
                borderRadius: "12px",
                fontSize: "16px",
              }}
            />
            <Btn
              size="sm"
              variant="ghost"
              onClick={() => setLogDate((d) => addDays(d, 1))}
            >
              →
            </Btn>
          </div>
        }
      >
        Log Meals
      </SectionHeading>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        <span
          style={{
            fontSize: 16,
            color: THEME.color.inkMuted,
          }}
        >
          {logDate === today() ? "📅 Today" : `📅 ${fmtLong(logDate)}`}
        </span>
        {logDate !== today() && (
          <Btn
            size="sm"
            variant="ghost"
            onClick={() => setLogDate(today())}
            style={{ fontSize: 16 }}
          >
            ↩ Today
          </Btn>
        )}
      </div>

      {/* Sticky Context Display */}
      {context.mealType && (
        <div className="log-view-context-banner">
          <span className="log-view-context-label">Context Active:</span>
          <span className="log-view-context-value">
            {context.mealType}
            {context.madeByType === "restaurant" ? " 🏪" : " 🧑"}
            {context.orderType === "delivery" ? " 📦" : " 🍽"}
          </span>
          <Btn size="sm" variant="ghost" onClick={resetContext}>
            Clear
          </Btn>
        </div>
      )}

      {/* Recent Meals Panel with Drag & Drop */}
      <RecentMealsPanel meals={data} />

      {/* Meal Cards with Drop Zones */}
      <div className="log-view-meal-cards">
        {["Breakfast", "Lunch", "Dinner"].map((meal) => (
          <div
            key={meal}
            className={`log-view-drop-zone ${dragOverMeal === meal ? "drag-over" : ""}`}
            onDragOver={(e) => handleDragOver(e, meal)}
            onDragLeave={() => setDragOverMeal(null)}
            onDrop={(e) => handleDrop(e, meal)}
          >
            <MealCard
              meal={meal}
              existing={existing[meal]}
              onSave={handleSave}
            />
          </div>
        ))}
      </div>
    </Card>
  );
}
