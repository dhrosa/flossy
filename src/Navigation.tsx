import { ComponentProps, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Symbol } from "./Symbol";

function Item({
  className,
  to,
  ...rest
}: { className?: string; to: string } & ComponentProps<"a">) {
  return (
    <Link to={to} className={"navbar-item" + (className || "")} {...rest} />
  );
}

// Persistent light/dark mode toggle.
function ThemeToggle() {
  // Read theme from LocalStorage, defaulting to system preference if not found.
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") ??
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"),
  );

  // Update data-theme on top-level element and update LocalStorage.
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <a
      className="navbar-item"
      href="#"
      onClick={() => setTheme(theme == "dark" ? "light" : "dark")}
      title="Toggle light/dark mode."
    >
      <span className="icon">
        <Symbol name={theme == "dark" ? "light_mode" : "dark_mode"} />
      </span>
    </a>
  );
}

export default function Navigation() {
  const [menuActive, setMenuActive] = useState(false);
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Item to="/">
          <h1 className="title">Flossy</h1>
        </Item>
        <a
          role="button"
          className={"navbar-burger" + (menuActive ? " is-active" : "")}
          onClick={() => setMenuActive(!menuActive)}
        >
          <span aria-hidden={true} />
          <span aria-hidden={true} />
          <span aria-hidden={true} />
          <span aria-hidden={true} />
        </a>
      </div>
      <div className={"navbar-menu" + (menuActive ? " is-active" : "")}>
        <div className="navbar-start">
          <ThemeToggle />
          <Item to="/collections">My Collections</Item>
          <Item to="/nearest">Find Nearest Colors</Item>
        </div>
        <div className="navbar-end">
          <Item to="https://github.com/dhrosa/flossy">
            Source Code on GitHub
          </Item>
        </div>
      </div>
    </nav>
  );
}
