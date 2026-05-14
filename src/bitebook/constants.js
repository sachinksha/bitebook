export const PREPARED_PERSON = "person";
export const PREPARED_RESTAURANT = "restaurant";
export const SERVICE_DINE_IN = "dine-in";
export const SERVICE_DELIVERY = "delivery";

export const DRAG_TYPE = "application/x-bitebook-chip";
/** getData() is often empty during dragover; mirror payload for hit-testing. */
export const chipDragRef = { current: null };

export const MEAL_ORDER = { Breakfast: 1, Lunch: 2, Dinner: 3 };

export const KEY = "bitebook_v4";
export const READ_KEYS = ["bitebook_v4", "bitebook_v3", "bitebook_v2", "foodData"];

export const TABS = [
  { id: "log",      icon: "📝", label: "Log" },
  { id: "calendar", icon: "🗓",  label: "Calendar" },
  { id: "history",  icon: "📋", label: "History" },
  { id: "insights", icon: "📊", label: "Insights" },
  { id: "data",     icon: "📁", label: "Data" },
];
