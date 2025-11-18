//export type Rgb = [number, number, number]; React.ReactNode

export interface DmcColor {
  name: string;
  description: string;
  rgb: string;
}

function compareNames(a: DmcColor, b: DmcColor): number {
  const normalizeName = (name: string): string => {
    if (isNaN(Number(name))) {
        return name;
    }
    return name.padStart(4, "0");
  };
  return normalizeName(a.name).localeCompare(normalizeName(b.name));
}

export async function FetchDmcColors(): Promise<DmcColor[]> {
  let response = await fetch(
    "https://raw.githubusercontent.com/bmanturner/hex-dmc/refs/heads/master/est_dmc_hex.txt",
  );
  let text = await response.text();
  let lines = text.split("\n").map((line) => line.trim());

  var entries: DmcColor[] = [];
  for (let i = 0; i < lines.length; i += 3) {
    entries.push({
      name: lines[i],
      description: lines[i + 1],
      rgb: lines[i + 2],
    });
  }

  entries.sort(compareNames);
  return entries;
}
