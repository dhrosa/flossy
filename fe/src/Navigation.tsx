import { ComponentProps, useState } from "react";
import { Link } from "react-router";

function Item({
  className,
  to,
  ...rest
}: { className?: string; to: string } & ComponentProps<"a">) {
  return (
    <Link to={to} className={"navbar-item " + (className || "")} {...rest} />
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
          onClick={() => {
            setMenuActive(!menuActive);
          }}
        >
          <span aria-hidden={true} />
          <span aria-hidden={true} />
          <span aria-hidden={true} />
          <span aria-hidden={true} />
        </a>
      </div>
      <div className={"navbar-menu" + (menuActive ? "is-active" : "")}>
        <div className="navbar-start"></div>
        <div className="navbar-end">
          <Item to="/collections">My Collections</Item>
          <Item to="/nearest">Find Nearest Colors</Item>
          <Item to="/blend">Blend Colors</Item>
        </div>
      </div>
    </nav>
  );
}
