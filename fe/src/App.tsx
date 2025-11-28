import "./App.scss";

import { useState, useEffect } from "react";
import { FetchFlosses, Floss } from "./Floss";
import Picker from "./Picker";

export function App() {
  const [flosses, setFlosses] = useState<Floss[]>([]);
  useEffect(() => {
    FetchFlosses().then(setFlosses);
  }, []);
  const [currentFloss, setCurrentFloss] = useState<Floss | null>(null);
  return (
    <section className="section">
      <div className="container">
        <h1 className="title">Flossy</h1>
        <Picker
          flosses={flosses}
          currentFloss={currentFloss}
          onPick={setCurrentFloss}
        />
      </div>
    </section>
  );
}
