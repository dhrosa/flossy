import "./App.scss";

import { createRoot } from "react-dom/client";
import { StrictMode, useSyncExternalStore } from "react";
import HomePage from "./HomePage";
import { BrowserRouter, Outlet, Route, Routes } from "react-router";
import Navigation from "./Navigation";
import NearestColorsPage from "./NearestColorsPage";
import BlendPage from "./BlendPage";
import { CollectionsPage } from "./CollectionsPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

function Layout() {
  return (
    <>
      <Navigation />
      <section className="section">
        <div className="container">
          <Outlet />
        </div>
      </section>
    </>
  );
}

const container = document.getElementById("app")!;
const root = createRoot(container);
const queryClient = new QueryClient();
root.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  </StrictMode>,
);
