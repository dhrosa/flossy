// Shared types between nearest neighbor UI and background worker.

export interface NeighborRequest {
  // Unique identifier for this request.
  id: number;

  targetFlossName: string;
  resultLimit: number;
}

export interface NeighborRecord {
  flossNames: string[];
  distance: number;
}

export interface NeighborResponse {
  // Matches id of corresponding request.
  id: number;
  neighbors: NeighborRecord[];
}
