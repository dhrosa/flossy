// Background worker for finding nearest color neighbors.

import { Blend, Floss, SingleFloss } from "./Floss";
import {
  NeighborRequest,
  NeighborRecord,
  NeighborResponse,
  NeighborSetRecord,
} from "./NeighborTypes";
import { BaseN } from "js-combinatorics";

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
): NeighborRecord[] {
  const neighbors: NeighborRecord[] = [];
  for (const candidate of allCandidates(allowedFlosses, maxThreadCount)) {
    neighbors.push({
      flossNames: candidate.flosses.map((f) => f.name),
      distance: candidate.color.deltaE2000(target.color),
    });
  }
  return neighbors.toSorted((a, b) => a.distance - b.distance);
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
  console.time("neighbor calculation");
  postMessage(handleRequest(event.data));
  console.timeEnd("neighbor calculation");
};
