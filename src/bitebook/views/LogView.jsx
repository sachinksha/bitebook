import { useCallback, useMemo, useState } from "react";
import { addDays, fmtLong, fmtShort, today } from "../dates.js";
import { useApp, useToastCtx } from "../context.jsx";
import { LogChipBank } from "../drag.jsx";
import { MealCard } from "../MealCard.jsx";
import { T } from "../theme.js";
import {
  Btn,
  Card,
  Inp,
  MiniTogglePills,
  SectionHeading,
} from "../uiPrimitives.jsx";

export function LogView() {
  const { data, saveMeal, suggestions } = useApp();
  const { show } = useToastCtx();
  const [logDate, setLogDate] = useState(today());
  const [logDropScope, setLogDropScope] = useState("any");

  const existing = useMemo(() => {
    const m = {};
    data.filter(r => r.date === logDate).forEach(r => { m[r.meal] = r; });
    return m;
  }, [data, logDate]);

  const handleSave = useCallback(entry => {
    saveMeal({ ...entry, date: logDate });
    show(`${entry.meal} saved for ${fmtShort(logDate)}`);
  }, [logDate, saveMeal, show]);

  const scopeOptions = [
    { key: "any", label: "Any meal" },
    { key: "Breakfast", label: "🌅 Breakfast" },
    { key: "Lunch", label: "☀️ Lunch" },
    { key: "Dinner", label: "🌙 Dinner" },
  ];

  return (
    <Card>
      <SectionHeading
        icon="📝"
        iconBg={T.color.sagePale}
        aside={(
          <div className="bb-date-nav">
            <Btn size="sm" variant="ghost" onClick={() => setLogDate(d => addDays(d, -1))}>←</Btn>
            <Inp type="date" className="bb-input--date-narrow" value={logDate} onChange={e => setLogDate(e.target.value)} />
            <Btn size="sm" variant="ghost" onClick={() => setLogDate(d => addDays(d, 1))}>→</Btn>
          </div>
        )}
      >
        Log Meals
      </SectionHeading>

      <div className="bb-log-date-row">
        <span className="bb-log-date-label">
          {logDate === today() ? "📅 Today" : `📅 ${fmtLong(logDate)}`}
        </span>
        {logDate !== today() && (
          <Btn size="sm" variant="ghost" onClick={() => setLogDate(today())}>↩ Today</Btn>
        )}
      </div>

      <div className="bb-log-context">
        <div className="bb-log-context-title">Drag & drop context</div>
        <div className="bb-log-context-row">
          <span className="bb-field-label" style={{ marginBottom: 0, marginRight: 4 }}>Drop targets</span>
          <MiniTogglePills options={scopeOptions} value={logDropScope} onChange={setLogDropScope} />
        </div>
        <p className="bb-log-context-hint">
          Drag a chip from below onto a meal&apos;s Dish or By field. When a single meal is selected, only that card accepts drops.
        </p>
        <LogChipBank suggestions={suggestions} />
      </div>

      <div className="bb-grid-meals">
        {["Breakfast", "Lunch", "Dinner"].map(meal => (
          <MealCard
            key={[
              logDate,
              meal,
              existing[meal]?.type,
              existing[meal]?.dish,
              existing[meal]?.preparedBy,
              existing[meal]?.preparedByKind,
              existing[meal]?.serviceType,
            ].join("|")}
            meal={meal}
            existing={existing[meal]}
            onSave={handleSave}
            logDropScope={logDropScope}
          />
        ))}
      </div>
    </Card>
  );
}
