import { useState } from "react";
import { Floss } from "./Floss";
import Picker from "./Picker";

export default function HomePage() {
  const [currentFloss, setCurrentFloss] = useState<Floss | null>(null);
  return (
    <>
      <Picker
        flosses={Floss.all()}
        currentFloss={currentFloss}
        onPick={setCurrentFloss}
      />
    </>
  );
}
