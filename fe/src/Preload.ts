let completed = false;
let listeners: (() => void)[] = [];
const worker = new Worker(new URL("PreloadWorker.ts", import.meta.url));
worker.onmessage = (event) => {
  console.log("Message from worker: ", event);
  completed = true;
  for (const listener of listeners) {
    listener();
  }
};

export function preloadSubscribe(callback: () => void): () => void {
  if (completed) {
    callback();
    return () => {};
  }
  listeners.push(callback);
  return () => {
    listeners = listeners.filter((l) => l !== callback);
  };
}

export function preloadSnapshot(): boolean {
  return completed;
}
