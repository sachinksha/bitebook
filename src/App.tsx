
import { useState } from "react";
import "./styles/globals.css";
import * as XLSX from "xlsx";
import Chart from "chart.js/auto";
import { Analytics } from "@vercel/analytics/react";

window.XLSX = XLSX;
window.Chart = Chart;

import { useFoodData, useToast, useMealContext } from "./hooks";
import { AppContext, ToastContext, MealContext, useAuth } from "./context/contexts";
import { GlobalStyles, Datalists } from "./components/primitives";
import { Header } from "./components/layout";
import {
  LogView,
  HistoryView,
  InsightsView,
  DataView,
} from "./components/views";
import { Toast } from "./components/primitives";

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
  const [active, setActive] = useState<string>("log");

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h1>Welcome to BiteBook</h1>
        <p>Please log in with Google to access your meal data.</p>
        <button onClick={login} style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}>Login with Google</button>
        <div style={{ marginTop: 18, color: '#d33', maxWidth: 520, margin: '18px auto 0' }}>
          {authError ? (
            <>
              <strong>Authentication issue:</strong> {authError}
            </>
          ) : (
            <>
              If you are on iOS or Safari, make sure browser storage is enabled and you are not in Private mode.
            </>
          )}
        </div>
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
            <div
              key={active}
              style={{ animation: "fadeUp .25s ease both" }}
            >
              {views[active]}
            </div>
          </main>

          <Toast toast={toast} />
          <Analytics />
        </MealContext.Provider>
      </ToastContext.Provider>
    </AppContext.Provider>
  );
}
