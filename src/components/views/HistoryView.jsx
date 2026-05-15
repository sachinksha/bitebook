import { useState, useMemo, useCallback } from "react";
import { THEME } from "../../styles/theme.js";
import { fmtWday, fmtShort, MEAL_ORDER } from "../../utils/dateUtils.js";
import { useApp, useToastCtx } from "../../context/contexts.js";
import { Card, SectionHeading, Btn, Badge, EmptyState } from "../primitives/index.js";
import { EditModal } from "../features/index.js";
import "./HistoryView.css";

const MEAL_ICONS = { Breakfast: "🌅", Lunch: "☀️", Dinner: "🌙" };

export function HistoryView() {
  const { data, updateEntry, deleteEntry } = useApp();
  const { show } = useToastCtx();
  const [editIdx, setEditIdx] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const sorted = useMemo(
    () =>
      [...data]
        .map((r, i) => ({ ...r, _i: i }))
        .sort(
          (a, b) =>
            (a.date !== b.date ? new Date(b.date) - new Date(a.date) : 0) ||
            ((MEAL_ORDER[a.meal] || 9) - (MEAL_ORDER[b.meal] || 9))
        ),
    [data]
  );

  const groupedByDate = useMemo(() => {
    const groups = {};
    sorted.forEach((entry) => {
      if (!groups[entry.date]) {
        groups[entry.date] = [];
      }
      groups[entry.date].push(entry);
    });
    return Object.entries(groups).sort((a, b) => new Date(b[0]) - new Date(a[0]));
  }, [sorted]);

  const handleSave = (idx, entry) => {
    updateEntry(data[idx].id, entry);
    setEditIdx(null);
    show("Entry updated");
  };

  const handleDel = (idx) => {
    if (!confirm("Delete this entry?")) return;
    deleteEntry(data[idx].id);
    setEditIdx(null);
    show("Deleted", "error");
  };

  const handleQuickEdit = useCallback(
    (idx, field, value) => {
      const entry = { ...data[idx], [field]: value };
      updateEntry(data[idx].id, entry);
      show(`${field} updated`);
    },
    [data, updateEntry, show]
  );

  const EntryCard = ({ row }) => {
    const entryId = `${row.date}-${row.meal}`;
    const isExpanded = expandedId === entryId;

    return (
      <div key={entryId} className="history-entry-card">
        <div
          className="history-entry-header"
          onClick={() =>
            setExpandedId(isExpanded ? null : entryId)
          }
        >
          <span className="history-entry-icon">{MEAL_ICONS[row.meal]}</span>
          <span className="history-entry-name">{row.meal}</span>
          <Badge type={row.type} />
          {row.dish && <span className="history-entry-dish">{row.dish}</span>}
          <button className="history-expand-btn">
            {isExpanded ? "▼" : "▶"}
          </button>
        </div>

        {isExpanded && (
          <div className="history-entry-details">
            {row.preparedBy && (
              <div className="history-detail-row">
                <span className="history-detail-label">By:</span>
                <span className="history-detail-value">{row.preparedBy}</span>
              </div>
            )}
            {row.type === "Ordered" && (
              <>
                <div className="history-detail-row">
                  <span className="history-detail-label">Made by:</span>
                  <select
                    value={row.madeByType || "person"}
                    onChange={(e) =>
                      handleQuickEdit(row._i, "madeByType", e.target.value)
                    }
                    className="history-detail-select"
                  >
                    <option value="person">🧑 Person</option>
                    <option value="restaurant">🏪 Restaurant</option>
                  </select>
                </div>
                <div className="history-detail-row">
                  <span className="history-detail-label">Order type:</span>
                  <select
                    value={row.orderType || "dine-in"}
                    onChange={(e) =>
                      handleQuickEdit(row._i, "orderType", e.target.value)
                    }
                    className="history-detail-select"
                  >
                    <option value="dine-in">🍽 Dine-in</option>
                    <option value="delivery">📦 Delivery</option>
                  </select>
                </div>
              </>
            )}
            <div className="history-detail-actions">
              <button
                onClick={() => setEditIdx(row._i)}
                className="history-detail-btn"
              >
                ✏️ Edit
              </button>
              <button
                onClick={() => handleDel(row._i)}
                className="history-detail-btn history-detail-btn-delete"
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Card>
        <SectionHeading
          icon="📋"
          iconBg={THEME.color.creamDark}
          aside={
            <span className="history-entry-count">
              {data.length} entries
            </span>
          }
        >
          All Entries
        </SectionHeading>

        {data.length === 0 ? (
          <EmptyState
            icon="🍽️"
            msg="No entries yet — start logging your meals!"
          />
        ) : (
          <div className="history-list">
            {groupedByDate.map(([date, entries]) => (
              <div key={date} className="history-date-group">
                <div className="history-date-header">
                  <span className="history-date-label">
                    {fmtWday(date)}, {fmtShort(date)}
                  </span>
                  <span className="history-date-count">
                    {entries.length} meal{entries.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="history-entries">
                  {entries.map((entry) => (
                    <EntryCard key={`${entry.date}-${entry.meal}`} row={entry} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {editIdx !== null && data[editIdx] && (
        <EditModal
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
