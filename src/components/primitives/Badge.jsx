import { THEME } from "../../styles/theme.js";
import "./Badge.css";

export function Badge({ type }) {
  const m = {
    Home: {
      bg: THEME.color.sagePale,
      color: THEME.color.sage,
      label: "🏠 Home",
    },
    Ordered: {
      bg: THEME.color.amberPale,
      color: THEME.color.amber,
      label: "🛵 Ordered",
    },
    Skipped: {
      bg: THEME.color.creamDark,
      color: THEME.color.inkMuted,
      label: "⏭ Skipped",
    },
  }[type] || {};

  return (
    <span className="badge">
      {m.label}
    </span>
  );
}
