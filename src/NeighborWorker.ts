// Background worker for finding nearest color neighbors.

import { Blend, Floss, SingleFloss } from "./Floss";
import {
  NeighborRequest,
  NeighborRecord,
  NeighborResponse,
  NeighborSetRecord,
} from "./NeighborTypes";

// Type-safe postMessage().
function respond(response: NeighborResponse) {
  postMessage(response);
}

// Neighbor of target floss.
interface Neighbor {
  floss: Floss;
  distance: number;
}

// Serialize Neighbor.
function toRecord({ floss, distance }: Neighbor): NeighborRecord {
  if (floss instanceof SingleFloss) {
    return { flossNames: [floss.name], distance };
  }
  return { flossNames: floss.flosses.map((f) => f.name), distance };
}

// Find sorted list of neighbors.
function findNeighbors(
  target: SingleFloss,
  allowedFlosses: SingleFloss[],
): Neighbor[] {
  const candidates: Floss[] = [];
  const singles = allowedFlosses;
  for (let i = 0; i < singles.length; i++) {
    const a = singles[i];
    if (a.name == target.name) {
      continue;
    }
    candidates.push(a);

    for (let j = i + 1; j < singles.length; j++) {
      const b = singles[j];
      if (b.name != target.name) {
        candidates.push(new Blend([a, b]));
      }
    }
  }

  return candidates
    .map((floss) => ({ floss, distance: floss.color.deltaE2000(target.color) }))
    .toSorted((a, b) => a.distance - b.distance);
}

onmessage = (event: MessageEvent<NeighborRequest>) => {
  const { id, targetFlossName, allowedFlossNames, resultLimit } = event.data;
  console.log(`Finding neighbors for ${targetFlossName} (ID ${id})`);

  const target = SingleFloss.fromName(targetFlossName);
  const allowedFlosses =
    allowedFlossNames?.map(SingleFloss.fromName) ?? SingleFloss.all();
  const neighbors = findNeighbors(target, allowedFlosses);

  const makeNeighborSet = (maxThreadCount: number): NeighborSetRecord => {
    return {
      maxThreadCount,
      neighbors: neighbors
        .map(toRecord)
        .filter((n) => n.flossNames.length <= maxThreadCount)
        .slice(0, resultLimit),
    };
  };

  respond({
    id,
    neighborSets: [makeNeighborSet(2), makeNeighborSet(1)],
  });
};
