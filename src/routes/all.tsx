// Page for showing all known flosses.

import { createFileRoute } from "@tanstack/react-router";
import { SingleFloss } from "../Floss";
import { useState } from "react";
import { Control, Field, Label } from "../Form";

export const Route = createFileRoute("/all")({
  component: AllFlossesPage,
});

function AllFlossesPage() {
  const [filterText, setFilterText] = useState("");
  const flosses = SingleFloss.all.filter((f) => f.matchesFilter(filterText));
  return (
    <div className="all-flosses">
      <p className="title is-4">Flosses Reference</p>
      <Field>
        <Label>Search</Label>
        <Control>
          <input
            className="input"
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Search by name or description..."
          />
        </Control>
      </Field>
      <table className="table is-striped is-hoverable is-fullwidth is-bordered">
        <thead>
          <tr>
            <th>Color</th>
            <th>Name</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {flosses.map(({ name, description, cssStyle }) => (
            <tr key={name}>
              <td style={cssStyle}></td>
              <td>{name}</td>
              <td>{description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
