// @ts-nocheck
import { useState } from "react";
import "./styles/globals.css";
import * as XLSX from "xlsx";
import Chart from "chart.js/auto";

window.XLSX = XLSX;
window.Chart = Chart;

import { useFoodData, useToast, useMealContext } from "./hooks/index.js";
import { AppContext, ToastContext, MealContext, useAuth } from "./context/contexts.js";
import { GlobalStyles, Datalists } from "./components/primitives/index.js";
import { Header } from "./components/layout/index.js";
import {
  LogView,
  HistoryView,
  InsightsView,
  DataView,
} from "./components/views/index.js";
import { Toast } from "./components/primitives/index.js";

const views = {
  log: <LogView />,
  history: <HistoryView />,
  insights: <InsightsView />,
  data: <DataView />,
};

export default function BiteBook() {
  const { user, loading, login, authError } = useAuth();
  const foodData = useFoodData();
  const { toast, show } = useToast();
  const mealContext = useMealContext();
  const [active, setActive] = useState("log");

  if (loading) {
    return <div style={{ padding: 32, textAlign: "center" }}>Loading…</div>;
  }

  if (!user) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <h1>Welcome to BiteBook</h1>
        <p>Please log in with Google to access your meal data.</p>
        <button
          onClick={login}
          style={{ padding: "10px 20px", fontSize: "16px", cursor: "pointer" }}
        >
          Login with Google
        </button>
        {authError && (
          <div style={{ marginTop: 18, color: "#d33", maxWidth: 520, margin: "18px auto 0" }}>
            <strong>Authentication issue:</strong> {authError}
          </div>
        )}
      </div>
    );
  }

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

          <main style={{ maxWidth: 960, margin: "0 auto", padding: "12px 8px 48px" }}>
            <div key={active} className="bb-view-animate">
              {views[active]}
            </div>
          </main>

          <Toast toast={toast} />
        </MealContext.Provider>
      </ToastContext.Provider>
    </AppContext.Provider>
  );
}
