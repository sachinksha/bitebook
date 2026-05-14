
import { useState } from "react";
import "./styles/globals.css";
import * as XLSX from "xlsx";
import Chart from "chart.js/auto";

window.XLSX = XLSX;
window.Chart = Chart;

import { useFoodData, useToast, useMealContext } from "./hooks/index.js";
import { AppContext, ToastContext, MealContext } from "./context/contexts.js";
import { GlobalStyles, Datalists } from "./components/primitives/index.js";
import { Header } from "./components/layout/index.js";
import {
  LogView,
  CalendarView,
  HistoryView,
  InsightsView,
  DataView,
} from "./components/views/index.js";
import { Toast } from "./components/primitives/index.js";

const views = {
  log: <LogView />,
  calendar: <CalendarView />,
  history: <HistoryView />,
  insights: <InsightsView />,
  data: <DataView />,
};

export default function BiteBook() {
  const foodData = useFoodData();
  const { toast, show } = useToast();
  const mealContext = useMealContext();
  const [active, setActive] = useState("log");

  return (
    <AppContext.Provider value={foodData}>
      <ToastContext.Provider value={{ show }}>
        <MealContext.Provider value={mealContext}>
          <GlobalStyles />
          <Datalists
            dishes={foodData.suggestions.dishes}
            persons={foodData.suggestions.persons}
          />

          <Header
            streak={foodData.streak}
            total={foodData.data.length}
            active={active}
            onSwitch={setActive}
          />

          <main style={{ maxWidth: 960, margin: "0 auto", padding: "20px 16px 48px" }}>
            <div
              key={active}
              style={{ animation: "fadeUp .25s ease both" }}
            >
              {views[active]}
            </div>
          </main>

          <Toast toast={toast} />
        </MealContext.Provider>
      </ToastContext.Provider>
    </AppContext.Provider>
  );
}
