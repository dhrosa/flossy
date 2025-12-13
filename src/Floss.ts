import Color from "colorjs.io";

// Sourced from https://github.com/bmanturner/hex-dmc/blob/master/est_dmc_hex.txt
import flossListText from "bundle-text:./floss.txt";

export class SingleFloss {
  readonly name: string;
  readonly description: string;
  readonly color: Color;

  private static _all: SingleFloss[] = [];

  static all(): SingleFloss[] {
    if (this._all.length == 0) {
      this._all = loadFlosses();
    }
    return this._all;
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

  get cssStyle() {
    return {
      color: textColor(this.color),
      backgroundColor: this.color.display(),
    };
  }

  // Find floss with the given name.
  static fromName(name: string): SingleFloss {
    const floss = SingleFloss.all().find((f) => f.name === name);
    if (!floss) {
      throw new Error(`Unknown floss: ${name}`);
    }
    return floss;
  }

  // Predicate for floss whose name or description matches the given string.
  matchesFilter(filter: string): boolean {
    filter = filter.toLowerCase();
    return (
      this.name.toLowerCase().includes(filter) ||
      this.description.toLowerCase().includes(filter)
    );
  }
}

export class Blend {
  readonly flosses: SingleFloss[];
  readonly name: string;
  readonly description: string;
  readonly color: Color;

  constructor(flosses: SingleFloss[]) {
    this.flosses = flosses;
    this.name = flosses.map((f) => f.name).join(" + ");
    this.description = flosses.map((f) => f.description).join(" + ");

    let r = 0;
    let g = 0;
    let b = 0;
    for (const floss of flosses) {
      r += floss.color.srgb.r;
      g += floss.color.srgb.g;
      b += floss.color.srgb.b;
    }
    const n = this.flosses.length;
    this.color = new Color("srgb", [r / n, g / n, b / n]);
  }

  get cssStyle() {
    const gradientArgs = this.flosses.map((f) => f.color.display()).join(", ");
    return {
      color: textColor(this.color),
      background: `linear-gradient(45deg, ${gradientArgs})`,
    };
  }

  contains(floss: SingleFloss): boolean {
    return this.flosses.find((f) => f.name === floss.name) !== undefined;
  }
}

export type Floss = SingleFloss | Blend;

// Sort flosses by name.
export function sortedFlosses(flosses: SingleFloss[]): SingleFloss[] {
  return flosses.toSorted(compareNames);
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

function loadFlosses(): SingleFloss[] {
  let lines = flossListText.split("\n").map((line) => line.trim());

  var entries: SingleFloss[] = [];
  for (let i = 0; i < lines.length; i += 3) {
    entries.push(
      new SingleFloss({
        name: lines[i],
        description: lines[i + 1],
        color: new Color("#" + lines[i + 2]),
      }),
    );
  }
  return sortedFlosses(entries);
}

function textColor(color: Color): string {
  // TODO: Figure out colorjs.io utility for this. The existing luminance
  // calculations provides poor contrast on dark backgrounds.
  const brightness = Math.floor(
    ((color.r * 299 + color.g * 587 + color.b * 114) * 255) / 1000,
  );
  const isLight = brightness > 128;
  return isLight ? "var(--bulma-dark)" : "var(--bulma-light)";
}
