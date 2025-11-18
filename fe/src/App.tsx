import React from "react";
import "./App.css";
import { FetchFlosses, Floss } from "./Floss";
import DmcList from "./FlossList";

function App() {
  const [colors, setColors] = React.useState<Floss[]>([]);
  React.useEffect(() => {
    FetchFlosses().then(setColors);
  }, []);
  return <DmcList colors={colors} />;
}

export default App;
