import { chipDragRef, DRAG_TYPE } from "./constants.js";

export function DraggableChip({ kind, label }) {
  const payload = { app: "bitebook", kind, value: label };
  const onDragStart = e => {
    chipDragRef.current = payload;
    e.dataTransfer.setData(DRAG_TYPE, JSON.stringify(payload));
    e.dataTransfer.setData("text/plain", JSON.stringify(payload));
    e.dataTransfer.effectAllowed = "copy";
  };
  const onDragEnd = () => {
    chipDragRef.current = null;
  };
  const cls =
    kind === "dish" ? "bb-drag-chip--dish"
    : kind === "restaurant" ? "bb-drag-chip--restaurant"
    : "bb-drag-chip--person";
  return (
    <span
      draggable
      className={`bb-drag-chip ${cls}`}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      title="Drag onto a meal card field"
    >
      {label}
    </span>
  );
}

export function LogChipBank({ suggestions }) {
  const top = (arr, n) => arr.slice(0, n);
  const d = top(suggestions.dishes, 14);
  const p = top(suggestions.persons, 10);
  const r = top(suggestions.restaurants, 10);
  return (
    <div className="bb-chip-bank">
      <div className="bb-chip-bank-label">Dishes — drop on Dish</div>
      <div className="bb-log-context-row">
        {d.length === 0 && <span className="bb-muted">Log meals to build suggestions</span>}
        {d.map(name => <DraggableChip key={`d-${name}`} kind="dish" label={name} />)}
      </div>
      <div className="bb-chip-bank-label">People — drop on By</div>
      <div className="bb-log-context-row">
        {p.length === 0 && <span className="bb-muted">—</span>}
        {p.map(name => <DraggableChip key={`p-${name}`} kind="person" label={name} />)}
      </div>
      <div className="bb-chip-bank-label">Restaurants — drop on By</div>
      <div className="bb-log-context-row">
        {r.length === 0 && <span className="bb-muted">—</span>}
        {r.map(name => <DraggableChip key={`r-${name}`} kind="restaurant" label={name} />)}
      </div>
    </div>
  );
}
