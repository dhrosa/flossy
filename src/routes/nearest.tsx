import Picker from "../Picker";
import { Floss, SingleFloss, Blend } from "../Floss";
import { useState } from "react";
import { FlossButton } from "../FlossButton";
import { Field, Label, Control, ErrorHelp } from "../Form";
import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
  NeighborRecord,
  NeighborRequest,
  NeighborResponse,
  NeighborSetRecord,
} from "../NeighborTypes";
import { useQuery } from "@tanstack/react-query";
import { Collection } from "../Collection";

export const Route = createFileRoute("/nearest")({
  component: NearestColorsPage,
});

// CPU-bound worker for finding neighbors.
const worker = new Worker(new URL("../NeighborWorker.ts", import.meta.url), {
  type: "module",
});

// Unique ID for each request.
let nextRequestId = 0;

// Maps request IDs to their respective response listeners.
const responseListeners = new Map<
  number,
  (response: NeighborResponse) => void
>();

// Demultiplex responses to their respective listeners.
worker.onmessage = (event: MessageEvent<NeighborResponse>) => {
  const response = event.data;
  const listener = responseListeners.get(response.id);
  if (!listener) {
    console.error("Received response for unknown ID:", response.id);
    return;
  }
  listener(response);
};

interface Neighbor {
  floss: Floss;
  distance: number;
}

interface NeighborSet {
  maxThreadCount: number;
  neighbors: Neighbor[];
}

function neighborFromRecord({
  flossNames,
  distance,
}: NeighborRecord): Neighbor {
  return {
    floss: new Blend(flossNames.map(SingleFloss.fromName)),
    distance,
  };
}

function neighborSetFromRecord({
  maxThreadCount,
  neighbors,
}: NeighborSetRecord): NeighborSet {
  return {
    maxThreadCount,
    neighbors: neighbors.map(neighborFromRecord),
  };
}

// Issue request to background worker to find neighbors.
async function findNeighbors(
  targetFloss: SingleFloss,
  collection: Collection | null,
  resultLimit: number,
): Promise<NeighborSet[]> {
  const allowedFlossNames = collection?.flosses.map((f) => f.name);
  const response: NeighborResponse = await new Promise((resolve) => {
    const request: NeighborRequest = {
      id: nextRequestId++,
      targetFlossName: targetFloss.name,
      allowedFlossNames,
      maxThreadCount: 2,
      resultLimit,
    };

    const listener = (response: NeighborResponse) => {
      responseListeners.delete(request.id);
      resolve(response);
    };
    responseListeners.set(request.id, listener);
    worker.postMessage(request);
  });
  return response.neighborSets.map(neighborSetFromRecord);
}

// Component for picking a user's floss collection.
function CollectionPicker({
  value,
  onChange,
}: {
  value: Collection | null;
  onChange: (value: Collection | null) => void;
}) {
  const {
    error,
    isPending,
    data: collections,
  } = useQuery({
    queryKey: ["collections"],
    queryFn: Collection.all,
  });
  if (error) {
    return <ErrorHelp>Error loading collections: {error.toString()}</ErrorHelp>;
  }

  return (
    <div className="buttons">
      <button
        className={`button ${value ? "" : "is-primary"} ${isPending ? "is-loading" : ""}`}
        onClick={() => onChange(null)}
      >
        All DMC flosses
      </button>
      {collections &&
        collections.map((c) => (
          <button
            key={c.name}
            className={`button ${value?.name === c.name ? "is-primary" : ""}`}
            onClick={() => onChange(c)}
          >
            {c.name}
          </button>
        ))}
    </div>
  );
}

// Renders a single Neighbor.
function NeighborComponent({ neighbor }: { neighbor: Neighbor }) {
  const { floss, distance } = neighbor;
  return (
    <FlossButton
      key={floss.name}
      floss={floss}
      title={`distance: ${distance}`}
    />
  );
}

// Renders a single NeighborSet.
function NeighborSetComponent({ neighborSet }: { neighborSet: NeighborSet }) {
  const { maxThreadCount, neighbors } = neighborSet;
  return (
    <div className="block">
      <p className="title is-6">
        {maxThreadCount == 1
          ? "Closest single flosses"
          : `Closest blends of up to ${maxThreadCount} flosses`}
      </p>
      <div className="grid">
        {neighbors.map((n) => (
          <NeighborComponent key={n.floss.name} neighbor={n} />
        ))}
      </div>
    </div>
  );
}

function NearestColorsPage() {
  const [targetFloss, setTargetFloss] = useState<SingleFloss>(
    SingleFloss.random(),
  );
  const [collection, setCollection] = useState<Collection | null>(null);
  const [resultLimit, setResultLimit] = useState(12);
  const {
    error,
    isPending,
    data: neighborSets,
  } = useQuery({
    queryKey: ["neighbors", targetFloss, collection?.name, resultLimit],
    queryFn: () => findNeighbors(targetFloss, collection, resultLimit),
  });

  return (
    <div className="container is-max-desktop">
      <p className="title is-4">Nearest Color Finder</p>
      <div className="box">
        <Field>
          <Label>Choose target floss</Label>
          <Control>
            <Picker
              flosses={SingleFloss.all()}
              currentFloss={targetFloss}
              onPick={setTargetFloss}
            />
          </Control>
        </Field>
        <Field>
          <Label>
            Limit results to the following{" "}
            <Link to="/collections">collections</Link>
          </Label>
          <Control>
            <CollectionPicker value={collection} onChange={setCollection} />
          </Control>
        </Field>
        <Field>
          <Label>Number of results</Label>
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
      <div>
        {error && <ErrorHelp>Error: {error.toString()}</ErrorHelp>}
        {isPending && <progress className="progress" />}
        {neighborSets &&
          neighborSets.map((set) => (
            <NeighborSetComponent key={set.maxThreadCount} neighborSet={set} />
          ))}
      </div>
    </div>
  );
}
