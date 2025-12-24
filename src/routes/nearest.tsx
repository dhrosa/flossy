import Picker from "../Picker";
import { Floss, SingleFloss, Blend } from "../Floss";
import { useReducer, useState } from "react";
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
import { PageTitle } from "../PageTitle";

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

// All user-controlled options bundled together to allow for validation.
interface State {
  targetFloss: SingleFloss;
  // Collection to restrict search space to.
  collection: Collection | null;
  // Maximum number of threads in each candidate blend.
  maxThreadCount: number;
  // Number of results per neighbor set.
  resultLimit: number;
  // Message indicating why a state update could not be applied.
  validationError: string | null;
}

function stateReducer(
  oldState: State,
  updates: Omit<Partial<State>, "validationError">,
): State {
  const newState = { ...oldState, ...updates };
  const flossCount =
    newState.collection?.flosses.length ?? SingleFloss.all.length;
  const candidateCount = flossCount ** newState.maxThreadCount;
  const maxCandidateCount = 2e6;
  if (candidateCount > maxCandidateCount) {
    return {
      ...oldState,
      validationError: `${candidateCount.toLocaleString()} combinations to search through \
      is greater than limit of ${maxCandidateCount.toLocaleString()}. \
      Either choose a smaller collection or reduce the thread count.`,
    };
  }
  return { ...newState, validationError: null };
}

// Issue request to background worker to find neighbors.
async function findNeighbors({
  targetFloss,
  collection,
  maxThreadCount,
  resultLimit,
}: State): Promise<NeighborSet[]> {
  const allowedFlossNames = collection?.flosses.map((f) => f.name);
  const response: NeighborResponse = await new Promise((resolve) => {
    const request: NeighborRequest = {
      id: nextRequestId++,
      targetFlossName: targetFloss.name,
      allowedFlossNames,
      maxThreadCount,
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
        All DMC flosses ({SingleFloss.all.length} flosses)
      </button>
      {collections &&
        collections.map((c) => (
          <button
            key={c.name}
            className={`button ${value?.name === c.name ? "is-primary" : ""}`}
            onClick={() => onChange(c)}
          >
            {c.name} ({c.flosses.length} flosses)
          </button>
        ))}
    </div>
  );
}

function MaxThreadCountPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  const options = [1, 2, 3, 4];
  return (
    <div className="buttons">
      {options.map((n) => (
        <button
          key={n}
          className={`button ${value === n ? "is-primary" : ""}`}
          onClick={() => onChange(n)}
        >
          {n}
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
    <div className="block box">
      <p className="title is-6">
        {maxThreadCount == 1
          ? "Closest single flosses"
          : `Closest ${maxThreadCount}-color floss blends`}
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
  const [state, updateState] = useReducer(stateReducer, {
    targetFloss: SingleFloss.random(),
    collection: null,
    maxThreadCount: 2,
    resultLimit: 12,
    validationError: null,
  });

  const {
    targetFloss,
    collection,
    maxThreadCount,
    resultLimit,
    validationError,
  } = state;

  const {
    error,
    isPending,
    data: neighborSets,
  } = useQuery({
    queryKey: [
      "neighbors",
      targetFloss,
      collection?.name,
      maxThreadCount,
      resultLimit,
    ],
    queryFn: () => findNeighbors(state),
  });

  return (
    <div className="container is-max-desktop">
      <PageTitle>Find Nearest Colors</PageTitle>
      <div className="box">
        <Field>
          <Label>Choose target floss</Label>
          <Control>
            <Picker
              flosses={SingleFloss.all}
              currentFloss={targetFloss}
              onPick={(targetFloss) => updateState({ targetFloss })}
            />
          </Control>
        </Field>
        <Field>
          <Label>
            Limit results to the following{" "}
            <Link to="/collections">collections</Link>
          </Label>
          <Control>
            <CollectionPicker
              value={collection}
              onChange={(collection) => updateState({ collection })}
            />
          </Control>
        </Field>
        <Field>
          <Label>Number of flosses to blend</Label>
          <Control>
            <MaxThreadCountPicker
              value={maxThreadCount}
              onChange={(maxThreadCount) => updateState({ maxThreadCount })}
            />
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
              onChange={(e) =>
                updateState({ resultLimit: Number(e.target.value) })
              }
            />
          </Control>
        </Field>
        {validationError && <ErrorHelp>{validationError}</ErrorHelp>}
      </div>
      <div>
        {error && <ErrorHelp>Error: {error.toString()}</ErrorHelp>}
        {isPending && <progress className="progress" />}
        {!validationError &&
          neighborSets &&
          neighborSets.map((set) => (
            <NeighborSetComponent key={set.maxThreadCount} neighborSet={set} />
          ))}
      </div>
    </div>
  );
}
