// Shared types between nearest neighbor UI and background worker.

export interface NeighborRequest {
  // Unique identifier for this request.
  id: number;

  targetFlossName: string;
  resultLimit: number;
}

// Closest flosses with up to the given thread count.
export interface NeighborSetRecord {
  maxThreadCount: number;
  neighbors: NeighborRecord[];
}

export interface NeighborRecord {
  // Flosses included in this blend.
  flossNames: string[];

  // Color distance from target.
  distance: number;
}

export interface NeighborResponse {
  // Matches id of corresponding request.
  id: number;
  neighborSets: NeighborSetRecord[];
}
