import Picker from "./Picker";
import { Floss } from "./Floss";
import { ComponentProps, useState } from "react";
import { FlossButton } from "./FlossButton";

function Label({ ...rest }: ComponentProps<"label">) {
  return <label className="label" {...rest} />;
}

function Field({ ...rest }: ComponentProps<"div">) {
  return <div className="field" {...rest} />;
}

function Control({ ...rest }: ComponentProps<"div">) {
  return <div className="control" {...rest} />;
}

function flossDistance(a: Floss, b: Floss): number {
  return a.color.deltaE2000(b.color);
}

function sortedByDistance(target: Floss, choices: Floss[]): Floss[] {
  const compareDistance = (a: Floss, b: Floss) => {
    return flossDistance(target, a) - flossDistance(target, b);
  };
  return choices.toSorted(compareDistance);
}

export default function NearestColorsPage() {
  const choices = Floss.all();
  const [currentFloss, setCurrentFloss] = useState<Floss | null>(null);
  const [resultLimit, setResultLimit] = useState(4);
  const nearest = currentFloss
    ? sortedByDistance(currentFloss, choices).slice(1, resultLimit + 1)
    : [];
  return (
    <>
      <p className="title is-4">Nearest Color Finder</p>
      <div className="box">
        <Field>
          <Label>Target Floss</Label>
          <Control>
            <Picker
              flosses={choices}
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
