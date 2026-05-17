import { THEME } from "../../styles/theme.js";
import "./InsightChip.css";

export function InsightChip({ emoji, label, value, sub, bg, accent }) {
  return (
    <div className="insight-chip" style={{ background: bg, borderColor: accent + "33" }}>
      <div className="insight-chip-label">
        {emoji} {label}
      </div>
      <div className="insight-chip-value">{value || "—"}</div>
      <div className="insight-chip-sub">{sub}</div>
    </div>
  );
}
