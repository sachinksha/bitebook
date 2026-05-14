import { TABS } from "./constants.js";

export function Header({ streak, total, active, onSwitch }) {
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
