import Papa from "papaparse";

export type Row = Record<string, string | number | null>;
export type ColumnKind = "number" | "category" | "date";

export interface Column {
  name: string;
  kind: ColumnKind;
  values: Array<string | number | null>;
}

export interface Dataset {
  rows: Row[];
  columns: Column[];
  numericCols: Column[];
  categoryCols: Column[];
}

const tryNumber = (v: unknown): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : Number(String(v).replace(/[, $%]/g, ""));
  return Number.isFinite(n) ? n : null;
};

const isDateLike = (v: unknown): boolean => {
  if (typeof v !== "string") return false;
  return /^\d{4}-\d{2}-\d{2}/.test(v) || /^\d{1,2}\/\d{1,2}\/\d{2,4}/.test(v);
};

export function parseCSV(text: string): Dataset {
  const result = Papa.parse<Record<string, string>>(text.trim(), {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
  });
  const rawRows = result.data.filter((r) => r && Object.keys(r).length > 0);
  const headers = result.meta.fields ?? Object.keys(rawRows[0] ?? {});

  const columns: Column[] = headers.map((name) => {
    const rawVals = rawRows.map((r) => r[name]);
    const numericTries = rawVals.map(tryNumber);
    const numericCount = numericTries.filter((n) => n !== null).length;
    const dateCount = rawVals.filter(isDateLike).length;
    let kind: ColumnKind = "category";
    if (numericCount / Math.max(1, rawVals.length) > 0.7) kind = "number";
    else if (dateCount / Math.max(1, rawVals.length) > 0.7) kind = "date";

    const values =
      kind === "number"
        ? numericTries
        : rawVals.map((v) => (v === undefined || v === "" ? null : String(v)));
    return { name, kind, values };
  });

  const rows: Row[] = rawRows.map((_, i) => {
    const r: Row = {};
    columns.forEach((c) => (r[c.name] = c.values[i]));
    return r;
  });

  return {
    rows,
    columns,
    numericCols: columns.filter((c) => c.kind === "number"),
    categoryCols: columns.filter((c) => c.kind !== "number"),
  };
}

export function stats(values: Array<number | null>) {
  const v = values.filter((x): x is number => x !== null);
  if (!v.length) return null;
  const sum = v.reduce((a, b) => a + b, 0);
  const mean = sum / v.length;
  const sorted = [...v].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  return {
    count: v.length,
    sum,
    mean,
    median,
    min: sorted[0],
    max: sorted[sorted.length - 1],
  };
}

export function fmt(n: number): string {
  if (!Number.isFinite(n)) return "—";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (abs >= 1_000) return (n / 1_000).toFixed(1) + "K";
  if (Number.isInteger(n)) return n.toLocaleString();
  return n.toFixed(2);
}

export function datasetSummary(ds: Dataset): string {
  const lines: string[] = [];
  lines.push(`Rows: ${ds.rows.length}, Columns: ${ds.columns.length}`);
  lines.push("Columns:");
  ds.columns.forEach((c) => {
    if (c.kind === "number") {
      const s = stats(c.values as Array<number | null>);
      lines.push(
        `  - ${c.name} [number] mean=${s ? fmt(s.mean) : "—"} min=${s ? fmt(s.min) : "—"} max=${s ? fmt(s.max) : "—"}`,
      );
    } else {
      const sample = (c.values as string[])
        .filter(Boolean)
        .slice(0, 5)
        .join(", ");
      lines.push(`  - ${c.name} [${c.kind}] sample: ${sample}`);
    }
  });
  lines.push("First 8 rows (CSV):");
  const head = ds.columns.map((c) => c.name).join(",");
  const body = ds.rows
    .slice(0, 8)
    .map((r) => ds.columns.map((c) => String(r[c.name] ?? "")).join(","))
    .join("\n");
  lines.push(head + "\n" + body);
  return lines.join("\n");
}

export const SAMPLE_CSV = `month,revenue,orders,returns,channel
Jan,12400,310,18,Web
Feb,13800,342,21,Web
Mar,15200,388,19,Web
Apr,14100,360,28,Retail
May,16800,402,22,Retail
Jun,19400,471,25,Retail
Jul,21200,512,30,Web
Aug,22800,548,33,Web
Sep,20100,498,29,Retail
Oct,23400,571,34,Retail
Nov,28900,672,41,Web
Dec,34100,798,52,Web`;
