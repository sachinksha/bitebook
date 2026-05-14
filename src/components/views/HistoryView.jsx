import { useState, useMemo, useCallback } from "react";
import { THEME } from "../../styles/theme.js";
import { fmtWday, fmtShort, MEAL_ORDER } from "../../utils/dateUtils.js";
import { useApp, useToastCtx } from "../../context/contexts.js";
import { Card, SectionHeading, Btn, Badge, EmptyState } from "../primitives/index.js";
import { EditModal } from "../features/index.js";
import "./HistoryView.css";

export function HistoryView() {
  const { data, updateEntry, deleteEntry } = useApp();
  const { show } = useToastCtx();
  const [editIdx, setEditIdx] = useState(null);

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

  const handleSave = (idx, entry) => {
    updateEntry(idx, entry);
    setEditIdx(null);
    show("Entry updated");
  };

  const handleDel = (idx) => {
    if (!confirm("Delete this entry?")) return;
    deleteEntry(idx);
    setEditIdx(null);
    show("Deleted", "error");
  };

  const handleQuickEdit = useCallback(
    (idx, field, value) => {
      const entry = { ...data[idx], [field]: value };
      updateEntry(idx, entry);
      show(`${field} updated`);
    },
    [data, updateEntry, show]
  );

  const TH = ({ ch }) => (
    <th className="history-th">{ch}</th>
  );

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
          <div className="history-table-container">
            <table className="history-table">
              <thead>
                <tr>
                  <TH ch="Date" />
                  <TH ch="Meal" />
                  <TH ch="Type" />
                  <TH ch="Dish" />
                  <TH ch="By" />
                  <TH ch="Made by" />
                  <TH ch="Order" />
                  <TH ch="" />
                </tr>
              </thead>
              <tbody>
                {sorted.map((row) => (
                  <tr
                    key={`${row.date}-${row.meal}`}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = THEME.color.cream;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                    className="history-row"
                  >
                    <td className="history-cell">
                      <span
                        style={{
                          color: THEME.color.inkSoft,
                        }}
                      >
                        {fmtWday(row.date)}, {fmtShort(row.date)}
                      </span>
                    </td>
                    <td className="history-cell">
                      <span style={{ fontWeight: 500 }}>{row.meal}</span>
                    </td>
                    <td className="history-cell">
                      <Badge type={row.type} />
                    </td>
                    <td
                      className="history-cell"
                      style={{
                        maxWidth: 120,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        color: THEME.color.inkSoft,
                      }}
                    >
                      {row.dish || (
                        <span style={{ color: THEME.color.parchment }}>—</span>
                      )}
                    </td>
                    <td className="history-cell">
                      <span style={{ color: THEME.color.inkMuted }}>
                        {row.preparedBy || (
                          <span style={{ color: THEME.color.parchment }}>
                            —
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="history-cell">
                      {row.type === "Ordered" ? (
                        <select
                          value={row.madeByType || "person"}
                          onChange={(e) =>
                            handleQuickEdit(row._i, "madeByType", e.target.value)
                          }
                          className="history-quick-select"
                        >
                          <option value="person">🧑 Person</option>
                          <option value="restaurant">🏪 Restaurant</option>
                        </select>
                      ) : (
                        <span style={{ color: THEME.color.parchment }}>—</span>
                      )}
                    </td>
                    <td className="history-cell">
                      {row.type === "Ordered" ? (
                        <select
                          value={row.orderType || "dine-in"}
                          onChange={(e) =>
                            handleQuickEdit(row._i, "orderType", e.target.value)
                          }
                          className="history-quick-select"
                        >
                          <option value="dine-in">🍽 Dine-in</option>
                          <option value="delivery">📦 Delivery</option>
                        </select>
                      ) : (
                        <span style={{ color: THEME.color.parchment }}>—</span>
                      )}
                    </td>
                    <td className="history-cell">
                      <button
                        onClick={() => setEditIdx(row._i)}
                        className="history-edit-btn"
                      >
                        ✏️
                      </button>
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
