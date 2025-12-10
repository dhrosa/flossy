import "./App.scss";

import { createRoot } from "react-dom/client";
import { StrictMode, useSyncExternalStore } from "react";
import HomePage from "./HomePage";
import { BrowserRouter, Outlet, Route, Routes } from "react-router";
import Navigation from "./Navigation";
import NearestColorsPage from "./NearestColorsPage";
import BlendPage from "./BlendPage";
import { CollectionsPage } from "./CollectionsPage";

function Layout() {
  return (
    <>
      <Navigation />
      <section className="section">
        <Outlet />
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
          <Route path="/collections" element={<CollectionsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
