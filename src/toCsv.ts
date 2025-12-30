import { toast } from "react-toastify";
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
export async function copyAsCsv(flosses: SingleFloss[]) {
  const csv = toCsv(flosses);
  try {
    await navigator.clipboard.writeText(csv);
    toast.info("CSV copied to clipboard");
  } catch (error: unknown) {
    toast.error(`Failed to copy CSV to clipboard: ${new String(error)}`);
  }
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
