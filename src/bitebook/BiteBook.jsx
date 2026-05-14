import { useState } from "react";
import { AppCtx, ToastCtx } from "./context.jsx";
import { Datalists, Toast } from "./uiPrimitives.jsx";
import { useFoodData, useToast } from "./hooks.js";
import { Header } from "./Header.jsx";
import { LogView } from "./views/LogView.jsx";
import { CalendarView } from "./views/CalendarView.jsx";
import { HistoryView } from "./views/HistoryView.jsx";
import { InsightsView } from "./views/InsightsView.jsx";
import { DataView } from "./views/DataView.jsx";

export default function BiteBook() {
  const foodData = useFoodData();
  const { toast, show } = useToast();
  const [active, setActive] = useState("log");

  const views = {
    log:      <LogView />,
    calendar: <CalendarView />,
    history:  <HistoryView />,
    insights: <InsightsView />,
    data:     <DataView />,
  };

  return (
    <AppCtx.Provider value={foodData}>
      <ToastCtx.Provider value={{ show }}>
        <Datalists
          dishes={foodData.suggestions.dishes}
          persons={foodData.suggestions.persons}
          restaurants={foodData.suggestions.restaurants}
        />

        <Header streak={foodData.streak} total={foodData.data.length} active={active} onSwitch={setActive} />

        <main className="bb-main">
          <div key={active} className="bb-view-animate">
            {views[active]}
          </div>
        </main>

        <Toast toast={toast} />
      </ToastCtx.Provider>
    </AppCtx.Provider>
  );
}
