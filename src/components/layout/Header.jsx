import { THEME } from "../../styles/theme.js";
import "./Header.css";

const TABS = [
  { id: "log", icon: "📝", label: "Log" },
  { id: "calendar", icon: "🗓", label: "Calendar" },
  { id: "history", icon: "📋", label: "History" },
  { id: "insights", icon: "📊", label: "Insights" },
  { id: "data", icon: "📁", label: "Data" },
];

export function Header({ streak, total, active, onSwitch }) {
  return (
    <div className="header">
      <div className="header-content">
        {/* Logo + stats */}
        <div className="header-top">
          <div className="header-logo">🥗</div>
          <div className="header-title-section">
            <div className="header-title">BiteBook</div>
            <div className="header-subtitle">Your daily food log</div>
          </div>
          <div className="header-stats">
            {[`${total} meals`, streak > 0 ? `${streak}d streak 🔥` : "Start a streak!"].map(
              (t) => (
                <span key={t} className="header-stat">
                  {t}
                </span>
              )
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="header-tabs">
          {TABS.map((tab) => {
            const on = tab.id === active;
            return (
              <button
                key={tab.id}
                onClick={() => onSwitch(tab.id)}
                className={`header-tab ${on ? "header-tab-active" : ""}`}
              >
                <span style={{ marginRight: 5 }}>{tab.icon}</span>
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
