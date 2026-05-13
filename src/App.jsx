
// ─────────────────────────────────────────────────────────────────────────────
// BiteBook — React App
// Architecture: Theme → Hooks → Primitives → Components → Views → App
// ─────────────────────────────────────────────────────────────────────────────

import {
  useState, useEffect, useCallback, useMemo, useRef, createContext, useContext,
} from "react";
import * as XLSX from "xlsx";
import Chart from "chart.js/auto";
window.XLSX = XLSX;
window.Chart = Chart;

// =============================================================================
// 1. THEME (Chart.js + inline accents still reference hex values)
// =============================================================================
const T = {
  font: { display: "'Source Sans 3', system-ui, sans-serif", body: "'Source Sans 3', system-ui, sans-serif" },
  color: {
    sage: "#3d6b50", sageMid: "#5a8f6e", sageLight: "#c8e6d4", sagePale: "#eef7f1",
    cream: "#faf8f3", creamDark: "#f0ece3", parchment: "#e4dfd5",
    terra: "#b85c38", terraPale: "#fceee8", amber: "#c47b1a", amberPale: "#fdf3e1",
    ink: "#1a1714", inkSoft: "#3a3330", inkMuted: "#7a7068",
    border: "#ddd8cf", borderLight: "#eae6df", white: "#ffffff",
  },
  r: { sm: "8px", md: "12px", lg: "16px", xl: "22px", full: "999px" },
  shadow: { sm: "0 1px 4px rgba(26,23,20,0.07)", md: "0 4px 16px rgba(26,23,20,0.10)", lg: "0 8px 32px rgba(26,23,20,0.15)" },
  meal: {
    Breakfast: { color: "#c47b1a", pale: "#fdf3e1", bar: "linear-gradient(90deg,#f59e0b,#fbbf24)" },
    Lunch:     { color: "#3d6b50", pale: "#eef7f1", bar: "linear-gradient(90deg,#3d6b50,#5a8f6e)" },
    Dinner:    { color: "#5b52c2", pale: "#eeedf9", bar: "linear-gradient(90deg,#5b52c2,#7c75d8)" },
  },
};

const PREPARED_PERSON = "person";
const PREPARED_RESTAURANT = "restaurant";
const SERVICE_DINE_IN = "dine-in";
const SERVICE_DELIVERY = "delivery";
const DRAG_TYPE = "application/x-bitebook-chip";
/** getData() is often empty during dragover; mirror payload for hit-testing. */
const chipDragRef = { current: null };

// =============================================================================
// 2. UTILITIES
// =============================================================================
const today    = () => new Date().toISOString().split("T")[0];
const addDays  = (s, n) => { const d = new Date(s); d.setDate(d.getDate() + n); return d.toISOString().split("T")[0]; };
const daysAgo  = n => addDays(today(), -n);
const fmtShort = s => { const d = new Date(s); return `${d.getDate()} ${d.toLocaleString("default",{month:"short"})}`; };
const fmtWday  = (s, short = true) => new Date(s).toLocaleDateString("en-IN", { weekday: short ? "short" : "long" });
const fmtLong  = s => new Date(s).toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long" });
const MEAL_ORDER = { Breakfast: 1, Lunch: 2, Dinner: 3 };

function normalizeEntry(raw) {
  if (!raw || typeof raw !== "object") return null;
  const type = ["Home", "Ordered", "Skipped"].includes(raw.type) ? raw.type : "Home";
  const preparedByKind = raw.preparedByKind === PREPARED_RESTAURANT ? PREPARED_RESTAURANT : PREPARED_PERSON;
  const serviceType = raw.serviceType === SERVICE_DELIVERY ? SERVICE_DELIVERY : SERVICE_DINE_IN;
  return {
    date: String(raw.date || "").trim(),
    meal: String(raw.meal || "").trim(),
    type,
    dish: String(raw.dish || "").trim(),
    preparedBy: String(raw.preparedBy || "").trim(),
    preparedByKind,
    serviceType,
  };
}

// =============================================================================
// 3. PERSISTENCE
// =============================================================================
const KEY = "bitebook_v4";
const READ_KEYS = ["bitebook_v4", "bitebook_v3", "bitebook_v2", "foodData"];

const loadData = () => {
  try {
    let raw = null;
    for (const k of READ_KEYS) {
      const v = localStorage.getItem(k);
      if (v) { raw = v; break; }
    }
    const arr = JSON.parse(raw || "[]");
    if (!Array.isArray(arr)) return [];
    return arr.map(normalizeEntry).filter(Boolean);
  } catch {
    return [];
  }
};
const persist = d => localStorage.setItem(KEY, JSON.stringify(d));

// =============================================================================
// 4. HOOKS
// =============================================================================

function useFoodData() {
  const [data, setData] = useState(loadData);

  const _commit = useCallback(fn => {
    setData(prev => { const next = fn(prev); persist(next); return next; });
  }, []);

  const saveMeal = useCallback(entry =>
    _commit(prev => [...prev.filter(r => !(r.date === entry.date && r.meal === entry.meal)), normalizeEntry(entry)]),
  [_commit]);

  const updateEntry = useCallback((idx, entry) =>
    _commit(prev => { const n = [...prev]; n[idx] = normalizeEntry(entry); return n; }),
  [_commit]);

  const deleteEntry = useCallback(idx =>
    _commit(prev => prev.filter((_, i) => i !== idx)),
  [_commit]);

  const replaceAll = useCallback(rows => _commit(() => rows.map(normalizeEntry).filter(Boolean)), [_commit]);
  const clearAll   = useCallback(() => _commit(() => []), [_commit]);

  const suggestions = useMemo(() => {
    const dc = {}, persons = {}, restaurants = {};
    data.forEach(r => {
      if (r.dish) dc[r.dish] = (dc[r.dish] || 0) + 1;
      if (r.preparedBy) {
        if (r.preparedByKind === PREPARED_RESTAURANT) {
          restaurants[r.preparedBy] = (restaurants[r.preparedBy] || 0) + 1;
        } else {
          persons[r.preparedBy] = (persons[r.preparedBy] || 0) + 1;
        }
      }
    });
    const rank = obj => Object.keys(obj).sort((a, b) => obj[b] - obj[a]);
    const dRank = rank(dc), pRank = rank(persons), rRank = rank(restaurants);
    return {
      dishes: dRank, persons: pRank, restaurants: rRank,
      topDish: dRank[0] || "", topPerson: pRank[0] || "", topRestaurant: rRank[0] || "",
    };
  }, [data]);

  const streak = useMemo(() => {
    const logged = new Set(data.filter(r => r.type !== "Skipped").map(r => r.date));
    let n = 0, d = new Date();
    while (logged.has(d.toISOString().split("T")[0])) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }, [data]);

  return { data, saveMeal, updateEntry, deleteEntry, replaceAll, clearAll, suggestions, streak };
}

// Toast manager
function useToast() {
  const [toast, setToast] = useState(null);
  const timer = useRef(null);
  const show = useCallback((msg, variant = "success") => {
    setToast({ msg, variant, id: Date.now() });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 2800);
  }, []);
  return { toast, show };
}

// Chart.js lifecycle manager
function useCharts() {
  const inst = useRef({});
  const build = useCallback((key, el, type, data, options) => {
    if (!el || !window.Chart) return;
    if (inst.current[key]) inst.current[key].destroy();
    inst.current[key] = new window.Chart(el, { type, data, options });
  }, []);
  useEffect(() => () => Object.values(inst.current).forEach(c => c.destroy()), []);
  return build;
}

// =============================================================================
// 5. CONTEXTS
// =============================================================================
const AppCtx   = createContext(null);
const ToastCtx = createContext(null);
const useApp   = () => useContext(AppCtx);
const useToastCtx = () => useContext(ToastCtx);

// =============================================================================
// 6. PRIMITIVES
// =============================================================================

function Datalists({ dishes, persons, restaurants }) {
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

function Card({ children, className = "" }) {
  return <div className={`bb-card ${className}`.trim()}>{children}</div>;
}

function SectionHeading({ icon, iconBg, children, aside }) {
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

function Btn({ children, onClick, variant = "default", size = "md", full, disabled, className = "", title, type = "button" }) {
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

function Inp({ list, className = "", ...props }) {
  return <input list={list} className={`bb-input ${className}`.trim()} {...props} />;
}

function Sel({ className = "", ...props }) {
  return <select className={`bb-select ${className}`.trim()} {...props} />;
}

function FieldLabel({ children }) {
  return <label className="bb-field-label">{children}</label>;
}

function Field({ label, children, className = "" }) {
  return (
    <div className={`bb-field ${className}`.trim()}>
      <FieldLabel>{label}</FieldLabel>
      {children}
    </div>
  );
}

function Badge({ type }) {
  const m = {
    Home:    { cls: "bb-badge--home",    label: "🏠 Home" },
    Ordered: { cls: "bb-badge--ordered", label: "🛵 Ordered" },
    Skipped: { cls: "bb-badge--skipped", label: "⏭ Skipped" },
  }[type] || { cls: "", label: type };
  return <span className={`bb-badge ${m.cls}`.trim()}>{m.label}</span>;
}

function ProviderKindBadge({ kind }) {
  const isR = kind === PREPARED_RESTAURANT;
  return (
    <span className={`bb-badge ${isR ? "bb-badge--restaurant" : "bb-badge--person"}`}>
      {isR ? "🏪 Restaurant" : "👤 Person"}
    </span>
  );
}

function ServiceBadge({ serviceType }) {
  const isDel = serviceType === SERVICE_DELIVERY;
  return (
    <span className={`bb-badge ${isDel ? "bb-badge--delivery" : "bb-badge--dine-in"}`}>
      {isDel ? "🚚 Delivery" : "🍽 Dine-in"}
    </span>
  );
}

function TypePills({ value, onChange }) {
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

function MiniTogglePills({ options, value, onChange }) {
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

function Modal({ title, onClose, children }) {
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

function Toast({ toast }) {
  if (!toast) return null;
  const isErr = toast.variant === "error";
  return (
    <div key={toast.id} className={`bb-toast ${isErr ? "bb-toast--err" : "bb-toast--ok"}`}>
      {toast.msg}
    </div>
  );
}

function EmptyState({ icon, msg }) {
  return (
    <div className="bb-empty">
      <div className="bb-empty-icon">{icon}</div>
      <div className="bb-empty-msg">{msg}</div>
    </div>
  );
}

function Divider() {
  return <div className="bb-divider" />;
}

function TableTh({ ch, sticky }) {
  return <th className={sticky ? "bb-th bb-th--sticky" : "bb-th"}>{ch}</th>;
}

function InsightChartBox({ title, children }) {
  return (
    <div className="bb-chart-box">
      <div className="bb-chart-box-title">{title}</div>
      {children}
    </div>
  );
}

function CalendarCell({ e }) {
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

function parseDragPayload(dt) {
  try {
    const s = dt.getData(DRAG_TYPE) || dt.getData("text/plain");
    if (!s) return null;
    const o = JSON.parse(s);
    if (!o || o.app !== "bitebook") return null;
    return o;
  } catch {
    return null;
  }
}

function readChipPayload(dt) {
  return parseDragPayload(dt) || chipDragRef.current;
}

function DraggableChip({ kind, label }) {
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

function LogChipBank({ suggestions }) {
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

// =============================================================================
// 7. FEATURE COMPONENTS
// =============================================================================

// ─── MealCard ─────────────────────────────────────────────────────────────────
function MealCard({ meal, existing, onSave, logDropScope }) {
  const mc = T.meal[meal];
  const icon = { Breakfast: "🌅", Lunch: "☀️", Dinner: "🌙" }[meal];
  const { suggestions } = useApp();

  const [type, setType] = useState(existing?.type || "Home");
  const [dish, setDish] = useState(existing?.dish || "");
  const [person, setPerson] = useState(existing?.preparedBy || "");
  const [preparedByKind, setPreparedByKind] = useState(existing?.preparedByKind || PREPARED_PERSON);
  const [serviceType, setServiceType] = useState(existing?.serviceType || SERVICE_DINE_IN);
  const [saved, setSaved] = useState(false);
  const [overDish, setOverDish] = useState(false);
  const [overBy, setOverBy] = useState(false);

  const allowDropHere = logDropScope === "any" || logDropScope === meal;

  const payloadValid = (p, field) => {
    if (!p) return false;
    if (field === "dish") return p.kind === "dish";
    if (field === "by") return p.kind === "person" || p.kind === "restaurant";
    return false;
  };

  const onDragOverZone = (e, field) => {
    if (!allowDropHere) return;
    const p = readChipPayload(e.dataTransfer);
    if (!payloadValid(p, field)) {
      e.dataTransfer.dropEffect = "none";
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";
    if (field === "dish") setOverDish(true);
    else setOverBy(true);
  };

  const onDragLeaveZone = (e, field) => {
    if (e.currentTarget.contains(e.relatedTarget)) return;
    if (field === "dish") setOverDish(false);
    else setOverBy(false);
  };

  const onDropZone = (e, field) => {
    setOverDish(false);
    setOverBy(false);
    if (!allowDropHere) return;
    e.preventDefault();
    e.stopPropagation();
    const p = readChipPayload(e.dataTransfer);
    chipDragRef.current = null;
    if (!payloadValid(p, field)) return;
    if (field === "dish") {
      setDish(String(p.value || ""));
      return;
    }
    setPerson(String(p.value || ""));
    setPreparedByKind(p.kind === "restaurant" ? PREPARED_RESTAURANT : PREPARED_PERSON);
  };

  const focused = logDropScope !== "any" && logDropScope === meal;
  const muted = logDropScope !== "any" && logDropScope !== meal;

  const handleSave = () => {
    onSave({
      meal,
      type,
      dish: type === "Skipped" ? "" : dish,
      preparedBy: type === "Skipped" ? "" : person,
      preparedByKind: type === "Skipped" ? PREPARED_PERSON : preparedByKind,
      serviceType: type === "Ordered" ? serviceType : SERVICE_DINE_IN,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  const cardClass = [
    "bb-meal-card",
    saved && "bb-meal-card--saved",
    focused && "bb-meal-card--context",
    muted && "bb-meal-card--context-muted",
  ].filter(Boolean).join(" ");

  return (
    <div
      className={cardClass}
      style={{ ["--bb-meal"]: mc.color, ["--bb-meal-bar"]: mc.bar }}
    >
      <div className="bb-meal-accent" />
      <div className="bb-meal-head">
        <span className="bb-meal-emoji">{icon}</span>
        <span className="bb-meal-name">{meal}</span>
        {saved ? (
          <span className="bb-meal-saved">✓ Saved</span>
        ) : existing ? (
          <span className="bb-meal-logged">Logged</span>
        ) : null}
      </div>

      <TypePills value={type} onChange={setType} />

      {type !== "Skipped" && (
        <>
          <div>
            <FieldLabel>Made by</FieldLabel>
            <MiniTogglePills
              value={preparedByKind}
              onChange={setPreparedByKind}
              options={[
                { key: PREPARED_PERSON, label: "👤 Person" },
                { key: PREPARED_RESTAURANT, label: "🏪 Restaurant" },
              ]}
            />
          </div>
          {type === "Ordered" && (
            <div>
              <FieldLabel>Order</FieldLabel>
              <MiniTogglePills
                value={serviceType}
                onChange={setServiceType}
                options={[
                  { key: SERVICE_DINE_IN, label: "🍽 Dine-in" },
                  { key: SERVICE_DELIVERY, label: "🚚 Delivery" },
                ]}
              />
            </div>
          )}
          <div className="bb-meal-fields">
            <div
              className={`bb-drop-field ${overDish ? "bb-drop-field--over" : ""}`.trim()}
              onDragOver={e => onDragOverZone(e, "dish")}
              onDragLeave={e => onDragLeaveZone(e, "dish")}
              onDrop={e => onDropZone(e, "dish")}
            >
              <FieldLabel>Dish</FieldLabel>
              <Inp
                list="bb-dishes"
                placeholder={suggestions.topDish || "e.g. Poha"}
                value={dish}
                onChange={e => setDish(e.target.value)}
                onDragOver={e => onDragOverZone(e, "dish")}
                onDragLeave={e => onDragLeaveZone(e, "dish")}
                onDrop={e => onDropZone(e, "dish")}
              />
            </div>
            <div
              className={`bb-drop-field ${overBy ? "bb-drop-field--over" : ""}`.trim()}
              onDragOver={e => onDragOverZone(e, "by")}
              onDragLeave={e => onDragLeaveZone(e, "by")}
              onDrop={e => onDropZone(e, "by")}
            >
              <FieldLabel>By</FieldLabel>
              <Inp
                list="bb-prepared-by"
                placeholder={
                  preparedByKind === PREPARED_RESTAURANT
                    ? suggestions.topRestaurant || "Restaurant"
                    : suggestions.topPerson || "Name"
                }
                value={person}
                onChange={e => setPerson(e.target.value)}
                onDragOver={e => onDragOverZone(e, "by")}
                onDragLeave={e => onDragLeaveZone(e, "by")}
                onDrop={e => onDropZone(e, "by")}
              />
            </div>
          </div>
        </>
      )}

      <Btn full className="bb-btn-meal-save" onClick={handleSave}>
        Save {meal}
      </Btn>
    </div>
  );
}

// ─── EditModal ─────────────────────────────────────────────────────────────────
function EditModal({ entry, idx, onSave, onDelete, onClose }) {
  const { suggestions } = useApp();
  const [date, setDate] = useState(entry.date);
  const [meal, setMeal] = useState(entry.meal);
  const [type, setType] = useState(entry.type);
  const [dish, setDish] = useState(entry.dish || "");
  const [person, setPerson] = useState(entry.preparedBy || "");
  const [preparedByKind, setPreparedByKind] = useState(entry.preparedByKind || PREPARED_PERSON);
  const [serviceType, setServiceType] = useState(entry.serviceType || SERVICE_DINE_IN);

  const buildPayload = () => ({
    date,
    meal,
    type,
    dish: type === "Skipped" ? "" : dish,
    preparedBy: type === "Skipped" ? "" : person,
    preparedByKind: type === "Skipped" ? PREPARED_PERSON : preparedByKind,
    serviceType: type === "Ordered" ? serviceType : SERVICE_DINE_IN,
  });

  return (
    <Modal title="Edit Entry" onClose={onClose}>
      <Field label="Date"><Inp type="date" value={date} onChange={e => setDate(e.target.value)} /></Field>
      <div className="bb-meal-fields">
        <Field label="Meal">
          <Sel value={meal} onChange={e => setMeal(e.target.value)}>
            <option>Breakfast</option>
            <option>Lunch</option>
            <option>Dinner</option>
          </Sel>
        </Field>
        <Field label="Type">
          <Sel value={type} onChange={e => setType(e.target.value)}>
            <option value="Home">🏠 Home</option>
            <option value="Ordered">🛵 Ordered</option>
            <option value="Skipped">⏭ Skipped</option>
          </Sel>
        </Field>
      </div>
      {type !== "Skipped" && (
        <>
          <Field label="Made by">
            <MiniTogglePills
              value={preparedByKind}
              onChange={setPreparedByKind}
              options={[
                { key: PREPARED_PERSON, label: "👤 Person" },
                { key: PREPARED_RESTAURANT, label: "🏪 Restaurant" },
              ]}
            />
          </Field>
          {type === "Ordered" && (
            <Field label="Order">
              <MiniTogglePills
                value={serviceType}
                onChange={setServiceType}
                options={[
                  { key: SERVICE_DINE_IN, label: "🍽 Dine-in" },
                  { key: SERVICE_DELIVERY, label: "🚚 Delivery" },
                ]}
              />
            </Field>
          )}
          <div className="bb-meal-fields">
            <Field label="Dish">
              <Inp list="bb-dishes" value={dish} onChange={e => setDish(e.target.value)} placeholder={suggestions.topDish} />
            </Field>
            <Field label="By">
              <Inp
                list="bb-prepared-by"
                value={person}
                onChange={e => setPerson(e.target.value)}
                placeholder={preparedByKind === PREPARED_RESTAURANT ? suggestions.topRestaurant : suggestions.topPerson}
              />
            </Field>
          </div>
        </>
      )}
      <Divider />
      <div className="bb-modal-actions">
        <Btn variant="primary" full onClick={() => onSave(idx, buildPayload())}>💾 Save</Btn>
        <Btn variant="danger" full onClick={() => onDelete(idx)}>🗑 Delete</Btn>
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
      </div>
    </Modal>
  );
}

// ─── InsightChip ──────────────────────────────────────────────────────────────
function InsightChip({ emoji, label, value, sub, bg, accent }) {
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

// =============================================================================
// 8. VIEWS
// =============================================================================

// ─── LogView ──────────────────────────────────────────────────────────────────
function LogView() {
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

// ─── CalendarView ─────────────────────────────────────────────────────────────
function CalendarView() {
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

// ─── HistoryView ──────────────────────────────────────────────────────────────
function HistoryView() {
  const { data, updateEntry, deleteEntry } = useApp();
  const { show } = useToastCtx();
  const [editIdx, setEditIdx] = useState(null);

  const sorted = useMemo(() =>
    [...data]
      .map((r, i) => ({ ...r, _i: i }))
      .sort((a, b) => a.date !== b.date ? new Date(b.date) - new Date(a.date) : (MEAL_ORDER[a.meal] || 9) - (MEAL_ORDER[b.meal] || 9)),
    [data]);

  const handleSave = (idx, entry) => { updateEntry(idx, entry); setEditIdx(null); show("Entry updated"); };
  const handleDel = idx => { if (!confirm("Delete this entry?")) return; deleteEntry(idx); setEditIdx(null); show("Deleted", "error"); };

  return (
    <>
      <Card>
        <SectionHeading
          icon="📋"
          iconBg={T.color.creamDark}
          aside={<span className="bb-count-pill">{data.length} entries</span>}
        >
          All Entries
        </SectionHeading>

        {data.length === 0
          ? <EmptyState icon="🍽️" msg="No entries yet — start logging your meals!" />
          : (
            <div className="bb-table-wrap bb-table-wrap--scroll">
              <table className="bb-table bb-table--narrow">
                <thead><tr>
                  <TableTh ch="Date" sticky />
                  <TableTh ch="Meal" sticky />
                  <TableTh ch="Type" sticky />
                  <TableTh ch="Dish" sticky />
                  <TableTh ch="By" sticky />
                  <TableTh ch="Provider" sticky />
                  <TableTh ch="Order" sticky />
                  <TableTh ch="" sticky />
                </tr></thead>
                <tbody>
                  {sorted.map(row => (
                    <tr key={`${row.date}-${row.meal}-${row._i}`} className="bb-tr">
                      <td className="bb-td bb-td-date">{fmtWday(row.date)}, {fmtShort(row.date)}</td>
                      <td className="bb-td" style={{ fontWeight: 500 }}>{row.meal}</td>
                      <td className="bb-td"><Badge type={row.type} /></td>
                      <td className="bb-td bb-ellipsis">
                        {row.dish || <span className="bb-parchment">—</span>}
                      </td>
                      <td className="bb-td bb-muted bb-ellipsis">
                        {row.preparedBy || <span className="bb-parchment">—</span>}
                      </td>
                      <td className="bb-td">
                        {row.type === "Skipped"
                          ? <span className="bb-parchment">—</span>
                          : <ProviderKindBadge kind={row.preparedByKind} />}
                      </td>
                      <td className="bb-td">
                        {row.type !== "Ordered"
                          ? <span className="bb-parchment">—</span>
                          : <ServiceBadge serviceType={row.serviceType} />}
                      </td>
                      <td className="bb-td">
                        <button type="button" className="bb-icon-btn" onClick={() => setEditIdx(row._i)} aria-label="Edit">✏️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </Card>

      {editIdx !== null && data[editIdx] && (
        <EditModal
          key={`${editIdx}-${data[editIdx].date}-${data[editIdx].meal}-${data[editIdx].dish}-${data[editIdx].preparedBy}-${data[editIdx].preparedByKind}-${data[editIdx].serviceType}`}
          entry={data[editIdx]}
          idx={editIdx}
          onSave={handleSave}
          onDelete={handleDel}
          onClose={() => setEditIdx(null)}
        />
      )}
    </>
  );
}

// ─── InsightsView ─────────────────────────────────────────────────────────────
function InsightsView() {
  const { data } = useApp();
  const [from, setFrom] = useState(daysAgo(90));
  const [to, setTo] = useState(today());
  const typeRef = useRef(null);
  const prepRef = useRef(null);
  const dishRef = useRef(null);
  const prKindRef = useRef(null);
  const svcRef = useRef(null);
  const buildChart = useCharts();

  const filtered = useMemo(() => {
    const f = new Date(from);
    const t = new Date(to);
    t.setHours(23, 59, 59, 999);
    return data.filter(r => { const d = new Date(r.date); return d >= f && d <= t; });
  }, [data, from, to]);

  const stats = useMemo(() => {
    const dc = {}, lp = {};
    filtered.forEach(r => {
      if (r.dish) {
        dc[r.dish] = (dc[r.dish] || 0) + 1;
        lp[r.dish] = r.date;
      }
    });
    const topDish = Object.entries(dc).sort((a, b) => b[1] - a[1])[0];
    let leastRecent = "", maxDays = 0;
    const now = new Date();
    Object.keys(lp).forEach(dishName => {
      const days = Math.floor((now - new Date(lp[dishName])) / 86400000);
      if (days > maxDays) { maxDays = days; leastRecent = dishName; }
    });
    const n = filtered.length;
    const nonSkip = filtered.filter(r => r.type !== "Skipped");
    const cooks = nonSkip.filter(r => r.preparedByKind === PREPARED_PERSON).length;
    const rests = nonSkip.filter(r => r.preparedByKind === PREPARED_RESTAURANT).length;
    const ordered = filtered.filter(r => r.type === "Ordered");
    const dineIn = ordered.filter(r => r.serviceType === SERVICE_DINE_IN).length;
    const delivery = ordered.filter(r => r.serviceType === SERVICE_DELIVERY).length;
    const prTotal = cooks + rests;
    return {
      topDish, leastRecent, maxDays,
      homePct: n ? Math.round(filtered.filter(r => r.type === "Home").length / n * 100) : 0,
      orderedPct: n ? Math.round(filtered.filter(r => r.type === "Ordered").length / n * 100) : 0,
      cooks, rests, prTotal, orderedCount: ordered.length, dineIn, delivery,
    };
  }, [filtered]);

  useEffect(() => {
    if (!window.Chart) return;
    const FONT = { family: T.font.body, size: 14 };
    const LEGEND = { position: "bottom", labels: { font: FONT, padding: 12, boxWidth: 12 } };

    const tc = { Home: 0, Ordered: 0, Skipped: 0 };
    filtered.forEach(r => { tc[r.type] = (tc[r.type] || 0) + 1; });
    buildChart("type", typeRef.current, "doughnut",
      { labels: ["Home", "Ordered", "Skipped"], datasets: [{ data: [tc.Home, tc.Ordered, tc.Skipped], backgroundColor: [T.color.sage, T.color.amber, T.color.parchment], borderWidth: 0, hoverOffset: 5 }] },
      { responsive: true, maintainAspectRatio: false, cutout: "62%", plugins: { legend: LEGEND } });

    const pc = {};
    filtered.forEach(r => { if (r.preparedBy && r.type !== "Skipped") pc[r.preparedBy] = (pc[r.preparedBy] || 0) + 1; });
    const pL = Object.keys(pc).slice(0, 8);
    const PAL = [T.color.sage, T.color.amber, "#5b52c2", "#0d9488", "#b85c38", "#e879f9", "#06b6d4", "#84cc16"];
    buildChart("prep", prepRef.current, "doughnut",
      { labels: pL.length ? pL : ["No data"], datasets: [{ data: pL.length ? pL.map(k => pc[k]) : [1], backgroundColor: PAL, borderWidth: 0, hoverOffset: 5 }] },
      { responsive: true, maintainAspectRatio: false, cutout: "62%", plugins: { legend: LEGEND } });

    const dc2 = {};
    filtered.forEach(r => { if (r.dish) dc2[r.dish] = (dc2[r.dish] || 0) + 1; });
    const dishes = Object.entries(dc2).sort((a, b) => b[1] - a[1]).slice(0, 10);
    buildChart("dish", dishRef.current, "bar",
      { labels: dishes.map(([k]) => (k.length > 15 ? `${k.slice(0, 13)}…` : k)), datasets: [{ data: dishes.map(([, v]) => v), backgroundColor: T.color.sage, borderRadius: 6, hoverBackgroundColor: T.color.sageMid }] },
      { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1, font: FONT }, grid: { color: "#f0ece3" } }, x: { ticks: { font: FONT }, grid: { display: false } } } });

    const pr = stats.prTotal;
    buildChart("prkind", prKindRef.current, "doughnut",
      {
        labels: pr ? ["👤 Person", "🏪 Restaurant"] : ["No entries"],
        datasets: [{ data: pr ? [stats.cooks, stats.rests] : [1], backgroundColor: pr ? [T.color.sage, "#5b52c2"] : [T.color.parchment], borderWidth: 0, hoverOffset: 5 }],
      },
      { responsive: true, maintainAspectRatio: false, cutout: "62%", plugins: { legend: LEGEND } });

    const oc = stats.orderedCount;
    buildChart("svc", svcRef.current, "doughnut",
      {
        labels: oc ? ["🍽 Dine-in", "🚚 Delivery"] : ["No ordered meals"],
        datasets: [{ data: oc ? [stats.dineIn, stats.delivery] : [1], backgroundColor: oc ? [T.color.sage, T.color.amber] : [T.color.parchment], borderWidth: 0, hoverOffset: 5 }],
      },
      { responsive: true, maintainAspectRatio: false, cutout: "62%", plugins: { legend: LEGEND } });
  }, [filtered, buildChart, stats.cooks, stats.rests, stats.prTotal, stats.dineIn, stats.delivery, stats.orderedCount]);

  const prSub = stats.prTotal
    ? `${Math.round(stats.cooks / stats.prTotal * 100)}% person · ${Math.round(stats.rests / stats.prTotal * 100)}% restaurant`
    : "Not enough data";

  return (
    <Card>
      <SectionHeading icon="📊" iconBg={T.color.amberPale}>Insights & Visualizations</SectionHeading>

      <div className="bb-range-row">
        <Field label="From" className="bb-field--inline-0"><Inp type="date" className="bb-input--date-narrow" value={from} onChange={e => setFrom(e.target.value)} /></Field>
        <Field label="To" className="bb-field--inline-0"><Inp type="date" className="bb-input--date-narrow" value={to} onChange={e => setTo(e.target.value)} /></Field>
        <span className="bb-muted" style={{ paddingBottom: "0.2rem" }}>{filtered.length} meals in range</span>
      </div>

      <div className="bb-insight-grid">
        <InsightChip emoji="🔥" label="Most repeated" value={stats.topDish?.[0]} sub={stats.topDish ? `${stats.topDish[1]}× logged` : "No data"} bg={T.color.sagePale} accent={T.color.sage} />
        <InsightChip emoji="🌱" label="Try again soon" value={stats.leastRecent || "—"} sub={stats.leastRecent ? `${stats.maxDays} days ago` : "Not enough data"} bg={T.color.amberPale} accent={T.color.amber} />
        <InsightChip emoji="🏠" label="Home-cooked" value={`${stats.homePct}%`} sub={`vs ${stats.orderedPct}% ordered`} bg={T.color.creamDark} accent={T.color.inkMuted} />
        <InsightChip emoji="👨‍🍳" label="Who prepared" value={stats.prTotal ? `${stats.cooks} vs ${stats.rests}` : "—"} sub={prSub} bg={T.color.sagePale} accent={T.color.sageMid} />
      </div>

      <div className="bb-chart-grid">
        <InsightChartBox title="Meal types">
          <div className="bb-chart-canvas-wrap"><canvas ref={typeRef} /></div>
        </InsightChartBox>
        <InsightChartBox title="Top providers (names)">
          <div className="bb-chart-canvas-wrap"><canvas ref={prepRef} /></div>
        </InsightChartBox>
        <InsightChartBox title="Person vs restaurant (meals)">
          <div className="bb-chart-canvas-wrap"><canvas ref={prKindRef} /></div>
        </InsightChartBox>
        <InsightChartBox title="Ordered: dine-in vs delivery">
          <div className="bb-chart-canvas-wrap"><canvas ref={svcRef} /></div>
        </InsightChartBox>
        <InsightChartBox title="Top 10 dishes">
          <div className="bb-chart-canvas-wrap"><canvas ref={dishRef} /></div>
        </InsightChartBox>
      </div>
    </Card>
  );
}

// ─── DataView ─────────────────────────────────────────────────────────────────
function mapImportRow(r) {
  const pvRaw = String(r["Provider kind"] || r["Prepared by kind"] || r.providerKind || r.preparedByKind || "").trim().toLowerCase();
  const preparedByKind = ["restaurant", "rest", "r"].includes(pvRaw) ? PREPARED_RESTAURANT : PREPARED_PERSON;
  const svRaw = String(r["Order service"] || r["Service"] || r.orderService || r.serviceType || "").trim().toLowerCase();
  const serviceType = ["delivery", "deliver", "d"].includes(svRaw) ? SERVICE_DELIVERY : SERVICE_DINE_IN;
  return normalizeEntry({
    date: String(r["Date"] || r.date || "").trim(),
    meal: String(r["Meal"] || r.meal || "").trim(),
    type: String(r["Type"] || r.type || "Home").trim(),
    dish: String(r["Dish / Description"] || r.dish || "").trim(),
    preparedBy: String(r["Prepared By / Provider"] || r.preparedBy || "").trim(),
    preparedByKind,
    serviceType,
  });
}

function DataView() {
  const { data, replaceAll, clearAll } = useApp();
  const { show } = useToastCtx();
  const fileRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const importFile = useCallback(file => {
    if (!window.XLSX) { show("XLSX library not loaded", "error"); return; }
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const wb = window.XLSX.read(e.target.result, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = window.XLSX.utils.sheet_to_json(ws, { defval: "" })
          .map(mapImportRow)
          .filter(Boolean)
          .filter(r => r.date && r.meal);
        replaceAll(rows);
        show(`Loaded ${rows.length} entries from ${file.name}`);
      } catch {
        show("Could not read file — use the template", "error");
      }
    };
    reader.readAsArrayBuffer(file);
  }, [replaceAll, show]);

  const exportXlsx = useCallback(() => {
    if (!window.XLSX) { show("XLSX not loaded", "error"); return; }
    if (!data.length) { show("No data to export", "error"); return; }
    const ws = window.XLSX.utils.json_to_sheet(data.map(r => ({
      Date: r.date,
      Meal: r.meal,
      Type: r.type,
      "Dish / Description": r.dish,
      "Prepared By / Provider": r.preparedBy,
      "Provider kind": r.preparedByKind === PREPARED_RESTAURANT ? "Restaurant" : "Person",
      "Order service": r.serviceType === SERVICE_DELIVERY ? "Delivery" : "Dine-in",
    })));
    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, "Food Log");
    window.XLSX.writeFile(wb, `food_log_${today()}.xlsx`);
    show(`Exported ${data.length} records`);
  }, [data, show]);

  const downloadTemplate = useCallback(() => {
    if (!window.XLSX) { show("XLSX not loaded", "error"); return; }
    const rows = [
      ["Date", "Meal", "Type", "Dish / Description", "Prepared By / Provider", "Provider kind", "Order service"],
      ["2026-04-25", "Breakfast", "Home", "Poha with peanuts", "Sachin", "Person", "Dine-in"],
      ["2026-04-25", "Lunch", "Ordered", "Puttu Kadala", "Hotel Rahman", "Restaurant", "Dine-in"],
      ["2026-04-25", "Dinner", "Ordered", "Thali", "Swiggy", "Restaurant", "Delivery"],
      ["2026-04-25", "Dinner", "Skipped", "", "", "", ""],
    ];
    const ws = window.XLSX.utils.aoa_to_sheet(rows);
    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, "Food Log");
    window.XLSX.writeFile(wb, "food_log_template.xlsx");
    show("Template downloaded");
  }, [show]);

  const handleClear = useCallback(() => {
    if (!confirm("Delete ALL meals permanently?")) return;
    clearAll();
    show("All data cleared", "error");
  }, [clearAll, show]);

  return (
    <Card>
      <SectionHeading icon="📁" iconBg={T.color.terraPale}>Data & Excel</SectionHeading>

      <div className="bb-data-actions">
        <Btn variant="primary" onClick={downloadTemplate}>⬇ Template</Btn>
        <Btn onClick={exportXlsx}>💾 Export Excel</Btn>
        <Btn variant="danger" onClick={handleClear}>🗑 Clear All</Btn>
      </div>

      <div
        className={`bb-file-drop ${dragging ? "bb-file-drop--drag" : ""}`.trim()}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) importFile(f); }}
        onClick={() => fileRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileRef.current?.click(); } }}
      >
        <div className="bb-file-drop-icon">📤</div>
        <div className="bb-file-drop-title">Drag & drop Excel file here</div>
        <div className="bb-file-drop-sub">or click to browse (.xlsx / .xls)</div>
        <input ref={fileRef} type="file" accept=".xlsx,.xls" className="bb-hidden" onChange={e => { const f = e.target.files[0]; if (f) importFile(f); e.target.value = ""; }} />
      </div>

      <Divider />

      <div className="bb-help-box">
        <div className="bb-help-title">How it works</div>
        <ol className="bb-help-list">
          <li>Download the template above and fill in your meals.</li>
          <li>Optional columns default for old files: Provider kind = Person, Order service = Dine-in.</li>
          <li>Import replaces all existing entries.</li>
          <li>Use the <strong className="bb-help-strong">Log</strong> tab daily with drag-and-drop chips.</li>
          <li>Check <strong className="bb-help-strong">Insights</strong> for dine-in vs delivery and person vs restaurant.</li>
        </ol>
      </div>
    </Card>
  );
}

// =============================================================================
// 9. HEADER + NAV
// =============================================================================
const TABS = [
  { id:"log",      icon:"📝", label:"Log"      },
  { id:"calendar", icon:"🗓",  label:"Calendar" },
  { id:"history",  icon:"📋", label:"History"  },
  { id:"insights", icon:"📊", label:"Insights" },
  { id:"data",     icon:"📁", label:"Data"     },
];

function Header({ streak, total, active, onSwitch }) {
  return (
    <header className="bb-header">
      <div className="bb-header-inner">
        <div className="bb-header-top">
          <div className="bb-header-logo">🥗</div>
          <div className="bb-header-titles">
            <div className="bb-header-title">BiteBook</div>
            <div className="bb-header-tagline">Your daily food log</div>
          </div>
          <div className="bb-header-stats">
            <span className="bb-header-stat">{total} meals</span>
            <span className="bb-header-stat">{streak > 0 ? `${streak}d streak 🔥` : "Start a streak!"}</span>
          </div>
        </div>

        <nav className="bb-tabs" aria-label="Main">
          {TABS.map(tab => {
            const on = tab.id === active;
            return (
              <button
                key={tab.id}
                type="button"
                className={`bb-tab ${on ? "bb-tab--active" : ""}`.trim()}
                onClick={() => onSwitch(tab.id)}
              >
                <span className="bb-tab-icon">{tab.icon}</span>
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

// =============================================================================
// 10. ROOT
// =============================================================================
export default function BiteBook() {
  const foodData       = useFoodData();
  const { toast, show } = useToast();
  const [active, setActive] = useState("log");

  const views = {
    log:      <LogView />,
    calendar: <CalendarView />,
    history:  <HistoryView />,
    insights: <InsightsView />,
    data:     <DataView />,
  };

  return (
    <AppCtx.Provider value={foodData}>
      <ToastCtx.Provider value={{ show }}>
        <Datalists
          dishes={foodData.suggestions.dishes}
          persons={foodData.suggestions.persons}
          restaurants={foodData.suggestions.restaurants}
        />

        <Header streak={foodData.streak} total={foodData.data.length} active={active} onSwitch={setActive} />

        <main className="bb-main">
          <div key={active} className="bb-view-animate">
            {views[active]}
          </div>
        </main>

        <Toast toast={toast} />
      </ToastCtx.Provider>
    </AppCtx.Provider>
  );
}
