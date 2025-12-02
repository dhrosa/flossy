import { useState, useEffect } from "react";
import { FetchFlosses, Floss } from "./Floss";
import Picker from "./Picker";

export default function HomePage() {
  const [flosses, setFlosses] = useState<Floss[]>([]);
  useEffect(() => {
    FetchFlosses().then(setFlosses);
  }, []);
  const [currentFloss, setCurrentFloss] = useState<Floss | null>(null);
  return (
    <>
      <Picker
        flosses={flosses}
        currentFloss={currentFloss}
        onPick={setCurrentFloss}
      />
    </>
  );
}
