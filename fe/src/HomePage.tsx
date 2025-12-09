import { useState } from "react";
import { SingleFloss, Floss } from "./Floss";
import Picker from "./Picker";

export default function HomePage() {
  const [currentFloss, setCurrentFloss] = useState<Floss | null>(null);
  return (
    <>
      <Picker
        flosses={SingleFloss.all()}
        currentFloss={currentFloss}
        onPick={setCurrentFloss}
      />
    </>
  );
}
