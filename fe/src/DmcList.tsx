import React from "react";
import { DmcColor } from "./Dmc";

export default function DmcList({ colors }: { colors: DmcColor[] }) {
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
              style={{ color: "blue", backgroundColor: `#${color.rgb}` }}
            ></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
