// Background worker for finding nearest color neighbors.

import { Blend, Floss, SingleFloss } from "./Floss";
import {
  NeighborRequest,
  NeighborRecord,
  NeighborResponse,
  NeighborSetRecord,
} from "./NeighborTypes";
import { BaseN } from "js-combinatorics";

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

// All combinations of 1...N flosses.
function* allCandidates(allowedFlosses: SingleFloss[], maxThreadCount: number) {
  for (let threadCount = 1; threadCount <= maxThreadCount; threadCount++) {
    for (const combination of new BaseN(allowedFlosses, threadCount)) {
      yield new Blend(combination);
    }
  }
}

// Find sorted list of neighbors.
function findNeighbors(
  target: SingleFloss,
  allowedFlosses: SingleFloss[],
  maxThreadCount: number,
): Neighbor[] {
  const candidates = [...allCandidates(allowedFlosses, maxThreadCount)];
  return candidates
    .map((floss) => ({ floss, distance: floss.color.deltaE2000(target.color) }))
    .toSorted((a, b) => a.distance - b.distance);
}

function handleRequest({
  id,
  targetFlossName,
  allowedFlossNames,
  maxThreadCount,
  resultLimit,
}: NeighborRequest): NeighborResponse {
  console.log(`Finding neighbors for ${targetFlossName} (ID ${id})`);

  const target = SingleFloss.fromName(targetFlossName);
  const allowedFlosses = (
    allowedFlossNames?.map(SingleFloss.fromName) ?? SingleFloss.all()
  ).filter((f) => f.name != target.name);
  const neighbors = findNeighbors(target, allowedFlosses, maxThreadCount);

  const neighborSets: NeighborSetRecord[] = [];
  for (let count = maxThreadCount; count >= 1; count--) {
    neighborSets.push({
      maxThreadCount: count,
      neighbors: neighbors
        .map(toRecord)
        .filter((n) => n.flossNames.length == count)
        .slice(0, resultLimit),
    });
  }
  return {
    id,
    neighborSets,
  };
}

onmessage = (event: MessageEvent<NeighborRequest>) => {
  postMessage(handleRequest(event.data));
};
