import { useMemo } from "react";
import {
  PREPARED_RESTAURANT,
  SERVICE_DELIVERY,
} from "./constants.js";
import { T } from "./theme.js";

export function Datalists({ dishes, persons, restaurants }) {
  const mergedPrepared = useMemo(() => [...new Set([...persons, ...restaurants])], [persons, restaurants]);
  return (
    <>
      <datalist id="bb-dishes">{dishes.map(d => <option key={d} value={d} />)}</datalist>
      <datalist id="bb-persons">{persons.map(p => <option key={p} value={p} />)}</datalist>
      <datalist id="bb-restaurants">{restaurants.map(p => <option key={p} value={p} />)}</datalist>
      <datalist id="bb-prepared-by">{mergedPrepared.map(p => <option key={p} value={p} />)}</datalist>
    </>
  );
}

export function Card({ children, className = "" }) {
  return <div className={`bb-card ${className}`.trim()}>{children}</div>;
}

export function SectionHeading({ icon, iconBg, children, aside }) {
  return (
    <div className="bb-section-heading">
      <div className="bb-section-head-left">
        <span className="bb-section-icon" style={{ background: iconBg || T.color.sagePale }}>{icon}</span>
        <span className="bb-section-title">{children}</span>
      </div>
      {aside && <div>{aside}</div>}
    </div>
  );
}

export function Btn({ children, onClick, variant = "default", size = "md", full, disabled, className = "", title, type = "button" }) {
  const mods = [
    "bb-btn",
    variant === "primary" && "bb-btn--primary",
    variant === "ghost" && "bb-btn--ghost",
    variant === "danger" && "bb-btn--danger",
    variant === "default" && "bb-btn--default",
    size === "sm" && "bb-btn--sm",
    size === "lg" && "bb-btn--lg",
    full && "bb-btn--full",
    className,
  ].filter(Boolean).join(" ");
  return (
    <button type={type} className={mods} onClick={onClick} disabled={disabled} title={title}>
      {children}
    </button>
  );
}

export function Inp({ list, className = "", ...props }) {
  return <input list={list} className={`bb-input ${className}`.trim()} {...props} />;
}

export function Sel({ className = "", ...props }) {
  return <select className={`bb-select ${className}`.trim()} {...props} />;
}

export function FieldLabel({ children }) {
  return <label className="bb-field-label">{children}</label>;
}

export function Field({ label, children, className = "" }) {
  return (
    <div className={`bb-field ${className}`.trim()}>
      <FieldLabel>{label}</FieldLabel>
      {children}
    </div>
  );
}

export function Badge({ type }) {
  const m = {
    Home:    { cls: "bb-badge--home",    label: "🏠 Home" },
    Ordered: { cls: "bb-badge--ordered", label: "🛵 Ordered" },
    Skipped: { cls: "bb-badge--skipped", label: "⏭ Skipped" },
  }[type] || { cls: "", label: type };
  return <span className={`bb-badge ${m.cls}`.trim()}>{m.label}</span>;
}

export function ProviderKindBadge({ kind }) {
  const isR = kind === PREPARED_RESTAURANT;
  return (
    <span className={`bb-badge ${isR ? "bb-badge--restaurant" : "bb-badge--person"}`}>
      {isR ? "🏪 Restaurant" : "👤 Person"}
    </span>
  );
}

export function ServiceBadge({ serviceType }) {
  const isDel = serviceType === SERVICE_DELIVERY;
  return (
    <span className={`bb-badge ${isDel ? "bb-badge--delivery" : "bb-badge--dine-in"}`}>
      {isDel ? "🚚 Delivery" : "🍽 Dine-in"}
    </span>
  );
}

export function TypePills({ value, onChange }) {
  const pills = [
    { key: "Home",    label: "🏠 Home",  mod: "home" },
    { key: "Ordered", label: "🛵 Order", mod: "ordered" },
    { key: "Skipped", label: "⏭ Skip",  mod: "skipped" },
  ];
  return (
    <div className="bb-type-pills">
      {pills.map(p => {
        const on = value === p.key;
        return (
          <button
            key={p.key}
            type="button"
            onClick={() => onChange(p.key)}
            className={`bb-type-pill bb-type-pill--${p.mod} ${on ? "bb-type-pill--on" : ""}`.trim()}
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );
}

export function MiniTogglePills({ options, value, onChange }) {
  return (
    <div className="bb-mini-pills">
      {options.map(o => (
        <button
          key={o.key}
          type="button"
          className={`bb-mini-pill ${value === o.key ? "bb-mini-pill--on" : ""}`.trim()}
          onClick={() => onChange(o.key)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Modal({ title, onClose, children }) {
  return (
    <div className="bb-modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()} role="presentation">
      <div className="bb-modal-panel">
        <div className="bb-modal-head">
          <span className="bb-modal-title">{title}</span>
          <button type="button" className="bb-modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Toast({ toast }) {
  if (!toast) return null;
  const isErr = toast.variant === "error";
  return (
    <div key={toast.id} className={`bb-toast ${isErr ? "bb-toast--err" : "bb-toast--ok"}`}>
      {toast.msg}
    </div>
  );
}

export function EmptyState({ icon, msg }) {
  return (
    <div className="bb-empty">
      <div className="bb-empty-icon">{icon}</div>
      <div className="bb-empty-msg">{msg}</div>
    </div>
  );
}

export function Divider() {
  return <div className="bb-divider" />;
}

export function TableTh({ ch, sticky }) {
  return <th className={sticky ? "bb-th bb-th--sticky" : "bb-th"}>{ch}</th>;
}

export function InsightChartBox({ title, children }) {
  return (
    <div className="bb-chart-box">
      <div className="bb-chart-box-title">{title}</div>
      {children}
    </div>
  );
}

export function CalendarCell({ e }) {
  if (!e) return <span className="bb-parchment">—</span>;
  if (e.type === "Skipped") return <Badge type="Skipped" />;
  return (
    <div>
      <Badge type={e.type} />
      {e.type === "Ordered" && (
        <span className="bb-muted" style={{ marginLeft: 6 }}>
          <ServiceBadge serviceType={e.serviceType} />
        </span>
      )}
      {e.dish && <div className="bb-muted" style={{ marginTop: 4, color: "var(--bb-ink-soft)" }}>{e.dish}</div>}
      {e.preparedBy && (
        <div style={{ marginTop: 4, display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
          <span className="bb-muted">{e.preparedBy}</span>
          <ProviderKindBadge kind={e.preparedByKind} />
        </div>
      )}
    </div>
  );
}
