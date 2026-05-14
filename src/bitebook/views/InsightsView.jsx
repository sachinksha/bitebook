import { useEffect, useMemo, useRef, useState } from "react";
import {
  PREPARED_PERSON,
  PREPARED_RESTAURANT,
  SERVICE_DELIVERY,
  SERVICE_DINE_IN,
} from "../constants.js";
import { daysAgo, today } from "../dates.js";
import { useApp } from "../context.jsx";
import { useCharts } from "../hooks.js";
import { InsightChip } from "../InsightChip.jsx";
import { T } from "../theme.js";
import {
  Card,
  Field,
  Inp,
  InsightChartBox,
  SectionHeading,
} from "../uiPrimitives.jsx";

export function InsightsView() {
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
