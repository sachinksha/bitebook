import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import "./FilterSortModal.css";

// Both the overlay and the modal panel are rendered via a React portal so they
// always attach directly to document.body, escaping any parent stacking context
// (e.g. the bb-view-animate animation wrapper) that would otherwise trap
// position:fixed children and prevent true viewport centering.
export function FilterSortModal({
  isOpen,
  onClose,
  filters,
  sort,
  onApply,
  availableData,
}) {
  const [localFilters, setLocalFilters] = useState(filters);
  const [localSort, setLocalSort] = useState(sort);
  const [foodSearch, setFoodSearch] = useState(filters.foodSearch || "");
  const [foodSuggestions, setFoodSuggestions] = useState([]);

  useEffect(() => {
    setLocalFilters(filters);
    setFoodSearch(filters.foodSearch || "");
  }, [isOpen, filters]);

  useEffect(() => {
    setLocalSort(sort);
  }, [isOpen, sort]);

  const handleFoodSearchChange = (value) => {
    setFoodSearch(value);
    if (value.length > 0) {
      const matches = availableData.foods.filter((food) =>
        food.toLowerCase().includes(value.toLowerCase())
      );
      setFoodSuggestions(matches.slice(0, 5));
    } else {
      setFoodSuggestions([]);
    }
  };

  const handleApply = () => {
    onApply({ ...localFilters, foodSearch }, localSort);
    onClose();
  };

  const handleClear = () => {
    setLocalFilters({ mealType: null, madeByType: null, orderType: null, foodSearch: "" });
    setLocalSort({ field: "date", direction: "desc" });
    setFoodSearch("");
    setFoodSuggestions([]);
  };

  if (!isOpen) return null;

  return createPortal(
    <>
      <div className="filter-sort-modal-overlay" onClick={onClose} />
      <div className="filter-sort-modal">
        <div className="filter-sort-modal-header">
          <h2>Filter & Sort</h2>
          <button className="filter-sort-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="filter-sort-modal-content">
          {/* FILTERS */}
          <div className="filter-sort-section">
            <h3 className="filter-sort-section-title">Filters</h3>

            <div className="filter-sort-group">
              <label className="filter-sort-label">Meal Type</label>
              <div className="filter-sort-button-group">
                {["All", "Breakfast", "Lunch", "Dinner"].map((meal) => (
                  <button
                    key={meal}
                    className={`filter-sort-pill ${
                      localFilters.mealType === (meal === "All" ? null : meal)
                        ? "filter-sort-pill-active"
                        : ""
                    }`}
                    onClick={() =>
                      setLocalFilters((prev) => ({
                        ...prev,
                        mealType: meal === "All" ? null : meal,
                      }))
                    }
                  >
                    {meal}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-sort-group">
              <label className="filter-sort-label">Made By</label>
              <div className="filter-sort-button-group">
                {["All", "Person", "Restaurant"].map((type) => (
                  <button
                    key={type}
                    className={`filter-sort-pill ${
                      localFilters.madeByType ===
                      (type === "All" ? null : type.toLowerCase())
                        ? "filter-sort-pill-active"
                        : ""
                    }`}
                    onClick={() =>
                      setLocalFilters((prev) => ({
                        ...prev,
                        madeByType: type === "All" ? null : type.toLowerCase(),
                      }))
                    }
                  >
                    {type === "Person" ? "🧑 " : type === "Restaurant" ? "🏪 " : ""}
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {availableData.orderTypes && availableData.orderTypes.length > 0 && (
              <div className="filter-sort-group">
                <label className="filter-sort-label">Order Type</label>
                <div className="filter-sort-button-group">
                  {["All", "Dine-in", "Delivery"].map((type) => (
                    <button
                      key={type}
                      className={`filter-sort-pill ${
                        localFilters.orderType ===
                        (type === "All" ? null : type === "Dine-in" ? "dine-in" : "delivery")
                          ? "filter-sort-pill-active"
                          : ""
                      }`}
                      onClick={() =>
                        setLocalFilters((prev) => ({
                          ...prev,
                          orderType:
                            type === "All" ? null : type === "Dine-in" ? "dine-in" : "delivery",
                        }))
                      }
                    >
                      {type === "Dine-in" ? "🍽 " : type === "Delivery" ? "📦 " : ""}
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="filter-sort-group">
              <label className="filter-sort-label">Food Search</label>
              <div className="filter-sort-search-input">
                <input
                  type="text"
                  placeholder="Search by dish name..."
                  value={foodSearch}
                  onChange={(e) => handleFoodSearchChange(e.target.value)}
                  className="filter-sort-input"
                />
                {foodSearch && (
                  <button
                    className="filter-sort-clear-input"
                    onClick={() => handleFoodSearchChange("")}
                  >
                    ✕
                  </button>
                )}
                {foodSuggestions.length > 0 && (
                  <div className="filter-sort-suggestions">
                    {foodSuggestions.map((food) => (
                      <div
                        key={food}
                        className="filter-sort-suggestion-item"
                        onClick={() => {
                          setFoodSearch(food);
                          setFoodSuggestions([]);
                        }}
                      >
                        {food}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SORT */}
          <div className="filter-sort-section">
            <h3 className="filter-sort-section-title">Sort</h3>

            <div className="filter-sort-group">
              <label className="filter-sort-label">Sort By</label>
              <div className="filter-sort-button-group">
                {[
                  { value: "date",     label: "Date" },
                  { value: "mealType", label: "Meal Type" },
                  { value: "madeBy",   label: "Made By" },
                  { value: "dish",     label: "Dish" },
                ].map((option) => (
                  <button
                    key={option.value}
                    className={`filter-sort-pill ${
                      localSort.field === option.value ? "filter-sort-pill-active" : ""
                    }`}
                    onClick={() =>
                      setLocalSort((prev) => ({ ...prev, field: option.value }))
                    }
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-sort-group">
              <label className="filter-sort-label">Direction</label>
              <div className="filter-sort-button-group">
                {[
                  { value: "desc", label: "↓ Descending" },
                  { value: "asc",  label: "↑ Ascending" },
                ].map((option) => (
                  <button
                    key={option.value}
                    className={`filter-sort-pill ${
                      localSort.direction === option.value ? "filter-sort-pill-active" : ""
                    }`}
                    onClick={() =>
                      setLocalSort((prev) => ({ ...prev, direction: option.value }))
                    }
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="filter-sort-modal-actions">
          <button className="filter-sort-btn filter-sort-btn-clear" onClick={handleClear}>
            Clear All
          </button>
          <button className="filter-sort-btn filter-sort-btn-apply" onClick={handleApply}>
            Apply
          </button>
        </div>
      </div>
    </>,
    document.body
  );
}
