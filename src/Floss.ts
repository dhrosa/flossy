import Color from "colorjs.io";

import dmcData from "./dmc.json";

export class SingleFloss {
  readonly name: string;
  readonly description: string;
  readonly color: Color;

  private static _all?: SingleFloss[];

  static get all(): SingleFloss[] {
    if (this._all === undefined) {
      this._all = loadFlosses();
      console.log(`Loaded ${this._all.length} flosses.`);
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
    const floss = SingleFloss.all.find((f) => f.name === name);
    if (!floss) {
      throw new Error(`Unknown floss: ${name}`);
    }
    return floss;
  }

  // A random floss.
  static random(): SingleFloss {
    const all = SingleFloss.all;
    return all[Math.floor(Math.random() * all.length)];
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
      const srgb = floss.color.srgb;
      r += srgb.r;
      g += srgb.g;
      b += srgb.b;
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

// Sort comparator for flosses by name. Non-numeric names are sorted earlier.
function compareNames(a: Floss, b: Floss): number {
  const numberA = Number(a.name);
  const numberB = Number(b.name);
  // Two string names; compare as strings.
  if (isNaN(numberA) && isNaN(numberB)) {
    return a.name.localeCompare(b.name);
  }
  // String vs number; A should sort first.
  if (isNaN(numberA)) {
    return -1;
  }
  // Number vs string; B should sort first.
  if (isNaN(numberB)) {
    return 1;
  }
  // Both numbers; compare as numbers.
  return numberA - numberB;
}

function loadFlosses(): SingleFloss[] {
  var entries: SingleFloss[] = [];
  for (const { name, description, color } of dmcData) {
    entries.push(
      new SingleFloss({
        name,
        description,
        color: new Color(color),
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
