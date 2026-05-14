import { useMemo, useState } from "react";
import { fmtShort, fmtWday, today } from "../dates.js";
import { useApp } from "../context.jsx";
import { T } from "../theme.js";
import {
  Btn,
  CalendarCell,
  Card,
  SectionHeading,
  TableTh,
} from "../uiPrimitives.jsx";

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
    data.forEach(r => { if (!m[r.date]) m[r.date] = {}; m[r.date][r.meal] = r; });
    return m;
  }, [data]);

  return (
    <Card>
      <SectionHeading
        icon="🗓"
        iconBg={T.color.amberPale}
        aside={(
          <div className="bb-data-actions" style={{ marginBottom: 0 }}>
            <Btn size="sm" onClick={() => setOffset(o => o + 14)}>← Earlier</Btn>
            <Btn size="sm" onClick={() => setOffset(o => Math.max(0, o - 14))}>Later →</Btn>
            <Btn size="sm" variant="primary" onClick={() => setOffset(0)}>Today</Btn>
          </div>
        )}
      >
        Last 2 Weeks
      </SectionHeading>

      <div className="bb-table-wrap">
        <table className="bb-table">
          <thead><tr>
            <TableTh ch="Date" />
            <TableTh ch="🌅 Breakfast" />
            <TableTh ch="☀️ Lunch" />
            <TableTh ch="🌙 Dinner" />
          </tr></thead>
          <tbody>
            {days.map(ds => {
              const isToday = ds === today();
              const e = byDate[ds] || {};
              return (
                <tr key={ds} className={`bb-tr ${isToday ? "bb-tr--today" : ""}`.trim()}>
                  <td className={`bb-td bb-td-date ${isToday ? "bb-td-date--today" : ""}`.trim()}>
                    {fmtWday(ds)}, {fmtShort(ds)}
                    {isToday && <span className="bb-today-dot" />}
                  </td>
                  {["Breakfast", "Lunch", "Dinner"].map(m => (
                    <td key={m} className="bb-td">
                      <CalendarCell e={e[m]} />
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
