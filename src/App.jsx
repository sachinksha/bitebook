
// ─────────────────────────────────────────────────────────────────────────────
// BiteBook — React App
// Architecture: Theme → Hooks → Primitives → Components → Views → App
// ─────────────────────────────────────────────────────────────────────────────

import {
  useState, useEffect, useCallback, useMemo, useRef, createContext, useContext,
} from "react";
import * as XLSX from 'xlsx'
import Chart from 'chart.js/auto'
window.XLSX = XLSX
window.Chart = Chart
// =============================================================================
// 1. THEME
// =============================================================================
const T = {
  font: {
    display: "'Ubuntu', Noto-Sans, serif",
    body:    "'Ubuntu', sans-serif",
  },
  color: {
    sage:        "#3d6b50",
    sageMid:     "#5a8f6e",
    sageLight:   "#c8e6d4",
    sagePale:    "#eef7f1",
    cream:       "#faf8f3",
    creamDark:   "#f0ece3",
    parchment:   "#e4dfd5",
    terra:       "#b85c38",
    terraPale:   "#fceee8",
    amber:       "#c47b1a",
    amberPale:   "#fdf3e1",
    ink:         "#1a1714",
    inkSoft:     "#3a3330",
    inkMuted:    "#7a7068",
    border:      "#ddd8cf",
    borderLight: "#eae6df",
    white:       "#ffffff",
  },
  r: { sm: "8px", md: "12px", lg: "16px", xl: "22px", full: "999px" },
  shadow: {
    sm: "0 1px 4px rgba(26,23,20,0.07)",
    md: "0 4px 16px rgba(26,23,20,0.10)",
    lg: "0 8px 32px rgba(26,23,20,0.15)",
  },
  meal: {
    Breakfast: { color: "#c47b1a", pale: "#fdf3e1", bar: "linear-gradient(90deg,#f59e0b,#fbbf24)" },
    Lunch:     { color: "#3d6b50", pale: "#eef7f1", bar: "linear-gradient(90deg,#3d6b50,#5a8f6e)" },
    Dinner:    { color: "#5b52c2", pale: "#eeedf9", bar: "linear-gradient(90deg,#5b52c2,#7c75d8)" },
  },
};

const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Ubuntu:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html{font-size:14px;-webkit-font-smoothing:antialiased;}
body{font-family:'Ubuntu',sans-serif;background:#faf8f3;color:#1a1714;min-height:100vh;}
input,select,button{font-family:inherit;}
input[type=date]::-webkit-calendar-picker-indicator{opacity:.5;cursor:pointer;}
::-webkit-scrollbar{width:5px;height:5px;}
::-webkit-scrollbar-track{background:#f0ece3;}
::-webkit-scrollbar-thumb{background:#ddd8cf;border-radius:3px;}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
@keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
@keyframes scaleIn{from{opacity:0;transform:scale(.96) translateY(5px);}to{opacity:1;transform:scale(1) translateY(0);}}
@keyframes toastIn{from{opacity:0;transform:translate(-50%,50px);}to{opacity:1;transform:translate(-50%,0);}}
`;

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

// =============================================================================
// 3. PERSISTENCE
// =============================================================================
const KEY = "bitebook_v3";
const loadData = () => {
  try { return JSON.parse(localStorage.getItem(KEY) || localStorage.getItem("bitebook_v2") || localStorage.getItem("foodData") || "[]"); }
  catch { return []; }
};
const persist = d => localStorage.setItem(KEY, JSON.stringify(d));

// =============================================================================
// 4. HOOKS
// =============================================================================

// Central data store
function useFoodData() {
  const [data, setData] = useState(loadData);

  const _commit = useCallback(fn => {
    setData(prev => { const next = fn(prev); persist(next); return next; });
  }, []);

  const saveMeal = useCallback(entry =>
    _commit(prev => [...prev.filter(r => !(r.date === entry.date && r.meal === entry.meal)), entry]),
  [_commit]);

  const updateEntry = useCallback((idx, entry) =>
    _commit(prev => { const n = [...prev]; n[idx] = entry; return n; }),
  [_commit]);

  const deleteEntry = useCallback(idx =>
    _commit(prev => prev.filter((_, i) => i !== idx)),
  [_commit]);

  const replaceAll = useCallback(rows => _commit(() => rows), [_commit]);
  const clearAll   = useCallback(() => _commit(() => []), [_commit]);

  const suggestions = useMemo(() => {
    const dc = {}, pc = {};
    data.forEach(r => {
      if (r.dish)       dc[r.dish]       = (dc[r.dish]       || 0) + 1;
      if (r.preparedBy) pc[r.preparedBy] = (pc[r.preparedBy] || 0) + 1;
    });
    const rank = obj => Object.keys(obj).sort((a, b) => obj[b] - obj[a]);
    return { dishes: rank(dc), persons: rank(pc), topDish: rank(dc)[0] || "", topPerson: rank(pc)[0] || "" };
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

function GlobalStyles() {
  useEffect(() => {
    if (document.getElementById("bb-styles")) return;
    const el = document.createElement("style");
    el.id = "bb-styles";
    el.textContent = GLOBAL_CSS;
    document.head.appendChild(el);
  }, []);
  return null;
}

function Datalists({ dishes, persons }) {
  return (
    <>
      <datalist id="bb-dishes">{dishes.map(d => <option key={d} value={d} />)}</datalist>
      <datalist id="bb-persons">{persons.map(p => <option key={p} value={p} />)}</datalist>
    </>
  );
}

function Card({ children, style }) {
  return (
    <div style={{
      background: T.color.white, border: `1px solid ${T.color.border}`,
      borderRadius: T.r.xl, padding: "22px 24px", marginBottom: 16,
      boxShadow: T.shadow.sm, animation: "fadeUp .28s ease both", ...style,
    }}>
      {children}
    </div>
  );
}

function SectionHeading({ icon, iconBg, children, aside }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom: 18, gap: 10, flexWrap:"wrap" }}>
      <div style={{ display:"flex", alignItems:"center", gap: 10 }}>
        <span style={{ width:34, height:34, borderRadius: T.r.md, background: iconBg || T.color.sagePale, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{icon}</span>
        <span style={{ fontFamily: T.font.display, fontSize: 22, fontWeight: 700, color: T.color.ink, letterSpacing: "-.3px" }}>{children}</span>
      </div>
      {aside && <div>{aside}</div>}
    </div>
  );
}

function Btn({ children, onClick, variant = "default", size = "md", full, disabled, style, title, type = "button" }) {
  const v = {
    default: { bg: T.color.white,     color: T.color.inkSoft,  border: T.color.border,     hover: T.color.creamDark },
    primary: { bg: T.color.sage,      color: "#fff",            border: T.color.sage,       hover: T.color.sageMid   },
    ghost:   { bg: "transparent",     color: T.color.inkMuted,  border: "transparent",      hover: T.color.sagePale  },
    danger:  { bg: T.color.terraPale, color: T.color.terra,     border: "#f2c4b0",          hover: "#f8ddd3"         },
  }[variant] || {};
  const pad = { sm: "5px 11px", md: "8px 16px", lg: "11px 22px" }[size] || "8px 16px";
  const [hov, setHov] = useState(false);
  return (
    <button type={type} onClick={onClick} disabled={disabled} title={title}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", gap:6, padding: pad,
        background: hov && !disabled ? v.hover : v.bg, color: v.color,
        border: `1.5px solid ${v.border}`, borderRadius: T.r.md,
        fontSize: 16, fontWeight: 500,
        cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? .5 : 1,
        transition: "all .14s", width: full ? "100%" : undefined, whiteSpace:"nowrap",
        fontFamily: T.font.body, ...style,
      }}
    >{children}</button>
  );
}

function Inp({ list, style, ...props }) {
  const [foc, setFoc] = useState(false);
  return (
    <input list={list} onFocus={() => setFoc(true)} onBlur={() => setFoc(false)}
      style={{ width:"100%", padding:"9px 12px",
        border: `1.5px solid ${foc ? T.color.sage : T.color.border}`,
        borderRadius: T.r.md,
        background: foc ? T.color.white : T.color.cream,
        color: T.color.ink, fontSize: 16, outline:"none", transition:"all .15s",
        boxShadow: foc ? `0 0 0 3px ${T.color.sageLight}55` : "none",
        ...style }}
      {...props}
    />
  );
}

function Sel({ style, ...props }) {
  const [foc, setFoc] = useState(false);
  return (
    <select onFocus={() => setFoc(true)} onBlur={() => setFoc(false)}
      style={{ width:"100%", padding:"9px 32px 9px 12px",
        border: `1.5px solid ${foc ? T.color.sage : T.color.border}`,
        borderRadius: T.r.md, appearance:"none", cursor:"pointer",
        background: `${foc ? T.color.white : T.color.cream} url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='7'%3E%3Cpath d='M.5 1l5 5 5-5' stroke='%237a7068' stroke-width='1.5' fill='none'/%3E%3C/svg%3E") no-repeat right 11px center`,
        color: T.color.ink, fontSize: 16, outline:"none", transition:"all .15s", ...style }}
      {...props}
    />
  );
}

function FieldLabel({ children }) {
  return (
    <label style={{ display:"block", fontSize:16, fontWeight:600, letterSpacing:".7px", textTransform:"uppercase", color: T.color.inkMuted, marginBottom:5 }}>
      {children}
    </label>
  );
}

function Field({ label, children, style }) {
  return (
    <div style={{ marginBottom: 12, ...style }}>
      <FieldLabel>{label}</FieldLabel>
      {children}
    </div>
  );
}

function Badge({ type }) {
  const m = {
    Home:    { bg: T.color.sagePale,  color: T.color.sage,     label:"🏠 Home"    },
    Ordered: { bg: T.color.amberPale, color: T.color.amber,    label:"🛵 Ordered" },
    Skipped: { bg: T.color.creamDark, color: T.color.inkMuted, label:"⏭ Skipped" },
  }[type] || {};
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:3, padding:"3px 10px", borderRadius: T.r.full, background: m.bg, color: m.color, fontSize:16, fontWeight:600 }}>
      {m.label}
    </span>
  );
}

function TypePills({ value, onChange }) {
  const pills = [
    { key:"Home",    label:"🏠 Home",  activeBg: T.color.sagePale,  activeColor: T.color.sage,     activeBorder: T.color.sageMid },
    { key:"Ordered", label:"🛵 Order", activeBg: T.color.amberPale, activeColor: "#92400e",         activeBorder:"#f5c842"        },
    { key:"Skipped", label:"⏭ Skip",  activeBg: T.color.creamDark, activeColor: T.color.inkMuted,  activeBorder: T.color.parchment },
  ];
  return (
    <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
      {pills.map(p => {
        const on = value === p.key;
        return (
          <button key={p.key} onClick={() => onChange(p.key)} style={{
            padding:"4px 12px", borderRadius: T.r.full,
            border: `1.5px solid ${on ? p.activeBorder : T.color.border}`,
            background: on ? p.activeBg : T.color.white,
            color: on ? p.activeColor : T.color.inkMuted,
            fontSize:16, fontWeight:600, cursor:"pointer", transition:"all .14s",
          }}>{p.label}</button>
        );
      })}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position:"fixed", inset:0, zIndex:9999, background:"rgba(26,23,20,.55)",
        display:"flex", alignItems:"center", justifyContent:"center",
        padding:16, backdropFilter:"blur(3px)", animation:"fadeIn .2s ease" }}>
      <div style={{ background: T.color.white, border:`1px solid ${T.color.border}`,
        borderRadius: T.r.xl, padding:"22px 24px", width:"100%", maxWidth:440,
        boxShadow: T.shadow.lg, animation:"scaleIn .2s ease" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
          <span style={{ fontFamily: T.font.display, fontSize:24, fontWeight:700, color: T.color.ink }}>{title}</span>
          <button onClick={onClose} style={{ background: T.color.creamDark, border:"none", borderRadius: T.r.sm, width:30, height:30, cursor:"pointer", fontSize:18, color: T.color.inkMuted, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
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
    <div key={toast.id} style={{ position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)",
      background: isErr ? T.color.terra : T.color.sage, color:"#fff",
      padding:"10px 22px", borderRadius: T.r.full, fontSize:16, fontWeight:500,
      boxShadow: T.shadow.lg, zIndex:99999, whiteSpace:"nowrap",
      animation:"toastIn .3s ease", pointerEvents:"none" }}>
      {toast.msg}
    </div>
  );
}

function EmptyState({ icon, msg }) {
  return (
    <div style={{ textAlign:"center", padding:"48px 24px", color: T.color.inkMuted }}>
      <div style={{ fontSize:36, marginBottom:12 }}>{icon}</div>
      <div style={{ fontStyle:"italic", fontSize:16 }}>{msg}</div>
    </div>
  );
}

function Divider() {
  return <div style={{ height:1, background: T.color.borderLight, margin:"16px 0" }} />;
}

// =============================================================================
// 7. FEATURE COMPONENTS
// =============================================================================

// ─── MealCard ─────────────────────────────────────────────────────────────────
function MealCard({ meal, existing, onSave }) {
  const mc    = T.meal[meal];
  const icon  = { Breakfast:"🌅", Lunch:"☀️", Dinner:"🌙" }[meal];
  const { suggestions } = useApp();

  const [type,   setType]   = useState(existing?.type       || "Home");
  const [dish,   setDish]   = useState(existing?.dish       || "");
  const [person, setPerson] = useState(existing?.preparedBy || "");
  const [saved,  setSaved]  = useState(false);

  // Sync when date changes or existing entry changes
  useEffect(() => {
    setType(existing?.type       || "Home");
    setDish(existing?.dish       || "");
    setPerson(existing?.preparedBy || "");
    setSaved(false);
  }, [existing?.date, existing?.meal, meal]);

  const handleSave = () => {
    onSave({ meal, type, dish: type === "Skipped" ? "" : dish, preparedBy: type === "Skipped" ? "" : person });
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  return (
    <div style={{
      background: T.color.white,
      border: `1.5px solid ${saved ? mc.color + "55" : T.color.border}`,
      borderRadius: T.r.lg,
      padding: 16,
      display:"flex", flexDirection:"column", gap:10,
      position:"relative", overflow:"hidden",
      transition:"border-color .2s, box-shadow .2s",
      boxShadow: saved ? `0 0 0 3px ${mc.color}18` : T.shadow.sm,
    }}>
      {/* Accent bar */}
      <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background: mc.bar }} />

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:4 }}>
        <span style={{ fontSize:20 }}>{icon}</span>
        <span style={{ fontFamily: T.font.display, fontSize:18, fontWeight:700, color: T.color.ink }}>{meal}</span>
        {saved
          ? <span style={{ marginLeft:"auto", background:"#bbf7d0", color:"#15803d", fontSize:16, fontWeight:700, padding:"2px 9px", borderRadius: T.r.full }}>✓ Saved</span>
          : existing
          ? <span style={{ marginLeft:"auto", fontSize:16, color: T.color.inkMuted }}>Logged ·</span>
          : null}
      </div>

      {/* Type */}
      <TypePills value={type} onChange={setType} />

      {/* Fields */}
      {type !== "Skipped" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
          <div>
            <FieldLabel>Dish</FieldLabel>
            <Inp list="bb-dishes" placeholder={suggestions.topDish || "e.g. Poha"} value={dish} onChange={e => setDish(e.target.value)} />
          </div>
          <div>
            <FieldLabel>By</FieldLabel>
            <Inp list="bb-persons" placeholder={suggestions.topPerson || "Name"} value={person} onChange={e => setPerson(e.target.value)} />
          </div>
        </div>
      )}

      <Btn full onClick={handleSave} style={{ background: mc.color, borderColor: mc.color, color:"#fff", marginTop:2 }}>
        Save {meal}
      </Btn>
    </div>
  );
}

// ─── EditModal ─────────────────────────────────────────────────────────────────
function EditModal({ entry, idx, onSave, onDelete, onClose }) {
  const { suggestions } = useApp();
  const [date,   setDate]   = useState(entry.date);
  const [meal,   setMeal]   = useState(entry.meal);
  const [type,   setType]   = useState(entry.type);
  const [dish,   setDish]   = useState(entry.dish       || "");
  const [person, setPerson] = useState(entry.preparedBy || "");

  return (
    <Modal title="Edit Entry" onClose={onClose}>
      <Field label="Date"><Inp type="date" value={date} onChange={e => setDate(e.target.value)} /></Field>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        <Field label="Meal">
          <Sel value={meal} onChange={e => setMeal(e.target.value)}>
            <option>Breakfast</option><option>Lunch</option><option>Dinner</option>
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
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          <Field label="Dish"><Inp list="bb-dishes" value={dish} onChange={e => setDish(e.target.value)} placeholder={suggestions.topDish} /></Field>
          <Field label="By">  <Inp list="bb-persons" value={person} onChange={e => setPerson(e.target.value)} placeholder={suggestions.topPerson} /></Field>
        </div>
      )}
      <Divider />
      <div style={{ display:"flex", gap:8 }}>
        <Btn variant="primary" full onClick={() => onSave(idx, { date, meal, type, dish: type==="Skipped"?"":dish, preparedBy: type==="Skipped"?"":person })}>💾 Save</Btn>
        <Btn variant="danger"  full onClick={() => onDelete(idx)}>🗑 Delete</Btn>
        <Btn variant="ghost"        onClick={onClose}>Cancel</Btn>
      </div>
    </Modal>
  );
}

// ─── InsightChip ──────────────────────────────────────────────────────────────
function InsightChip({ emoji, label, value, sub, bg, accent }) {
  return (
    <div style={{ background: bg, borderRadius: T.r.lg, padding:"14px 16px", border:`1px solid ${accent}33` }}>
      <div style={{ fontSize:16, fontWeight:600, textTransform:"uppercase", letterSpacing:".6px", color: accent, marginBottom:5 }}>{emoji} {label}</div>
      <div style={{ fontFamily: T.font.display, fontSize:24, fontWeight:700, color: T.color.ink, lineHeight:1.2, marginBottom:3 }}>{value || "—"}</div>
      <div style={{ fontSize:16, color: T.color.inkMuted }}>{sub}</div>
    </div>
  );
}

// =============================================================================
// 8. VIEWS
// =============================================================================

// ─── LogView ──────────────────────────────────────────────────────────────────
function LogView() {
  const { data, saveMeal } = useApp();
  const { show } = useToastCtx();
  const [logDate, setLogDate] = useState(today());

  const existing = useMemo(() => {
    const m = {};
    data.filter(r => r.date === logDate).forEach(r => m[r.meal] = r);
    return m;
  }, [data, logDate]);

  const handleSave = useCallback(entry => {
    saveMeal({ ...entry, date: logDate });
    show(`${entry.meal} saved for ${fmtShort(logDate)}`);
  }, [logDate, saveMeal, show]);

  return (
    <Card>
      <SectionHeading icon="📝" iconBg={T.color.sagePale}
        aside={
          <div style={{ display:"flex", alignItems:"center", gap:5 }}>
            <Btn size="sm" variant="ghost" onClick={() => setLogDate(d => addDays(d, -1))}>←</Btn>
            <Inp type="date" value={logDate} onChange={e => setLogDate(e.target.value)} style={{ width:145 }} />
            <Btn size="sm" variant="ghost" onClick={() => setLogDate(d => addDays(d, 1))}>→</Btn>
          </div>
        }
      >Log Meals</SectionHeading>

      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:18 }}>
        <span style={{ fontSize:16, color: T.color.inkMuted }}>
          {logDate === today() ? "📅 Today" : `📅 ${fmtLong(logDate)}`}
        </span>
        {logDate !== today() && (
          <Btn size="sm" variant="ghost" onClick={() => setLogDate(today())} style={{ fontSize:16 }}>↩ Today</Btn>
        )}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(230px, 1fr))", gap:12 }}>
        {["Breakfast","Lunch","Dinner"].map(meal => (
          <MealCard key={meal} meal={meal} existing={existing[meal]} onSave={handleSave} />
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

  const Cell = ({ e }) => {
    if (!e) return <span style={{ color: T.color.parchment }}>—</span>;
    if (e.type === "Skipped") return <Badge type="Skipped" />;
    return (
      <div>
        <Badge type={e.type} />
        {e.dish       && <div style={{ fontSize:16, color: T.color.inkSoft,  marginTop:3  }}>{e.dish}</div>}
        {e.preparedBy && <div style={{ fontSize:16, color: T.color.inkMuted, marginTop:1  }}>{e.preparedBy}</div>}
      </div>
    );
  };

  const TH = ({ ch }) => (
    <th style={{ padding:"9px 12px", background: T.color.cream, color: T.color.inkMuted, fontSize:16, fontWeight:600, textTransform:"uppercase", letterSpacing:".5px", textAlign:"left", borderBottom:`1px solid ${T.color.border}`, whiteSpace:"nowrap" }}>{ch}</th>
  );

  return (
    <Card>
      <SectionHeading icon="🗓" iconBg={T.color.amberPale}
        aside={
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            <Btn size="sm" onClick={() => setOffset(o => o + 14)}>← Earlier</Btn>
            <Btn size="sm" onClick={() => setOffset(o => Math.max(0, o - 14))}>Later →</Btn>
            <Btn size="sm" variant="primary" onClick={() => setOffset(0)}>Today</Btn>
          </div>
        }
      >Last 2 Weeks</SectionHeading>

      <div style={{ overflowX:"auto", borderRadius: T.r.md, border:`1px solid ${T.color.border}` }}>
        <table style={{ width:"100%", borderCollapse:"collapse", minWidth:520 }}>
          <thead><tr>
            <TH ch="Date" />
            <TH ch="🌅 Breakfast" />
            <TH ch="☀️ Lunch" />
            <TH ch="🌙 Dinner" />
          </tr></thead>
          <tbody>
            {days.map((ds, i) => {
              const isToday = ds === today();
              const e = byDate[ds] || {};
              return (
                <tr key={ds} style={{ background: isToday ? T.color.sagePale : i % 2 === 0 ? T.color.white : T.color.cream }}>
                  <td style={{ padding:"10px 12px", whiteSpace:"nowrap", fontSize:16, borderBottom:`1px solid ${T.color.borderLight}`,
                    fontWeight: isToday ? 600 : 400, color: isToday ? T.color.sage : T.color.ink }}>
                    {fmtWday(ds)}, {fmtShort(ds)}
                    {isToday && <span style={{ marginLeft:6, display:"inline-block", width:6, height:6, borderRadius:"50%", background: T.color.sage, verticalAlign:"middle" }} />}
                  </td>
                  {["Breakfast","Lunch","Dinner"].map(m => (
                    <td key={m} style={{ padding:"10px 12px", borderBottom:`1px solid ${T.color.borderLight}`, verticalAlign:"top", fontSize:16 }}>
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

// ─── HistoryView ──────────────────────────────────────────────────────────────
function HistoryView() {
  const { data, updateEntry, deleteEntry } = useApp();
  const { show } = useToastCtx();
  const [editIdx, setEditIdx] = useState(null);

  const sorted = useMemo(() =>
    [...data]
      .map((r, i) => ({ ...r, _i: i }))
      .sort((a, b) => a.date !== b.date ? new Date(b.date) - new Date(a.date) : (MEAL_ORDER[a.meal]||9) - (MEAL_ORDER[b.meal]||9)),
    [data]);

  const handleSave = (idx, entry) => { updateEntry(idx, entry); setEditIdx(null); show("Entry updated"); };
  const handleDel  = idx => { if (!confirm("Delete this entry?")) return; deleteEntry(idx); setEditIdx(null); show("Deleted", "error"); };

  const TH = ({ ch, hide }) => (
    <th style={{ padding:"9px 12px", background: T.color.cream, color: T.color.inkMuted, fontSize:16, fontWeight:600, textTransform:"uppercase", letterSpacing:".5px", textAlign:"left", borderBottom:`1px solid ${T.color.border}`, position:"sticky", top:0, display: hide ? undefined : undefined }}>
      {ch}
    </th>
  );

  return (
    <>
      <Card>
        <SectionHeading icon="📋" iconBg={T.color.creamDark}
          aside={<span style={{ fontSize:16, color: T.color.inkMuted, background: T.color.creamDark, padding:"3px 10px", borderRadius: T.r.full }}>{data.length} entries</span>}
        >All Entries</SectionHeading>

        {data.length === 0
          ? <EmptyState icon="🍽️" msg="No entries yet — start logging your meals!" />
          : (
            <div style={{ overflowX:"auto", borderRadius: T.r.md, border:`1px solid ${T.color.border}`, maxHeight:480, overflowY:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", minWidth:480, fontSize:16 }}>
                <thead><tr>
                  <TH ch="Date" /><TH ch="Meal" /><TH ch="Type" /><TH ch="Dish" /><TH ch="By" /><TH ch="" />
                </tr></thead>
                <tbody>
                  {sorted.map(row => (
                    <tr key={`${row.date}-${row.meal}`}
                      onMouseEnter={e => e.currentTarget.style.background = T.color.cream}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      style={{ transition:"background .1s" }}>
                      <td style={{ padding:"10px 12px", whiteSpace:"nowrap", borderBottom:`1px solid ${T.color.borderLight}`, color: T.color.inkSoft }}>{fmtWday(row.date)}, {fmtShort(row.date)}</td>
                      <td style={{ padding:"10px 12px", fontWeight:500, borderBottom:`1px solid ${T.color.borderLight}` }}>{row.meal}</td>
                      <td style={{ padding:"10px 12px", borderBottom:`1px solid ${T.color.borderLight}` }}><Badge type={row.type} /></td>
                      <td style={{ padding:"10px 12px", borderBottom:`1px solid ${T.color.borderLight}`, maxWidth:120, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", color: T.color.inkSoft }}>
                        {row.dish || <span style={{ color: T.color.parchment }}>—</span>}
                      </td>
                      <td style={{ padding:"10px 12px", borderBottom:`1px solid ${T.color.borderLight}`, color: T.color.inkMuted }}>
                        {row.preparedBy || <span style={{ color: T.color.parchment }}>—</span>}
                      </td>
                      <td style={{ padding:"10px 12px", borderBottom:`1px solid ${T.color.borderLight}` }}>
                        <button onClick={() => setEditIdx(row._i)}
                          style={{ background:"none", border:"none", cursor:"pointer", fontSize:16, opacity:.45, borderRadius:6, padding:"2px 5px", transition:"opacity .15s" }}
                          onMouseEnter={e => e.target.style.opacity = 1}
                          onMouseLeave={e => e.target.style.opacity = .45}>✏️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </Card>

      {editIdx !== null && data[editIdx] && (
        <EditModal entry={data[editIdx]} idx={editIdx} onSave={handleSave} onDelete={handleDel} onClose={() => setEditIdx(null)} />
      )}
    </>
  );
}

// ─── InsightsView ─────────────────────────────────────────────────────────────
function InsightsView() {
  const { data } = useApp();
  const [from, setFrom] = useState(daysAgo(90));
  const [to,   setTo]   = useState(today());
  const typeRef = useRef(null);
  const prepRef = useRef(null);
  const dishRef = useRef(null);
  const buildChart = useCharts();

  const filtered = useMemo(() => {
    const f = new Date(from), t = new Date(to);
    t.setHours(23,59,59,999);
    return data.filter(r => { const d = new Date(r.date); return d >= f && d <= t; });
  }, [data, from, to]);

  const stats = useMemo(() => {
    const dc = {}, lp = {};
    filtered.forEach(r => { if (r.dish) { dc[r.dish] = (dc[r.dish]||0)+1; lp[r.dish] = r.date; } });
    const topDish = Object.entries(dc).sort((a,b) => b[1]-a[1])[0];
    let leastRecent = "", maxDays = 0;
    const now = new Date();
    Object.keys(lp).forEach(d => { const days = Math.floor((now - new Date(lp[d]))/86400000); if (days > maxDays) { maxDays = days; leastRecent = d; } });
    const n = filtered.length;
    return {
      topDish, leastRecent, maxDays,
      homePct:    n ? Math.round(filtered.filter(r => r.type==="Home"   ).length/n*100) : 0,
      orderedPct: n ? Math.round(filtered.filter(r => r.type==="Ordered").length/n*100) : 0,
    };
  }, [filtered]);

  useEffect(() => {
    if (!window.Chart) return;
    const FONT   = { family: T.font.body, size: 11 };
    const LEGEND = { position:"bottom", labels:{ font:FONT, padding:10, boxWidth:10 } };

    // Type doughnut
    const tc = { Home:0, Ordered:0, Skipped:0 };
    filtered.forEach(r => tc[r.type] = (tc[r.type]||0)+1);
    buildChart("type", typeRef.current, "doughnut",
      { labels:["Home","Ordered","Skipped"], datasets:[{ data:[tc.Home,tc.Ordered,tc.Skipped], backgroundColor:[T.color.sage,T.color.amber,T.color.parchment], borderWidth:0, hoverOffset:5 }] },
      { responsive:true, maintainAspectRatio:false, cutout:"62%", plugins:{ legend:LEGEND } });

    // Prep doughnut
    const pc = {};
    filtered.forEach(r => { if (r.preparedBy && r.type!=="Skipped") pc[r.preparedBy]=(pc[r.preparedBy]||0)+1; });
    const pL = Object.keys(pc).slice(0,8);
    const PAL = [T.color.sage,T.color.amber,"#5b52c2","#0d9488","#b85c38","#e879f9","#06b6d4","#84cc16"];
    buildChart("prep", prepRef.current, "doughnut",
      { labels: pL.length ? pL : ["No data"], datasets:[{ data: pL.length ? pL.map(k=>pc[k]) : [1], backgroundColor:PAL, borderWidth:0, hoverOffset:5 }] },
      { responsive:true, maintainAspectRatio:false, cutout:"62%", plugins:{ legend:LEGEND } });

    // Dish bar
    const dc2 = {};
    filtered.forEach(r => { if (r.dish) dc2[r.dish]=(dc2[r.dish]||0)+1; });
    const dishes = Object.entries(dc2).sort((a,b)=>b[1]-a[1]).slice(0,10);
    buildChart("dish", dishRef.current, "bar",
      { labels: dishes.map(([k])=>k.length>15?k.slice(0,13)+"…":k), datasets:[{ data: dishes.map(([,v])=>v), backgroundColor: T.color.sage, borderRadius:6, hoverBackgroundColor: T.color.sageMid }] },
      { responsive:true, maintainAspectRatio:false, plugins:{ legend:{ display:false } }, scales:{ y:{ beginAtZero:true, ticks:{ stepSize:1, font:FONT }, grid:{ color:"#f0ece3" } }, x:{ ticks:{ font:FONT }, grid:{ display:false } } } });
  }, [filtered, buildChart]);

  const ChartBox = ({ title, children }) => (
    <div style={{ background: T.color.cream, borderRadius: T.r.md, padding:"14px 16px", border:`1px solid ${T.color.border}` }}>
      <div style={{ fontSize:16, fontWeight:600, textTransform:"uppercase", letterSpacing:".5px", color: T.color.inkMuted, marginBottom:10 }}>{title}</div>
      {children}
    </div>
  );

  return (
    <Card>
      <SectionHeading icon="📊" iconBg={T.color.amberPale}>Insights & Visualizations</SectionHeading>

      {/* Date range */}
      <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"flex-end", marginBottom:20 }}>
        <Field label="From" style={{ marginBottom:0 }}><Inp type="date" value={from} onChange={e => setFrom(e.target.value)} style={{ width:148 }} /></Field>
        <Field label="To"   style={{ marginBottom:0 }}><Inp type="date" value={to}   onChange={e => setTo(e.target.value)}   style={{ width:148 }} /></Field>
        <span style={{ fontSize:16, color: T.color.inkMuted, paddingBottom:2 }}>{filtered.length} meals in range</span>
      </div>

      {/* Insight chips */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(150px, 1fr))", gap:10, marginBottom:20 }}>
        <InsightChip emoji="🔥" label="Most repeated"  value={stats.topDish?.[0]}     sub={stats.topDish ? `${stats.topDish[1]}× logged` : "No data"}          bg={T.color.sagePale}  accent={T.color.sage}    />
        <InsightChip emoji="🌱" label="Try again soon" value={stats.leastRecent||"—"} sub={stats.leastRecent ? `${stats.maxDays} days ago` : "Not enough data"} bg={T.color.amberPale} accent={T.color.amber}   />
        <InsightChip emoji="🏠" label="Home-cooked"    value={`${stats.homePct}%`}    sub={`vs ${stats.orderedPct}% ordered`}                                   bg={T.color.creamDark} accent={T.color.inkMuted} />
      </div>

      {/* Charts */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))", gap:12 }}>
        <ChartBox title="Meal types breakdown">
          <div style={{ position:"relative", height:200 }}><canvas ref={typeRef} /></div>
        </ChartBox>
        <ChartBox title="Who cooks most?">
          <div style={{ position:"relative", height:200 }}><canvas ref={prepRef} /></div>
        </ChartBox>
        <ChartBox title="Top 10 most frequent dishes" >
          <div style={{ position:"relative", height:200 }}><canvas ref={dishRef} /></div>
        </ChartBox>
      </div>
    </Card>
  );
}

// ─── DataView ─────────────────────────────────────────────────────────────────
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
        const wb = window.XLSX.read(e.target.result, { type:"array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = window.XLSX.utils.sheet_to_json(ws, { defval:"" }).map(r => ({
          date:       String(r["Date"]                   || r.date       || "").trim(),
          meal:       String(r["Meal"]                   || r.meal       || "").trim(),
          type:       String(r["Type"]                   || r.type       || "Home").trim(),
          dish:       String(r["Dish / Description"]     || r.dish       || "").trim(),
          preparedBy: String(r["Prepared By / Provider"] || r.preparedBy || "").trim(),
        })).filter(r => r.date && r.meal);
        replaceAll(rows);
        show(`Loaded ${rows.length} entries from ${file.name}`);
      } catch { show("Could not read file — use the template", "error"); }
    };
    reader.readAsArrayBuffer(file);
  }, [replaceAll, show]);

  const exportXlsx = useCallback(() => {
    if (!window.XLSX) { show("XLSX not loaded", "error"); return; }
    if (!data.length) { show("No data to export", "error"); return; }
    const ws = window.XLSX.utils.json_to_sheet(data.map(r => ({ Date:r.date, Meal:r.meal, Type:r.type, "Dish / Description":r.dish, "Prepared By / Provider":r.preparedBy })));
    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, "Food Log");
    window.XLSX.writeFile(wb, `food_log_${today()}.xlsx`);
    show(`Exported ${data.length} records`);
  }, [data, show]);

  const downloadTemplate = useCallback(() => {
    if (!window.XLSX) { show("XLSX not loaded", "error"); return; }
    const rows = [
      ["Date","Meal","Type","Dish / Description","Prepared By / Provider"],
      ["2026-04-25","Breakfast","Home","Poha with peanuts","Sachin"],
      ["2026-04-25","Lunch","Ordered","Puttu Kadala","Swiggy"],
      ["2026-04-25","Dinner","Skipped","",""],
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

      <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:20 }}>
        <Btn variant="primary" onClick={downloadTemplate}>⬇ Template</Btn>
        <Btn onClick={exportXlsx}>💾 Export Excel</Btn>
        <Btn variant="danger" onClick={handleClear}>🗑 Clear All</Btn>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) importFile(f); }}
        onClick={() => fileRef.current?.click()}
        style={{ border:`2px dashed ${dragging ? T.color.sage : T.color.sageMid}`, borderRadius: T.r.lg, padding:"32px 20px", textAlign:"center", background: dragging ? T.color.sagePale : T.color.cream, cursor:"pointer", transition:"all .2s" }}
      >
        <div style={{ fontSize:28, marginBottom:8 }}>📤</div>
        <div style={{ fontWeight:600, color: T.color.inkSoft, marginBottom:4 }}>Drag & drop Excel file here</div>
        <div style={{ fontSize:16, color: T.color.sage }}>or click to browse (.xlsx / .xls)</div>
        <input ref={fileRef} type="file" accept=".xlsx,.xls" style={{ display:"none" }} onChange={e => { const f = e.target.files[0]; if (f) importFile(f); e.target.value = ""; }} />
      </div>

      <Divider />

      <div style={{ padding:"16px 18px", background: T.color.creamDark, borderRadius: T.r.md, border:`1px solid ${T.color.border}` }}>
        <div style={{ fontFamily: T.font.display, fontSize:20, fontWeight:600, marginBottom:10 }}>How it works</div>
        <ol style={{ paddingLeft:18, lineHeight:2, fontSize:16, color: T.color.inkMuted }}>
          <li>Download the template above and fill in your meals.</li>
          <li>Import it here — replaces all existing entries.</li>
          <li>Use the <strong style={{ color: T.color.sage }}>Log</strong> tab daily with smart autocomplete.</li>
          <li>Check <strong style={{ color: T.color.sage }}>Insights</strong> to discover patterns.</li>
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
    <div style={{ background: T.color.sage, position:"sticky", top:0, zIndex:100, boxShadow:"0 2px 18px rgba(0,0,0,0.18)" }}>
      <div style={{ maxWidth:960, margin:"0 auto", padding:"16px 20px 0" }}>

        {/* Logo + stats */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14, flexWrap:"wrap" }}>
          <div style={{ width:42, height:42, background:"rgba(255,255,255,0.14)", borderRadius: T.r.md, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>🥗</div>
          <div>
            <div style={{ fontFamily: T.font.display, fontSize:48, fontWeight:700, color:"#fff", letterSpacing:"-.5px", lineHeight:1 }}>BiteBook</div>
            <div style={{ fontSize:16, color:"rgba(255,255,255,.6)", letterSpacing:"1.3px", textTransform:"uppercase", marginTop:2 }}>Your daily food log</div>
          </div>
          <div style={{ marginLeft:"auto", display:"flex", gap:7, flexWrap:"wrap" }}>
            {[`${total} meals`, streak > 0 ? `${streak}d streak 🔥` : "Start a streak!"].map(t => (
              <span key={t} style={{ background:"rgba(255,255,255,.14)", color:"rgba(255,255,255,.9)", fontSize:16, fontWeight:500, padding:"4px 12px", borderRadius: T.r.full, border:"1px solid rgba(255,255,255,.2)" }}>{t}</span>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:2, overflowX:"auto", scrollbarWidth:"none" }}>
          {TABS.map(tab => {
            const on = tab.id === active;
            return (
              <button key={tab.id} onClick={() => onSwitch(tab.id)} style={{
                padding:"9px 16px", background: on ? T.color.white : "transparent",
                color: on ? T.color.sage : "rgba(255,255,255,.75)",
                border:"none", borderRadius:`${T.r.md} ${T.r.md} 0 0`,
                fontFamily: T.font.body, fontSize:16, fontWeight: on ? 600 : 400,
                cursor:"pointer", whiteSpace:"nowrap", transition:"all .14s",
              }}>
                <span style={{ marginRight:5 }}>{tab.icon}</span>{tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
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
        <GlobalStyles />
        <Datalists dishes={foodData.suggestions.dishes} persons={foodData.suggestions.persons} />

        <Header streak={foodData.streak} total={foodData.data.length} active={active} onSwitch={setActive} />

        <main style={{ maxWidth:960, margin:"0 auto", padding:"20px 16px 48px" }}>
          <div key={active} style={{ animation:"fadeUp .25s ease both" }}>
            {views[active]}
          </div>
        </main>

        <Toast toast={toast} />
      </ToastCtx.Provider>
    </AppCtx.Provider>
  );
}
