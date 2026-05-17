export const today = () => new Date().toISOString().split("T")[0];

export const addDays = (s, n) => {
  const d = new Date(s);
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
};

export const daysAgo = (n) => addDays(today(), -n);

export const fmtShort = (s) => {
  const d = new Date(s);
  return `${d.getDate()} ${d.toLocaleString("default", { month: "short" })}`;
};

export const fmtWday = (s, short = true) =>
  new Date(s).toLocaleDateString("en-IN", {
    weekday: short ? "short" : "long",
  });

export const fmtLong = (s) =>
  new Date(s).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

export const MEAL_ORDER = { Breakfast: 1, Lunch: 2, Dinner: 3 };
