export interface PreloadStarting {
  type: "starting";
}

export interface Preloading {
  type: "preloading";
  numerator: number;
  denominator: number;
}

export interface PreloadComplete {
  type: "complete";
}

export type PreloadProgress = PreloadStarting | Preloading | PreloadComplete;
