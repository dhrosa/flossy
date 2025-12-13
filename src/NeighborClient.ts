const worker = new Worker(new URL("./NeighborWorker.ts", import.meta.url), {
  type: "module",
});
