import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import Navigation from "../Navigation";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export const Route = createRootRoute({ component: Root });

function Root() {
  return (
    <>
      <Navigation />
      <section className="section">
        <div className="container">
          <Outlet />
        </div>
      </section>
      <TanStackRouterDevtools />
      <ReactQueryDevtools />
    </>
  );
}
