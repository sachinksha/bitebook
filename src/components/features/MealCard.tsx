import { useState, useEffect } from "react";
import { THEME } from "../../styles/theme.js";
import { useApp, useMealCtx } from "../../context/contexts.js";
import {
  Field,
  Inp,
  Sel,
  Btn,
  TypePills,
  FieldLabel,
} from "../primitives/index.js";
import "./MealCard.css";

export function MealCard({ meal, existing, onSave }) {
  const mc = THEME.meal[meal];
  const icon = { Breakfast: "🌅", Lunch: "☀️", Dinner: "🌙" }[meal];
  const { suggestions } = useApp();
  const { context, setContext } = useMealCtx();

  const [type, setType] = useState(existing?.type || "Home");
  const [dish, setDish] = useState(existing?.dish || "");
  const [person, setPerson] = useState(existing?.preparedBy || "");
  const [madeByType, setMadeByType] = useState(
    existing?.madeByType || "person"
  );
  const [orderType, setOrderType] = useState(existing?.orderType || "dine-in");
  const [saved, setSaved] = useState(false);

  // Sync when date changes or existing entry changes
  useEffect(() => {
    setType(existing?.type || "Home");
    setDish(existing?.dish || "");
    setPerson(existing?.preparedBy || "");
    setMadeByType(existing?.madeByType || "person");
    setOrderType(existing?.orderType || "dine-in");
    setSaved(false);
  }, [existing?.date, existing?.meal, meal]);

  // Update madeByType when type changes
  useEffect(() => {
    if (type === "Home") {
      setMadeByType("person");
    } else if (type === "Ordered") {
      setMadeByType("restaurant");
    }
  }, [type]);

  // Pre-fill from sticky context if no existing entry
  useEffect(() => {
    if (!existing && context.mealType === meal) {
      setMadeByType(context.madeByType || "person");
      setOrderType(context.orderType || "dine-in");
    }
  }, [context, existing, meal]);

  const handleSave = () => {
    const entry = {
      meal,
      type,
      dish: type === "Skipped" ? "" : dish,
      preparedBy: type === "Skipped" ? "" : person,
      madeByType,
      orderType: type === "Ordered" ? orderType : "dine-in",
    };
    onSave(entry);
    // Update sticky context
    setContext({ mealType: meal, madeByType, orderType });
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  return (
    <div
      className="meal-card"
      style={{
        borderColor: saved ? mc.color + "55" : THEME.color.border,
        boxShadow: saved
          ? `0 0 0 3px ${mc.color}18`
          : THEME.shadow.sm,
      }}
    >
      {/* Accent bar */}
      <div
        className="meal-card-accent"
        style={{ background: mc.bar }}
      />

      {/* Header */}
      <div className="meal-card-header">
        <span className="meal-card-icon">{icon}</span>
        <span className="meal-card-title">{meal}</span>
        {saved ? (
          <span className="meal-card-saved">✓ Saved</span>
        ) : existing ? (
          <span className="meal-card-logged">Logged ·</span>
        ) : null}
      </div>

      {/* Type */}
      <TypePills value={type} onChange={setType} />

      {/* Fields */}
      {type !== "Skipped" && (
        <>
          <div className="meal-card-fields">
            <div>
              <FieldLabel>Dish</FieldLabel>
              <Inp
                list="bb-dishes"
                placeholder={suggestions.topDish || "e.g. Poha"}
                value={dish}
                onChange={(e) => setDish(e.target.value)}
              />
            </div>
            <div>
              <FieldLabel>By</FieldLabel>
              <Inp
                list="bb-persons"
                placeholder={suggestions.topPerson || "Name"}
                value={person}
                onChange={(e) => setPerson(e.target.value)}
              />
            </div>
          </div>

          {/* New fields for Ordered meals */}
          {type === "Ordered" && (
            <div className="meal-card-fields">
              <div>
                <FieldLabel>Made by</FieldLabel>
                <Sel
                  value={madeByType}
                  onChange={(e) => setMadeByType(e.target.value)}
                >
                  <option value="person">🧑 Person</option>
                  <option value="restaurant">🏪 Restaurant</option>
                </Sel>
              </div>
              <div>
                <FieldLabel>Order Type</FieldLabel>
                <Sel
                  value={orderType}
                  onChange={(e) => setOrderType(e.target.value)}
                >
                  <option value="dine-in">🍽 Dine-in</option>
                  <option value="delivery">📦 Delivery</option>
                </Sel>
              </div>
            </div>
          )}
        </>
      )}

      <Btn
        full
        onClick={handleSave}
        style={{
          background: mc.color,
          borderColor: mc.color,
          color: "#fff",
          marginTop: 2,
        }}
      >
        Save {meal}
      </Btn>
    </div>
  );
}
