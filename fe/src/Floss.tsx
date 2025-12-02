import Color from "colorjs.io";

// Sourced from https://github.com/bmanturner/hex-dmc/blob/master/est_dmc_hex.txt
import flossListText from "bundle-text:./floss.txt";

export class Floss {
  name: string;
  description: string;
  color: Color;

  private static allFlosses: Floss[] = [];

  static all(): Floss[] {
    if (this.allFlosses.length == 0) {
      this.allFlosses = loadFlosses();
    }
    return this.allFlosses;
  }

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
    const color = this.color;
    // TODO: Figure out colorjs.io utility for this. The existing luminance
    // calculations provides poor contrast on dark backgrounds.
    const brightness = Math.floor(
      ((color.r * 299 + color.g * 587 + color.b * 114) * 255) / 1000,
    );
    const isLight = brightness > 128;
    return {
      color: isLight ? "var(--bulma-dark)" : "var(--bulma-light)",
      backgroundColor: this.color.display(),
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

function loadFlosses(): Floss[] {
  let lines = flossListText.split("\n").map((line) => line.trim());

  var entries: Floss[] = [];
  for (let i = 0; i < lines.length; i += 3) {
    entries.push(
      new Floss({
        name: lines[i],
        description: lines[i + 1],
        color: new Color("#" + lines[i + 2]),
      }),
    );
  }

  entries.sort(compareNames);
  return entries;
}
