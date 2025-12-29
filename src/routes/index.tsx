import { createFileRoute, Link } from "@tanstack/react-router";
import { PageTitle } from "../PageTitle";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="home-page">
      <PageTitle>Home</PageTitle>
      <p>
        Flossy is a tool for tracking and organization your floss{" "}
        <Link to={"/collections"}>collections</Link>.
        <br />
        <br />
        If you need a specific floss color, but don't have it laying around, or
        can't find it in a store, you can use the you{" "}
        <Link to="/nearest">Find Nearest Color</Link> page to find other similar
        colors.
      </p>
    </div>
  );
}
