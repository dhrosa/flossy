import Picker from "./Picker";
import { Floss, SingleFloss, Blend } from "./Floss";
import { ComponentProps, useMemo, useState } from "react";
import { FlossButton } from "./FlossButton";
import { Field, Label, Control } from "./Form";

function flossDistance(a: Floss, b: Floss): number {
  return a.color.deltaE2000(b.color);
}

function sortedByDistance(target: Floss, choices: Floss[]): Floss[] {
  const compareDistance = (a: Floss, b: Floss) => {
    return flossDistance(target, a) - flossDistance(target, b);
  };
  return choices.toSorted(compareDistance);
}

function allBlends(flosses: SingleFloss[]): Blend[] {
  const blends: Blend[] = [];
  for (let i = 0; i < flosses.length; i++) {
    for (let j = i + 1; j < flosses.length; j++) {
      blends.push(new Blend([flosses[i], flosses[j]]));
    }
  }
  return blends;
}

export default function NearestColorsPage() {
  const [currentFloss, setCurrentFloss] = useState<Floss | null>(null);
  const [resultLimit, setResultLimit] = useState(8);

  const singleFlosses = SingleFloss.all();
  const blends = allBlends(singleFlosses);
  const choices = (singleFlosses as Floss[]).concat(blends);

  console.time("distances");
  const nearest: Floss[] = currentFloss
    ? sortedByDistance(currentFloss, choices).slice(1, resultLimit + 1)
    : [];
  console.timeEnd("distances");
  return (
    <>
      <p className="title is-4">Nearest Color Finder</p>
      <div className="box">
        <Field>
          <Label>Target Floss</Label>
          <Control>
            <Picker
              flosses={singleFlosses}
              currentFloss={currentFloss}
              onPick={setCurrentFloss}
            />
          </Control>
        </Field>
        <Field>
          <Label>Number of Results</Label>
          <Control>
            <input
              className="input"
              type="number"
              min="2"
              max="100"
              value={resultLimit}
              onChange={(e) => {
                setResultLimit(Number(e.target.value));
              }}
            />
          </Control>
        </Field>
      </div>
      <p className="title is-6">Results</p>
      <div className="block grid">
        {currentFloss &&
          nearest.map((f) => (
            <FlossButton
              floss={f}
              key={f.name}
              title={`deltaE: ${flossDistance(currentFloss, f)}`}
            />
          ))}
      </div>
    </>
  );
}
