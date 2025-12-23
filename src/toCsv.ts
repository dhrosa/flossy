import { SingleFloss } from "./Floss";
import { stringify } from "csv-stringify/browser/esm/sync";

/** Render list of flosses as a CSV string.*/
function toCsv(flosses: SingleFloss[]): string {
  const records = flosses.map(({ name, description }) => {
    return {
      name,
      description,
    };
  });
  return stringify(records, { header: true });
}

/** Copy flosses to clipboard as a CSV document. */
export function copyAsCsv(flosses: SingleFloss[]): void {
  navigator.clipboard.writeText(toCsv(flosses)).catch((error) => {
    console.log("Failed to copy text: ", error);
  });
}

/** Prompt user to download flosses as a CSV document. */
export function downloadAsCsv(
  downloadName: string,
  flosses: SingleFloss[],
): void {
  const blob = new Blob([toCsv(flosses)], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = downloadName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
