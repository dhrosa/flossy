import React from "react";
import "./App.scss";
import { FetchFlosses, Floss } from "./Floss";
import FlossList from "./FlossList";

function App() {
  const [colors, setColors] = React.useState<Floss[]>([]);
  React.useEffect(() => {
    FetchFlosses().then(setColors);
  }, []);
  return <FlossList colors={colors} />;
}

export default App;
