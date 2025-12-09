import { PreloadProgress } from "./PreloadProgress";

// Type-safe wrapper around postMessage.
function emit(progress: PreloadProgress) {
  postMessage(progress);
}

function sleep(seconds: number) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

async function preload() {
  const denominator = 10;
  for (let i = 0; i < denominator; i++) {
    emit({ type: "preloading", numerator: i, denominator: denominator });
    await sleep(0.01);
  }
  emit({ type: "complete" });
}

preload();
