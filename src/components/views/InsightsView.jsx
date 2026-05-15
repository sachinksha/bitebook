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
    const dishMap = {};
    filtered.forEach((r) => {
      const dish = r.dish?.trim();
      if (!dish) return;
      const date = new Date(r.date);
      if (!dishMap[dish]) {
        dishMap[dish] = { dish, count: 0, lastDate: date };
      }
      dishMap[dish].count += 1;
      if (date > dishMap[dish].lastDate) {
        dishMap[dish].lastDate = date;
      }
    });

    const now = new Date();
    const dishHistory = Object.values(dishMap).map((item) => {
      const daysSince = Math.floor((now - item.lastDate) / 86400000);
      return { ...item, daysSince };
    });

    const topDish = Object.values(dishMap)
      .sort((a, b) => b.count - a.count)[0] || null;

    const leastRecent = dishHistory
      .sort((a, b) => b.daysSince - a.daysSince)[0]?.dish || "";
    const maxDays = dishHistory
      .sort((a, b) => b.daysSince - a.daysSince)[0]?.daysSince || 0;

    const eligible = dishHistory.filter((item) => item.daysSince >= 4);
    const orderedEligible = eligible.sort(
      (a, b) => b.daysSince - a.daysSince || a.dish.localeCompare(b.dish)
    );
    const pickAlternate = orderedEligible.filter((_, idx) => idx % 2 === 0);
    let suggestions = pickAlternate.slice(0, 3).map((item) => item.dish);
    if (suggestions.length < 3) {
      suggestions = suggestions.concat(
        orderedEligible
          .filter((_, idx) => idx % 2 !== 0)
          .slice(0, 3 - suggestions.length)
          .map((item) => item.dish)
      );
    }

    const notEnoughData =
      filtered.length < 6 ||
      Object.keys(dishMap).length < 3 ||
      suggestions.length < 3;

    const suggestionMessage = notEnoughData
      ? Object.keys(dishMap).length < 3
        ? "Not enough varied history to recommend 3 dishes yet. Keep logging meals."
        : filtered.length < 6
        ? "Log more meals over a few days to get stronger recommendations."
        : "Wait 3-4 days before repeating the same dish to get a full set of suggestions."
      : "These dishes are popular and haven’t been eaten in the last 3-4 days.";

    const n = filtered.length;
    return {
      topDish,
      leastRecent,
      maxDays,
      suggestions,
      suggestCount: suggestions.length,
      suggestionMessage,
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
          value={stats.topDish?.dish || "—"}
          sub={
            stats.topDish
              ? `${stats.topDish.count}× logged`
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

      <div className="insights-suggestions">
        <div className="insights-suggestions-header">
          <div className="insights-suggestions-title">Cook next</div>
          <div className="insights-suggestions-note">
            {stats.suggestionMessage}
          </div>
        </div>
        {stats.suggestions.length ? (
          <ul className="insights-suggestion-list">
            {stats.suggestions.map((dish) => (
              <li key={dish} className="insights-suggestion-item">
                <span className="insights-suggestion-dot" />
                {dish}
              </li>
            ))}
          </ul>
        ) : (
          <div className="insights-suggestion-empty">
            {stats.suggestionMessage}
          </div>
        )}
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
