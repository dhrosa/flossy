setTimeout(() => {
  console.log("Preload complete");
  postMessage(null);
}, 2000);
