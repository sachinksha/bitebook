import { useState, useMemo, useEffect, useRef } from "react";
import { THEME } from "../../styles/theme.js";
import { daysAgo, today } from "../../utils/dateUtils.js";
import { useApp } from "../../context/contexts.js";
import { useCharts } from "../../hooks/index.js";
import { Card, SectionHeading, Field, Inp } from "../primitives/index.js";
import { InsightChip } from "../features/index.js";
import "./InsightsView.css";

export function InsightsView() {
  const { data } = useApp();
  const [from, setFrom] = useState(daysAgo(90));
  const [to, setTo] = useState(today());
  const typeRef = useRef(null);
  const prepRef = useRef(null);
  const dishRef = useRef(null);
  const buildChart = useCharts();

  const filtered = useMemo(() => {
    const f = new Date(from),
      t = new Date(to);
    t.setHours(23, 59, 59, 999);
    return data.filter((r) => {
      const d = new Date(r.date);
      return d >= f && d <= t;
    });
  }, [data, from, to]);

  const stats = useMemo(() => {
    const dc = {},
      lp = {};
    filtered.forEach((r) => {
      if (r.dish) {
        dc[r.dish] = (dc[r.dish] || 0) + 1;
        lp[r.dish] = r.date;
      }
    });
    const topDish = Object.entries(dc).sort((a, b) => b[1] - a[1])[0];
    let leastRecent = "",
      maxDays = 0;
    const now = new Date();
    Object.keys(lp).forEach((d) => {
      const days = Math.floor((now - new Date(lp[d])) / 86400000);
      if (days > maxDays) {
        maxDays = days;
        leastRecent = d;
      }
    });
    const n = filtered.length;
    return {
      topDish,
      leastRecent,
      maxDays,
      homePct: n
        ? Math.round(
            (filtered.filter((r) => r.type === "Home").length / n) * 100
          )
        : 0,
      orderedPct: n
        ? Math.round(
            (filtered.filter((r) => r.type === "Ordered").length / n) * 100
          )
        : 0,
    };
  }, [filtered]);

  useEffect(() => {
    if (!window.Chart) return;
    const FONT = { family: THEME.font.body, size: 14 };
    const LEGEND = {
      position: "bottom",
      labels: { font: FONT, padding: 10, boxWidth: 10 },
    };

    // Type doughnut
    const tc = { Home: 0, Ordered: 0, Skipped: 0 };
    filtered.forEach((r) => (tc[r.type] = (tc[r.type] || 0) + 1));
    buildChart(
      "type",
      typeRef.current,
      "doughnut",
      {
        labels: ["Home", "Ordered", "Skipped"],
        datasets: [
          {
            data: [tc.Home, tc.Ordered, tc.Skipped],
            backgroundColor: [
              THEME.color.sage,
              THEME.color.amber,
              THEME.color.parchment,
            ],
            borderWidth: 0,
            hoverOffset: 5,
          },
        ],
      },
      {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "62%",
        plugins: { legend: LEGEND },
      }
    );

    // Prep doughnut
    const pc = {};
    filtered.forEach((r) => {
      if (r.preparedBy && r.type !== "Skipped")
        pc[r.preparedBy] = (pc[r.preparedBy] || 0) + 1;
    });
    const pL = Object.keys(pc).slice(0, 8);
    const PAL = [
      THEME.color.sage,
      THEME.color.amber,
      "#5b52c2",
      "#0d9488",
      "#b85c38",
      "#e879f9",
      "#06b6d4",
      "#84cc16",
    ];
    buildChart(
      "prep",
      prepRef.current,
      "doughnut",
      {
        labels: pL.length ? pL : ["No data"],
        datasets: [
          {
            data: pL.length ? pL.map((k) => pc[k]) : [1],
            backgroundColor: PAL,
            borderWidth: 0,
            hoverOffset: 5,
          },
        ],
      },
      {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "62%",
        plugins: { legend: LEGEND },
      }
    );

    // Dish bar
    const dc2 = {};
    filtered.forEach((r) => {
      if (r.dish) dc2[r.dish] = (dc2[r.dish] || 0) + 1;
    });
    const dishes = Object.entries(dc2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    buildChart(
      "dish",
      dishRef.current,
      "bar",
      {
        labels: dishes.map(([k]) =>
          k.length > 15 ? k.slice(0, 13) + "…" : k
        ),
        datasets: [
          {
            data: dishes.map(([, v]) => v),
            backgroundColor: THEME.color.sage,
            borderRadius: 6,
            hoverBackgroundColor: THEME.color.sageMid,
          },
        ],
      },
      {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1, font: FONT },
            grid: { color: "#f0ece3" },
          },
          x: {
            ticks: { font: FONT },
            grid: { display: false },
          },
        },
      }
    );
  }, [filtered, buildChart]);

  const ChartBox = ({ title, children }) => (
    <div className="insights-chart-box">
      <div className="insights-chart-title">{title}</div>
      {children}
    </div>
  );

  return (
    <Card>
      <SectionHeading icon="📊" iconBg={THEME.color.amberPale}>
        Insights & Visualizations
      </SectionHeading>

      {/* Date range */}
      <div className="insights-date-range">
        <Field label="From" style={{ marginBottom: 0 }}>
          <Inp
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            style={{ width: 148 }}
          />
        </Field>
        <Field label="To" style={{ marginBottom: 0 }}>
          <Inp
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            style={{ width: 148 }}
          />
        </Field>
        <span className="insights-meal-count">
          {filtered.length} meals in range
        </span>
      </div>

      {/* Insight chips */}
      <div className="insights-chips">
        <InsightChip
          emoji="🔥"
          label="Most repeated"
          value={stats.topDish?.[0]}
          sub={
            stats.topDish
              ? `${stats.topDish[1]}× logged`
              : "No data"
          }
          bg={THEME.color.sagePale}
          accent={THEME.color.sage}
        />
        <InsightChip
          emoji="🌱"
          label="Try again soon"
          value={stats.leastRecent || "—"}
          sub={
            stats.leastRecent
              ? `${stats.maxDays} days ago`
              : "Not enough data"
          }
          bg={THEME.color.amberPale}
          accent={THEME.color.amber}
        />
        <InsightChip
          emoji="🏠"
          label="Home-cooked"
          value={`${stats.homePct}%`}
          sub={`vs ${stats.orderedPct}% ordered`}
          bg={THEME.color.creamDark}
          accent={THEME.color.inkMuted}
        />
      </div>

      {/* Charts */}
      <div className="insights-charts">
        <ChartBox title="Meal types breakdown">
          <div style={{ position: "relative", height: 200 }}>
            <canvas ref={typeRef} />
          </div>
        </ChartBox>
        <ChartBox title="Who cooks most?">
          <div style={{ position: "relative", height: 200 }}>
            <canvas ref={prepRef} />
          </div>
        </ChartBox>
        <ChartBox title="Top 10 most frequent dishes">
          <div style={{ position: "relative", height: 200 }}>
            <canvas ref={dishRef} />
          </div>
        </ChartBox>
      </div>
    </Card>
  );
}
