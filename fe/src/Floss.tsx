import { Color } from "color-core";

export class Floss {
  name: string;
  description: string;
  color: Color;

  constructor({
    name,
    description,
    color,
  }: {
    name: string;
    description: string;
    color: Color;
  }) {
    this.name = name;
    this.description = description;
    this.color = color;
  }

  cssStyle() {
    return {
      color: this.color.isLight() ? "var(--bulma-dark)" : "var(--bulma-light)",
      backgroundColor: this.color.toHex(),
    };
  }
}

function compareNames(a: Floss, b: Floss): number {
  const normalizeName = (name: string): string => {
    if (isNaN(Number(name))) {
      return name;
    }
    return name.padStart(4, "0");
  };
  return normalizeName(a.name).localeCompare(normalizeName(b.name));
}

export async function FetchFlosses(): Promise<Floss[]> {
  let response = await fetch(
    "https://raw.githubusercontent.com/bmanturner/hex-dmc/refs/heads/master/est_dmc_hex.txt",
  );
  let text = await response.text();
  let lines = text.split("\n").map((line) => line.trim());

  var entries: Floss[] = [];
  for (let i = 0; i < lines.length; i += 3) {
    entries.push(
      new Floss({
        name: lines[i],
        description: lines[i + 1],
        color: new Color(lines[i + 2]),
      }),
    );
  }

  entries.sort(compareNames);
  return entries;
}
