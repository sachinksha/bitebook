import { THEME } from "../../styles/theme.js";
import "./TypePills.css";

export function TypePills({ value, onChange }) {
  const pills = [
    {
      key: "Home",
      label: "🏠 Home",
      activeBg: THEME.color.sagePale,
      activeColor: THEME.color.sage,
      activeBorder: THEME.color.sageMid,
    },
    {
      key: "Ordered",
      label: "🛵 Order",
      activeBg: THEME.color.amberPale,
      activeColor: "#92400e",
      activeBorder: "#f5c842",
    },
    {
      key: "Skipped",
      label: "⏭ Skip",
      activeBg: THEME.color.creamDark,
      activeColor: THEME.color.inkMuted,
      activeBorder: THEME.color.parchment,
    },
  ];

  return (
    <div className="type-pills">
      {pills.map((p) => {
        const on = value === p.key;
        return (
          <button
            key={p.key}
            className={`type-pill ${on ? "type-pill-active" : ""}`}
            onClick={() => onChange(p.key)}
            style={{
              borderColor: on ? p.activeBorder : THEME.color.border,
              background: on ? p.activeBg : THEME.color.white,
              color: on ? p.activeColor : THEME.color.inkMuted,
            }}
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );
}
