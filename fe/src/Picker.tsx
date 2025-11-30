import { useState, ComponentProps } from "react";
import { Floss } from "./Floss";
import { Modal } from "./Modal";
import { Symbol } from "./Symbol";

function FlossButton({
  floss,
  ...rest
}: { floss: Floss } & ComponentProps<"button">) {
  return (
    <button
      className="floss button"
      style={floss.cssStyle()}
      title={floss.description}
      {...rest}
    >
      {floss.name}
    </button>
  );
}

export default function Picker({
  flosses,
  currentFloss,
  onPick,
}: {
  flosses: Floss[];
  currentFloss: Floss | null;
  onPick: (floss: Floss) => void;
}) {
  const [active, setActive] = useState(false);
  const [searchText, setSearchText] = useState("");
  const filteredFlosses = flosses.filter(
    (f) =>
      f.name.toLowerCase().includes(searchText) ||
      f.description.toLowerCase().includes(searchText),
  );
  const initialButton = currentFloss ? (
    <FlossButton floss={currentFloss} onClick={() => setActive(true)} />
  ) : (
    <button className="floss button" onClick={() => setActive(true)}>
      Choose Floss
    </button>
  );
  return (
    <div className="floss-picker">
      {initialButton}
      <Modal active={active} onClose={() => setActive(false)}>
        <div className="box">
          <p className="block control has-icons-left">
            <input
              className="input"
              type="text"
              placeholder="Search"
              name="search"
              autoComplete="off"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <span className="icon is-left">
              <Symbol name="search" />
            </span>
          </p>
          <div className="flosses block grid">
            {filteredFlosses.map((f) => (
              <FlossButton
                floss={f}
                key={f.name}
                onClick={() => {
                  setActive(false);
                  onPick(f);
                }}
              />
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}
