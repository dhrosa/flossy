import React from "react";
import { Floss } from "./Floss";

export default function FlossList({ colors }: { colors: Floss[] }) {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Description</th>
          <th>Color</th>
        </tr>
      </thead>
      <tbody>
        {colors.map((color) => (
          <tr key={color.name}>
            <td>{color.name}</td>
            <td>{color.description}</td>
            <td
              style={{ color: "blue", backgroundColor: color.color.toHex() }}
            ></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
