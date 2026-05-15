import { useState, useMemo } from "react";
import { THEME } from "../../styles/theme.js";
import { today, fmtWday, fmtShort, addDays } from "../../utils/dateUtils.js";
import { MEAL_ORDER } from "../../utils/dateUtils.js";
import { useApp } from "../../context/contexts.js";
import { Card, SectionHeading, Btn, Badge } from "../primitives/index.js";
import "./CalendarView.css";

const MEAL_ICONS = { Breakfast: "🌅", Lunch: "☀️", Dinner: "🌙" };

export function CalendarView() {
  const { data } = useApp();
  const [offset, setOffset] = useState(0);

  const days = useMemo(() => {
    const end = new Date();
    end.setDate(end.getDate() - offset);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(end);
      d.setDate(d.getDate() - 6 + i);
      return d.toISOString().split("T")[0];
    });
  }, [offset]);

  const byDate = useMemo(() => {
    const m = {};
    data.forEach((r) => {
      if (!m[r.date]) m[r.date] = {};
      m[r.date][r.meal] = r;
    });
    return m;
  }, [data]);

  const MealCard = ({ entry, icon }) => {
    if (!entry) return null;
    if (entry.type === "Skipped") return <div className="calendar-meal-skipped">Skipped</div>;
    return (
      <div className="calendar-meal-info">
        <div className="calendar-meal-header">
          <span className="calendar-meal-icon">{icon}</span>
          <Badge type={entry.type} />
        </div>
        {entry.dish && <div className="calendar-meal-dish">{entry.dish}</div>}
        {entry.preparedBy && (
          <div className="calendar-meal-by">
            {entry.preparedBy}
            {entry.type === "Ordered" && (
              <span className="calendar-meal-icons">
                {entry.madeByType === "restaurant" ? "🏪" : "🧑"}
                {entry.orderType === "delivery" ? "📦" : "🍽"}
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <SectionHeading
        icon="🗓"
        iconBg={THEME.color.amberPale}
        aside={
          <div className="calendar-nav-buttons">
            <Btn size="sm" onClick={() => setOffset((o) => o + 7)}>
              ← Prev
            </Btn>
            <Btn
              size="sm"
              onClick={() => setOffset((o) => Math.max(0, o - 7))}
            >
              Next →
            </Btn>
            <Btn
              size="sm"
              variant="primary"
              onClick={() => setOffset(0)}
            >
              Today
            </Btn>
          </div>
        }
      >
        Weekly View
      </SectionHeading>

      <div className="calendar-grid">
        {days.map((ds) => {
          const isToday = ds === today();
          const meals = byDate[ds] || {};
          const mealCount = Object.keys(meals).length;
          return (
            <div key={ds} className={`calendar-day-card ${isToday ? "today" : ""}`}>
              <div className="calendar-day-header">
                <div className="calendar-day-date">
                  <div className="calendar-day-name">{fmtWday(ds).slice(0, 3)}</div>
                  <div className="calendar-day-num">{fmtShort(ds).split("/")[0]}</div>
                </div>
                <div className="calendar-day-summary">
                  {mealCount === 0 && <span className="calendar-no-meals">No meals</span>}
                  {mealCount > 0 && <span className="calendar-meal-count">{mealCount} logged</span>}
                </div>
              </div>
              <div className="calendar-day-meals">
                {["Breakfast", "Lunch", "Dinner"].map((meal) => (
                  <MealCard key={meal} entry={meals[meal]} icon={MEAL_ICONS[meal]} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
