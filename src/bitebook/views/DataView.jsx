import { useCallback, useRef, useState } from "react";
import {
  PREPARED_PERSON,
  PREPARED_RESTAURANT,
  SERVICE_DELIVERY,
  SERVICE_DINE_IN,
} from "../constants.js";
import { today } from "../dates.js";
import { normalizeEntry } from "../normalize.js";
import { useApp, useToastCtx } from "../context.jsx";
import { T } from "../theme.js";
import {
  Btn,
  Card,
  Divider,
  SectionHeading,
} from "../uiPrimitives.jsx";

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

export function DataView() {
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
