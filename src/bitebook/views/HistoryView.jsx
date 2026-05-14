import { useMemo, useState } from "react";
import { MEAL_ORDER } from "../constants.js";
import { fmtShort, fmtWday } from "../dates.js";
import { useApp, useToastCtx } from "../context.jsx";
import { EditModal } from "../EditModal.jsx";
import { T } from "../theme.js";
import {
  Badge,
  Card,
  EmptyState,
  ProviderKindBadge,
  SectionHeading,
  ServiceBadge,
  TableTh,
} from "../uiPrimitives.jsx";

export function HistoryView() {
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
