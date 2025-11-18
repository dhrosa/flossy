import React from "react";
import logo from "./logo.svg";
import "./App.css";
import { FetchDmcColors, DmcColor } from "./Dmc";
import DmcList from "./DmcList";

function App() {
  const [colors, setColors] = React.useState<DmcColor[]>([]);
  React.useEffect(() => {
    FetchDmcColors().then(setColors);
  }, []);
  return <DmcList colors={colors} />;
}

export default App;
