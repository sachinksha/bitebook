import { useState } from "react";
import { useApp } from "../../context/contexts.js";
import {
  Modal,
  Field,
  Inp,
  Sel,
  Divider,
  Btn,
  FieldLabel,
} from "../primitives/index.js";
import "./EditModal.css";

export function EditModal({ entry, idx, onSave, onDelete, onClose }) {
  const { suggestions } = useApp();
  const [date, setDate] = useState(entry.date);
  const [meal, setMeal] = useState(entry.meal);
  const [type, setType] = useState(entry.type);
  const [dish, setDish] = useState(entry.dish || "");
  const [person, setPerson] = useState(entry.preparedBy || "");
  const [madeByType, setMadeByType] = useState(entry.madeByType || "person");
  const [orderType, setOrderType] = useState(entry.orderType || "dine-in");

  return (
    <Modal title="Edit Entry" onClose={onClose}>
      <Field label="Date">
        <Inp
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Field label="Meal">
          <Sel value={meal} onChange={(e) => setMeal(e.target.value)}>
            <option>Breakfast</option>
            <option>Lunch</option>
            <option>Dinner</option>
          </Sel>
        </Field>
        <Field label="Type">
          <Sel value={type} onChange={(e) => setType(e.target.value)}>
            <option value="Home">🏠 Home</option>
            <option value="Ordered">🛵 Ordered</option>
            <option value="Skipped">⏭ Skipped</option>
          </Sel>
        </Field>
      </div>
      {type !== "Skipped" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Field label="Dish">
              <Inp
                list="bb-dishes"
                value={dish}
                onChange={(e) => setDish(e.target.value)}
                placeholder={suggestions.topDish}
              />
            </Field>
            <Field label="By">
              <Inp
                list="bb-persons"
                value={person}
                onChange={(e) => setPerson(e.target.value)}
                placeholder={suggestions.topPerson}
              />
            </Field>
          </div>
          {type === "Ordered" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Field label="Made by">
                <Sel
                  value={madeByType}
                  onChange={(e) => setMadeByType(e.target.value)}
                >
                  <option value="person">🧑 Person</option>
                  <option value="restaurant">🏪 Restaurant</option>
                </Sel>
              </Field>
              <Field label="Order Type">
                <Sel
                  value={orderType}
                  onChange={(e) => setOrderType(e.target.value)}
                >
                  <option value="dine-in">🍽 Dine-in</option>
                  <option value="delivery">📦 Delivery</option>
                </Sel>
              </Field>
            </div>
          )}
        </>
      )}
      <Divider />
      <div style={{ display: "flex", gap: 8 }}>
        <Btn
          variant="primary"
          full
          onClick={() =>
            onSave(idx, {
              date,
              meal,
              type,
              dish: type === "Skipped" ? "" : dish,
              preparedBy: type === "Skipped" ? "" : person,
              madeByType: type === "Ordered" ? madeByType : "person",
              orderType: type === "Ordered" ? orderType : "dine-in",
            })
          }
        >
          💾 Save
        </Btn>
        <Btn variant="danger" full onClick={() => onDelete(idx)}>
          🗑 Delete
        </Btn>
        <Btn variant="ghost" onClick={onClose}>
          Cancel
        </Btn>
      </div>
    </Modal>
  );
}
