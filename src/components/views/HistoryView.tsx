import { useState, useMemo, useCallback } from "react";
import { THEME } from "../../styles/theme.js";
import { fmtWday, fmtShort, MEAL_ORDER } from "../../utils/dateUtils.js";
import { useApp, useToastCtx } from "../../context/contexts.js";
import { Card, SectionHeading, Btn, Badge, EmptyState } from "../primitives/index.js";
import { EditModal, FilterSortModal } from "../features/index.js";
import { useFilter } from "../../hooks/useFilter.js";
import { useSort } from "../../hooks/useSort.js";
import "./HistoryView.css";

const MEAL_ICONS = { Breakfast: "🌅", Lunch: "☀️", Dinner: "🌙" };

export function HistoryView() {
  const { data, updateEntry, deleteEntry } = useApp();
  const { show } = useToastCtx();
  const [editIdx, setEditIdx] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    mealType: null,
    madeByType: null,
    orderType: null,
    foodSearch: "",
  });
  const [sort, setSort] = useState({
    field: "date",
    direction: "desc",
  });

  // Apply filters
  const filteredData = useFilter(data, filters);

  // Apply sorting
  const sortedData = useSort(filteredData, sort);

  // Extract available filter options from current data
  const availableData = useMemo(() => {
    const meals = new Set();
    const madeByTypes = new Set();
    const orderTypes = new Set();
    const foods = new Set();

    data.forEach((entry) => {
      if (entry.meal) meals.add(entry.meal);
      if (entry.madeByType) madeByTypes.add(entry.madeByType);
      if (entry.type === "Ordered" && entry.orderType) orderTypes.add(entry.orderType);
      if (entry.dish) foods.add(entry.dish);
    });

    return {
      meals: Array.from(meals),
      madeByTypes: Array.from(madeByTypes),
      orderTypes: Array.from(orderTypes),
      foods: Array.from(foods).sort(),
    };
  }, [data]);

  // Group filtered and sorted data by date
  const groupedByDate = useMemo(() => {
    const groups = {};
    sortedData.forEach((entry) => {
      if (!groups[entry.date]) {
        groups[entry.date] = [];
      }
      groups[entry.date].push(entry);
    });
    
    // Sort date groups according to user's sort preference
    const dateGroups = Object.entries(groups);
    
    if (sort.field === "date") {
      // If sorting by date, respect the direction
      if (sort.direction === "asc") {
        dateGroups.sort((a, b) => new Date(a[0]) - new Date(b[0]));
      } else {
        dateGroups.sort((a, b) => new Date(b[0]) - new Date(a[0]));
      }
    } else {
      // If sorting by other field, keep newest first for better UX
      dateGroups.sort((a, b) => new Date(b[0]) - new Date(a[0]));
    }
    
    return dateGroups;
  }, [sortedData, sort]);

  const handleSave = (entry) => {
    updateEntry(entry.id, entry);
    setEditIdx(null);
    show("Entry updated");
  };

  const handleDel = (entry) => {
    if (!confirm("Delete this entry?")) return;
    deleteEntry(entry.id);
    setEditIdx(null);
    show("Deleted", "error");
  };

  const handleQuickEdit = useCallback(
    (entry, field, value) => {
      const updatedEntry = { ...entry, [field]: value };
      updateEntry(entry.id, updatedEntry);
      show(`${field} updated`);
    },
    [updateEntry, show]
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
                      handleQuickEdit(row, "madeByType", e.target.value)
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
                      handleQuickEdit(row, "orderType", e.target.value)
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
                onClick={() => setEditIdx(row.id)}
                className="history-detail-btn"
              >
                ✏️ Edit
              </button>
              <button
                onClick={() => handleDel(row)}
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

  // Get active filter badges
  const activeFilterBadges = useMemo(() => {
    const badges = [];
    if (filters.mealType) badges.push(filters.mealType);
    if (filters.madeByType) badges.push(filters.madeByType === "person" ? "Person" : "Restaurant");
    if (filters.orderType) badges.push(filters.orderType === "dine-in" ? "Dine-in" : "Delivery");
    if (filters.foodSearch) badges.push(`"${filters.foodSearch}"`);
    return badges;
  }, [filters]);

  return (
    <>
      <FilterSortModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        sort={sort}
        onApply={(newFilters, newSort) => {
          setFilters(newFilters);
          setSort(newSort);
        }}
        availableData={{
          meals: availableData.meals,
          madeByTypes: availableData.madeByTypes,
          orderTypes: availableData.orderTypes,
          foods: availableData.foods,
        }}
      />

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <SectionHeading
            icon="📋"
            iconBg={THEME.color.creamDark}
          >
            All Entries
          </SectionHeading>
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="history-filter-btn"
            title="Filter and sort"
          >
            ⚙️
          </button>
        </div>

        {activeFilterBadges.length > 0 && (
          <div className="history-active-filters">
            {activeFilterBadges.map((badge) => (
              <span key={badge} className="history-filter-badge">
                {badge}
              </span>
            ))}
            <button
              onClick={() => {
                setFilters({
                  mealType: null,
                  madeByType: null,
                  orderType: null,
                  foodSearch: "",
                });
                setSort({ field: "date", direction: "desc" });
              }}
              className="history-clear-filters-btn"
            >
              Clear
            </button>
          </div>
        )}

        {sortedData.length === 0 && data.length === 0 ? (
          <EmptyState
            icon="🍽️"
            msg="No entries yet — start logging your meals!"
          />
        ) : sortedData.length === 0 ? (
          <EmptyState
            icon="🔍"
            msg="No entries match your filters"
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

      {editIdx !== null && data.find((e) => e.id === editIdx) && (
        <EditModal
          entry={data.find((e) => e.id === editIdx)}
          idx={editIdx}
          onSave={handleSave}
          onDelete={handleDel}
          onClose={() => setEditIdx(null)}
        />
      )}
    </>
  );
}
