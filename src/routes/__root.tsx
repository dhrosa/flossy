import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import Navigation from "../Navigation";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export const Route = createRootRoute({ component: Root });

const footerCat = `
  ʌ_ʌ
=(._.)=  <meow!>
 /   \\  )
(     ) (
 ㄴu u⅃ノ
`;

function Root() {
  return (
    <>
      <Navigation />
      <section className="section">
        <div className="container">
          <Outlet />
        </div>
      </section>
      <footer className="footer">
        <pre className="cat">{footerCat.slice(1)}</pre>
      </footer>
      <TanStackRouterDevtools />
      <ReactQueryDevtools />
    </>
  );
}
