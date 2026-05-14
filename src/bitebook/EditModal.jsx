import { useState } from "react";
import {
  PREPARED_PERSON,
  PREPARED_RESTAURANT,
  SERVICE_DINE_IN,
  SERVICE_DELIVERY,
} from "./constants.js";
import { useApp } from "./context.jsx";
import {
  Btn,
  Divider,
  Field,
  Inp,
  MiniTogglePills,
  Modal,
  Sel,
} from "./uiPrimitives.jsx";

export function EditModal({ entry, idx, onSave, onDelete, onClose }) {
  const { suggestions } = useApp();
  const [date, setDate] = useState(entry.date);
  const [meal, setMeal] = useState(entry.meal);
  const [type, setType] = useState(entry.type);
  const [dish, setDish] = useState(entry.dish || "");
  const [person, setPerson] = useState(entry.preparedBy || "");
  const [preparedByKind, setPreparedByKind] = useState(entry.preparedByKind || PREPARED_PERSON);
  const [serviceType, setServiceType] = useState(entry.serviceType || SERVICE_DINE_IN);

  const buildPayload = () => ({
    date,
    meal,
    type,
    dish: type === "Skipped" ? "" : dish,
    preparedBy: type === "Skipped" ? "" : person,
    preparedByKind: type === "Skipped" ? PREPARED_PERSON : preparedByKind,
    serviceType: type === "Ordered" ? serviceType : SERVICE_DINE_IN,
  });

  return (
    <Modal title="Edit Entry" onClose={onClose}>
      <Field label="Date"><Inp type="date" value={date} onChange={e => setDate(e.target.value)} /></Field>
      <div className="bb-meal-fields">
        <Field label="Meal">
          <Sel value={meal} onChange={e => setMeal(e.target.value)}>
            <option>Breakfast</option>
            <option>Lunch</option>
            <option>Dinner</option>
          </Sel>
        </Field>
        <Field label="Type">
          <Sel value={type} onChange={e => setType(e.target.value)}>
            <option value="Home">🏠 Home</option>
            <option value="Ordered">🛵 Ordered</option>
            <option value="Skipped">⏭ Skipped</option>
          </Sel>
        </Field>
      </div>
      {type !== "Skipped" && (
        <>
          <Field label="Made by">
            <MiniTogglePills
              value={preparedByKind}
              onChange={setPreparedByKind}
              options={[
                { key: PREPARED_PERSON, label: "👤 Person" },
                { key: PREPARED_RESTAURANT, label: "🏪 Restaurant" },
              ]}
            />
          </Field>
          {type === "Ordered" && (
            <Field label="Order">
              <MiniTogglePills
                value={serviceType}
                onChange={setServiceType}
                options={[
                  { key: SERVICE_DINE_IN, label: "🍽 Dine-in" },
                  { key: SERVICE_DELIVERY, label: "🚚 Delivery" },
                ]}
              />
            </Field>
          )}
          <div className="bb-meal-fields">
            <Field label="Dish">
              <Inp list="bb-dishes" value={dish} onChange={e => setDish(e.target.value)} placeholder={suggestions.topDish} />
            </Field>
            <Field label="By">
              <Inp
                list="bb-prepared-by"
                value={person}
                onChange={e => setPerson(e.target.value)}
                placeholder={preparedByKind === PREPARED_RESTAURANT ? suggestions.topRestaurant : suggestions.topPerson}
              />
            </Field>
          </div>
        </>
      )}
      <Divider />
      <div className="bb-modal-actions">
        <Btn variant="primary" full onClick={() => onSave(idx, buildPayload())}>💾 Save</Btn>
        <Btn variant="danger" full onClick={() => onDelete(idx)}>🗑 Delete</Btn>
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
      </div>
    </Modal>
  );
}
