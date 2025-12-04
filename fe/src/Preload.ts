import { PreloadProgress } from "./PreloadProgress";

let progress: PreloadProgress = { type: "starting" };
let listeners: (() => void)[] = [];
const worker = new Worker(new URL("PreloadWorker.ts", import.meta.url), {
  type: "module",
});
worker.onmessage = (event) => {
  console.log("Message from worker: ", event);
  progress = event.data;
  for (const listener of listeners) {
    listener();
  }
};

export function preloadSubscribe(callback: () => void): () => void {
  if (progress.type === "complete") {
    callback();
    return () => {};
  }
  listeners.push(callback);
  return () => {
    listeners = listeners.filter((l) => l !== callback);
  };
}

export function preloadSnapshot(): PreloadProgress {
  return progress;
}
