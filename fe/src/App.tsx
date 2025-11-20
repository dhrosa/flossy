import React from "react";
import "./App.scss";
import { FetchFlosses, Floss } from "./Floss";
import Picker from "./Picker";

function App() {
  const [flosses, setFlosses] = React.useState<Floss[]>([]);
  React.useEffect(() => {
    FetchFlosses().then(setFlosses);
  }, []);
  return (
    <section className="section">
      <div className="container">
        <h1 className="title">Flossy</h1>
        <Picker flosses={flosses} />
      </div>
    </section>
  );
}

export default App;
