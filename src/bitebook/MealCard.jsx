import { useState } from "react";
import {
  chipDragRef,
  PREPARED_PERSON,
  PREPARED_RESTAURANT,
  SERVICE_DINE_IN,
  SERVICE_DELIVERY,
} from "./constants.js";
import { useApp } from "./context.jsx";
import { readChipPayload } from "./dragPayload.js";
import { T } from "./theme.js";
import {
  Btn,
  FieldLabel,
  Inp,
  MiniTogglePills,
  TypePills,
} from "./uiPrimitives.jsx";

export function MealCard({ meal, existing, onSave, logDropScope }) {
  const mc = T.meal[meal];
  const icon = { Breakfast: "🌅", Lunch: "☀️", Dinner: "🌙" }[meal];
  const { suggestions } = useApp();

  const [type, setType] = useState(existing?.type || "Home");
  const [dish, setDish] = useState(existing?.dish || "");
  const [person, setPerson] = useState(existing?.preparedBy || "");
  const [preparedByKind, setPreparedByKind] = useState(existing?.preparedByKind || PREPARED_PERSON);
  const [serviceType, setServiceType] = useState(existing?.serviceType || SERVICE_DINE_IN);
  const [saved, setSaved] = useState(false);
  const [overDish, setOverDish] = useState(false);
  const [overBy, setOverBy] = useState(false);

  const allowDropHere = logDropScope === "any" || logDropScope === meal;

  const payloadValid = (p, field) => {
    if (!p) return false;
    if (field === "dish") return p.kind === "dish";
    if (field === "by") return p.kind === "person" || p.kind === "restaurant";
    return false;
  };

  const onDragOverZone = (e, field) => {
    if (!allowDropHere) return;
    const p = readChipPayload(e.dataTransfer);
    if (!payloadValid(p, field)) {
      e.dataTransfer.dropEffect = "none";
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";
    if (field === "dish") setOverDish(true);
    else setOverBy(true);
  };

  const onDragLeaveZone = (e, field) => {
    if (e.currentTarget.contains(e.relatedTarget)) return;
    if (field === "dish") setOverDish(false);
    else setOverBy(false);
  };

  const onDropZone = (e, field) => {
    setOverDish(false);
    setOverBy(false);
    if (!allowDropHere) return;
    e.preventDefault();
    e.stopPropagation();
    const p = readChipPayload(e.dataTransfer);
    chipDragRef.current = null;
    if (!payloadValid(p, field)) return;
    if (field === "dish") {
      setDish(String(p.value || ""));
      return;
    }
    setPerson(String(p.value || ""));
    setPreparedByKind(p.kind === "restaurant" ? PREPARED_RESTAURANT : PREPARED_PERSON);
  };

  const focused = logDropScope !== "any" && logDropScope === meal;
  const muted = logDropScope !== "any" && logDropScope !== meal;

  const handleSave = () => {
    onSave({
      meal,
      type,
      dish: type === "Skipped" ? "" : dish,
      preparedBy: type === "Skipped" ? "" : person,
      preparedByKind: type === "Skipped" ? PREPARED_PERSON : preparedByKind,
      serviceType: type === "Ordered" ? serviceType : SERVICE_DINE_IN,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  const cardClass = [
    "bb-meal-card",
    saved && "bb-meal-card--saved",
    focused && "bb-meal-card--context",
    muted && "bb-meal-card--context-muted",
  ].filter(Boolean).join(" ");

  return (
    <div
      className={cardClass}
      style={{ ["--bb-meal"]: mc.color, ["--bb-meal-bar"]: mc.bar }}
    >
      <div className="bb-meal-accent" />
      <div className="bb-meal-head">
        <span className="bb-meal-emoji">{icon}</span>
        <span className="bb-meal-name">{meal}</span>
        {saved ? (
          <span className="bb-meal-saved">✓ Saved</span>
        ) : existing ? (
          <span className="bb-meal-logged">Logged</span>
        ) : null}
      </div>

      <TypePills value={type} onChange={setType} />

      {type !== "Skipped" && (
        <>
          <div>
            <FieldLabel>Made by</FieldLabel>
            <MiniTogglePills
              value={preparedByKind}
              onChange={setPreparedByKind}
              options={[
                { key: PREPARED_PERSON, label: "👤 Person" },
                { key: PREPARED_RESTAURANT, label: "🏪 Restaurant" },
              ]}
            />
          </div>
          {type === "Ordered" && (
            <div>
              <FieldLabel>Order</FieldLabel>
              <MiniTogglePills
                value={serviceType}
                onChange={setServiceType}
                options={[
                  { key: SERVICE_DINE_IN, label: "🍽 Dine-in" },
                  { key: SERVICE_DELIVERY, label: "🚚 Delivery" },
                ]}
              />
            </div>
          )}
          <div className="bb-meal-fields">
            <div
              className={`bb-drop-field ${overDish ? "bb-drop-field--over" : ""}`.trim()}
              onDragOver={e => onDragOverZone(e, "dish")}
              onDragLeave={e => onDragLeaveZone(e, "dish")}
              onDrop={e => onDropZone(e, "dish")}
            >
              <FieldLabel>Dish</FieldLabel>
              <Inp
                list="bb-dishes"
                placeholder={suggestions.topDish || "e.g. Poha"}
                value={dish}
                onChange={e => setDish(e.target.value)}
                onDragOver={e => onDragOverZone(e, "dish")}
                onDragLeave={e => onDragLeaveZone(e, "dish")}
                onDrop={e => onDropZone(e, "dish")}
              />
            </div>
            <div
              className={`bb-drop-field ${overBy ? "bb-drop-field--over" : ""}`.trim()}
              onDragOver={e => onDragOverZone(e, "by")}
              onDragLeave={e => onDragLeaveZone(e, "by")}
              onDrop={e => onDropZone(e, "by")}
            >
              <FieldLabel>By</FieldLabel>
              <Inp
                list="bb-prepared-by"
                placeholder={
                  preparedByKind === PREPARED_RESTAURANT
                    ? suggestions.topRestaurant || "Restaurant"
                    : suggestions.topPerson || "Name"
                }
                value={person}
                onChange={e => setPerson(e.target.value)}
                onDragOver={e => onDragOverZone(e, "by")}
                onDragLeave={e => onDragLeaveZone(e, "by")}
                onDrop={e => onDropZone(e, "by")}
              />
            </div>
          </div>
        </>
      )}

      <Btn full className="bb-btn-meal-save" onClick={handleSave}>
        Save {meal}
      </Btn>
    </div>
  );
}
