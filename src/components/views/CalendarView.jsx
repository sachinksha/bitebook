import { useState, useMemo } from "react";
import { THEME } from "../../styles/theme.js";
import { today, fmtWday, fmtShort, addDays } from "../../utils/dateUtils.js";
import { MEAL_ORDER } from "../../utils/dateUtils.js";
import { useApp } from "../../context/contexts.js";
import { Card, SectionHeading, Btn, Badge } from "../primitives/index.js";
import "./CalendarView.css";

export function CalendarView() {
  const { data } = useApp();
  const [offset, setOffset] = useState(0);

  const days = useMemo(() => {
    const end = new Date();
    end.setDate(end.getDate() - offset);
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date(end);
      d.setDate(d.getDate() - 13 + i);
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

  const Cell = ({ e }) => {
    if (!e) return <span style={{ color: THEME.color.parchment }}>—</span>;
    if (e.type === "Skipped") return <Badge type="Skipped" />;
    return (
      <div>
        <Badge type={e.type} />
        {e.dish && (
          <div
            style={{
              fontSize: 16,
              color: THEME.color.inkSoft,
              marginTop: 3,
            }}
          >
            {e.dish}
          </div>
        )}
        {e.preparedBy && (
          <div
            style={{
              fontSize: 16,
              color: THEME.color.inkMuted,
              marginTop: 1,
            }}
          >
            {e.preparedBy}
            {e.type === "Ordered" && (
              <span style={{ marginLeft: 4 }}>
                {e.madeByType === "restaurant" ? "🏪" : "🧑"}
                {e.orderType === "delivery" ? "📦" : "🍽"}
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  const TH = ({ ch }) => (
    <th className="calendar-th">{ch}</th>
  );

  return (
    <Card>
      <SectionHeading
        icon="🗓"
        iconBg={THEME.color.amberPale}
        aside={
          <div
            style={{
              display: "flex",
              gap: 6,
              flexWrap: "wrap",
            }}
          >
            <Btn size="sm" onClick={() => setOffset((o) => o + 14)}>
              ← Earlier
            </Btn>
            <Btn
              size="sm"
              onClick={() => setOffset((o) => Math.max(0, o - 14))}
            >
              Later →
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
        Last 2 Weeks
      </SectionHeading>

      <div className="calendar-table-container">
        <table className="calendar-table">
          <thead>
            <tr>
              <TH ch="Date" />
              <TH ch="🌅 Breakfast" />
              <TH ch="☀️ Lunch" />
              <TH ch="🌙 Dinner" />
            </tr>
          </thead>
          <tbody>
            {days.map((ds, i) => {
              const isToday = ds === today();
              const e = byDate[ds] || {};
              return (
                <tr
                  key={ds}
                  style={{
                    background: isToday
                      ? THEME.color.sagePale
                      : i % 2 === 0
                      ? THEME.color.white
                      : THEME.color.cream,
                  }}
                >
                  <td className="calendar-date-cell"
                    style={{
                      fontWeight: isToday ? 600 : 400,
                      color: isToday ? THEME.color.sage : THEME.color.ink,
                    }}
                  >
                    {fmtWday(ds)}, {fmtShort(ds)}
                    {isToday && (
                      <span
                        style={{
                          marginLeft: 6,
                          display: "inline-block",
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: THEME.color.sage,
                          verticalAlign: "middle",
                        }}
                      />
                    )}
                  </td>
                  {["Breakfast", "Lunch", "Dinner"].map((m) => (
                    <td key={m} className="calendar-meal-cell">
                      <Cell e={e[m]} />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
