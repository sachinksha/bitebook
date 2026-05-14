export function InsightChip({ emoji, label, value, sub, bg, accent }) {
  return (
    <div
      className="bb-insight-chip"
      style={{ background: bg, borderColor: `${accent}40` }}
    >
      <div className="bb-insight-chip-label" style={{ color: accent }}>{emoji} {label}</div>
      <div className="bb-insight-chip-value">{value || "—"}</div>
      <div className="bb-insight-chip-sub">{sub}</div>
    </div>
  );
}
