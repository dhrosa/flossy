import "./App.scss";

import { createRoot } from "react-dom/client";
import { StrictMode, useSyncExternalStore } from "react";
import HomePage from "./HomePage";
import { BrowserRouter, Outlet, Route, Routes } from "react-router";
import Navigation from "./Navigation";
import NearestColorsPage from "./NearestColorsPage";
import BlendPage from "./BlendPage";
import { preloadSubscribe, preloadSnapshot } from "./Preload";

function LoadingScreen() {
  return (
    <>
      <p>Loading...</p>
      <progress className="progress" />
    </>
  );
}

function Layout() {
  const preloadCompleted = useSyncExternalStore(
    preloadSubscribe,
    preloadSnapshot,
  );
  return (
    <>
      <Navigation />
      <section className="section">
        {preloadCompleted ? <Outlet /> : <LoadingScreen />}
      </section>
    </>
  );
}

let container = document.getElementById("app")!;
let root = createRoot(container);
root.render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="/nearest" element={<NearestColorsPage />} />
          <Route path="/blend" element={<BlendPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
