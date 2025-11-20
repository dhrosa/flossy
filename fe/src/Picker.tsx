import { useEffect, useState, ReactNode, ComponentProps } from "react";
import { Floss } from "./Floss";

function Modal({
  children,
  active,
  onClose,
}: {
  children?: ReactNode;
  active: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    const onEscape = (event: any) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onEscape);
    return () => {
      window.removeEventListener("keydown", onEscape);
    };
  });
  return (
    <div className={"modal " + (active ? "is-active" : "")}>
      <div className="modal-background" onClick={onClose} />
      <div className="modal-content">{children}</div>
      <button className="modal-close is-large" aria-label="close" />
    </div>
  );
}

function Symbol({
  className,
  name,
}: {
  className?: string;
  name: string;
} & ComponentProps<"span">) {
  return (
    <span className={`material-symbols-outlined ${className || ""}`}>
      {name}
    </span>
  );
}

function FlossPanelBlock({ floss }: { floss: Floss }) {
  return (
    <button className="panel-block">
      <div className="floss">
        <span
          className="icon color"
          style={{ backgroundColor: floss.color.toHex() }}
        />
        <div className="text">
          <p className="name">{floss.name}</p>
          <p className="description">{floss.description}</p>
        </div>
      </div>
    </button>
  );
}

export default function Picker({
  currentFloss,
  flosses,
}: {
  currentFloss?: Floss;
  flosses: Floss[];
}) {
  const [active, setActive] = useState(false);
  const [searchText, setSearchText] = useState("");
  const filteredFlosses = flosses.filter(
    (f) =>
      f.name.toLowerCase().includes(searchText) ||
      f.description.toLowerCase().includes(searchText),
  );
  return (
    <div className="floss-picker">
      <button className="button" onClick={() => setActive(true)}>
        Choose Floss
      </button>
      <Modal active={active} onClose={() => setActive(false)}>
        <nav className="panel">
          <p className="panel-heading">Choose Floss</p>
          <div className="panel-block">
            <p className="control has-icons-left">
              <input
                className="input"
                type="text"
                placeholder="Search"
                name="search"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <span className="icon is-left">
                <Symbol name="search" />
              </span>
            </p>
          </div>
          {filteredFlosses.map((f) => (
            <FlossPanelBlock key={f.name} floss={f} />
          ))}
        </nav>
      </Modal>
    </div>
  );
}
