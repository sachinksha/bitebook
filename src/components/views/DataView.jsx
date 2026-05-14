import { useState, useCallback, useRef } from "react";
import { today } from "../../utils/dateUtils.js";
import { useApp, useToastCtx } from "../../context/contexts.js";
import {
  Card,
  SectionHeading,
  Btn,
  Divider,
} from "../primitives/index.js";
import "./DataView.css";

export function DataView() {
  const { data, replaceAll, clearAll } = useApp();
  const { show } = useToastCtx();
  const fileRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const importFile = useCallback(
    (file) => {
      if (!window.XLSX) {
        show("XLSX library not loaded", "error");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const wb = window.XLSX.read(e.target.result, { type: "array" });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const rows = window.XLSX.utils
            .sheet_to_json(ws, { defval: "" })
            .map((r) => ({
              date: String(r["Date"] || r.date || "").trim(),
              meal: String(r["Meal"] || r.meal || "").trim(),
              type: String(r["Type"] || r.type || "Home").trim(),
              dish: String(r["Dish / Description"] || r.dish || "").trim(),
              preparedBy: String(
                r["Prepared By / Provider"] || r.preparedBy || ""
              ).trim(),
              madeByType: String(r["Made by"] || r.madeByType || "person").trim(),
              orderType: String(r["Order Type"] || r.orderType || "dine-in").trim(),
            }))
            .filter((r) => r.date && r.meal);
          replaceAll(rows);
          show(`Loaded ${rows.length} entries from ${file.name}`);
        } catch {
          show(
            "Could not read file — use the template",
            "error"
          );
        }
      };
      reader.readAsArrayBuffer(file);
    },
    [replaceAll, show]
  );

  const exportXlsx = useCallback(() => {
    if (!window.XLSX) {
      show("XLSX not loaded", "error");
      return;
    }
    if (!data.length) {
      show("No data to export", "error");
      return;
    }
    const ws = window.XLSX.utils.json_to_sheet(
      data.map((r) => ({
        Date: r.date,
        Meal: r.meal,
        Type: r.type,
        "Dish / Description": r.dish,
        "Prepared By / Provider": r.preparedBy,
        "Made by": r.madeByType || "person",
        "Order Type": r.orderType || "dine-in",
      }))
    );
    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, "Food Log");
    window.XLSX.writeFile(wb, `food_log_${today()}.xlsx`);
    show(`Exported ${data.length} records`);
  }, [data, show]);

  const downloadTemplate = useCallback(() => {
    if (!window.XLSX) {
      show("XLSX not loaded", "error");
      return;
    }
    const rows = [
      [
        "Date",
        "Meal",
        "Type",
        "Dish / Description",
        "Prepared By / Provider",
        "Made by",
        "Order Type",
      ],
      [
        "2026-04-25",
        "Breakfast",
        "Home",
        "Poha with peanuts",
        "Sachin",
        "person",
        "dine-in",
      ],
      [
        "2026-04-25",
        "Lunch",
        "Ordered",
        "Puttu Kadala",
        "Swiggy",
        "restaurant",
        "delivery",
      ],
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
      <SectionHeading icon="📁">Data & Excel</SectionHeading>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        <Btn variant="primary" onClick={downloadTemplate}>
          ⬇ Template
        </Btn>
        <Btn onClick={exportXlsx}>💾 Export Excel</Btn>
        <Btn variant="danger" onClick={handleClear}>
          🗑 Clear All
        </Btn>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const f = e.dataTransfer.files[0];
          if (f) importFile(f);
        }}
        onClick={() => fileRef.current?.click()}
        className={`data-view-dropzone ${dragging ? "dragging" : ""}`}
      >
        <div style={{ fontSize: 28, marginBottom: 8 }}>📤</div>
        <div className="data-view-dropzone-title">
          Drag & drop Excel file here
        </div>
        <div className="data-view-dropzone-subtitle">
          or click to browse (.xlsx / .xls)
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls"
          style={{ display: "none" }}
          onChange={(e) => {
            const f = e.target.files[0];
            if (f) importFile(f);
            e.target.value = "";
          }}
        />
      </div>

      <Divider />

      <div className="data-view-info">
        <div className="data-view-info-title">How it works</div>
        <ol className="data-view-info-list">
          <li>Download the template above and fill in your meals.</li>
          <li>Import it here — replaces all existing entries.</li>
          <li>
            Use the <strong>Log</strong> tab daily with smart autocomplete.
          </li>
          <li>
            Check <strong>Insights</strong> to discover patterns.
          </li>
        </ol>
      </div>
    </Card>
  );
}
