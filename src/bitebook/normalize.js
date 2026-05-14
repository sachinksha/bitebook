import {
  PREPARED_PERSON,
  PREPARED_RESTAURANT,
  SERVICE_DINE_IN,
  SERVICE_DELIVERY,
} from "./constants.js";

export function normalizeEntry(raw) {
  if (!raw || typeof raw !== "object") return null;
  const type = ["Home", "Ordered", "Skipped"].includes(raw.type) ? raw.type : "Home";
  const preparedByKind = raw.preparedByKind === PREPARED_RESTAURANT ? PREPARED_RESTAURANT : PREPARED_PERSON;
  const serviceType = raw.serviceType === SERVICE_DELIVERY ? SERVICE_DELIVERY : SERVICE_DINE_IN;
  return {
    date: String(raw.date || "").trim(),
    meal: String(raw.meal || "").trim(),
    type,
    dish: String(raw.dish || "").trim(),
    preparedBy: String(raw.preparedBy || "").trim(),
    preparedByKind,
    serviceType,
  };
}
