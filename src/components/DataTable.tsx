import { useCallback, useMemo, useRef, useState } from "react";
import { Dataset, fmt } from "@/lib/dataset";

export interface Selection {
  rows: Set<number>;
  cols: Set<string>;
  cells: Set<string>;
}

export const emptySelection = (): Selection => ({
  rows: new Set(),
  cols: new Set(),
  cells: new Set(),
});

export function selectionToCSV(ds: Dataset, sel: Selection): string {
  const toCsvVal = (v: any) => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    return /[,"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const hasRows = sel.rows.size > 0;
  const hasCols = sel.cols.size > 0;
  const hasCells = sel.cells.size > 0;

  if (!hasRows && !hasCols && !hasCells) {
    const head = ["Row #", ...ds.columns.map((c) => c.name)].join(",");
    const body = ds.rows
      .map((r, i) => [i + 1, ...ds.columns.map((c) => toCsvVal(r[c.name]))].join(","))
      .join("\n");
    return `${head}\n${body}`;
  }

  const colIndexByName = new Map(ds.columns.map((c, i) => [c.name, i]));
  const cellSet = new Set<string>();

  sel.rows.forEach((r) => {
    if (r < 0 || r >= ds.rows.length) return;
    ds.columns.forEach((_, c) => cellSet.add(`${r}:${c}`));
  });

  sel.cols.forEach((name) => {
    const c = colIndexByName.get(name);
    if (c === undefined) return;
    ds.rows.forEach((_, r) => cellSet.add(`${r}:${c}`));
  });

  sel.cells.forEach((k) => {
    const [rStr, cStr] = k.split(":");
    const r = Number(rStr);
    const c = Number(cStr);
    if (
      Number.isInteger(r) && Number.isInteger(c) &&
      r >= 0 && r < ds.rows.length &&
      c >= 0 && c < ds.columns.length
    ) {
      cellSet.add(k);
    }
  });

  if (cellSet.size === 0) return "Row #\n";

  const cellList = Array.from(cellSet).map((k) => {
    const [r, c] = k.split(":").map(Number);
    return [r, c] as const;
  });

  const activeRows = Array.from(new Set(cellList.map(([r]) => r))).sort((a, b) => a - b);
  const activeCols = Array.from(new Set(cellList.map(([, c]) => c))).sort((a, b) => a - b);

  const isDenseRectangle = cellSet.size === activeRows.length * activeCols.length;

  if (isDenseRectangle) {
    const head = ["Row #", ...activeCols.map((c) => ds.columns[c].name)].join(",");
    const body = activeRows
      .map((r) => [r + 1, ...activeCols.map((c) => toCsvVal(ds.rows[r][ds.columns[c].name]))].join(","))
      .join("\n");
    return `${head}\n${body}`;
  }

  cellList.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const head = "Row #,Column,Value";
  const body = cellList
    .map(([r, c]) => {
      const colName = ds.columns[c].name;
      return [r + 1, toCsvVal(colName), toCsvVal(ds.rows[r][colName])].join(",");
    })
    .join("\n");

  return `${head}\n${body}`;
}


export function selectionLabel(sel: Selection): string | null {
  const parts: string[] = [];
  if (sel.cols.size) parts.push(`${sel.cols.size} column${sel.cols.size > 1 ? "s" : ""}`);
  if (sel.rows.size) parts.push(`${sel.rows.size} row${sel.rows.size > 1 ? "s" : ""}`);
  if (sel.cells.size) parts.push(`${sel.cells.size} cell${sel.cells.size > 1 ? "s" : ""}`);
  return parts.length ? parts.join(" · ") : "Entire dataset";
}

interface Props {
  dataset: Dataset;
  selection: Selection;
  setSelection: (s: Selection) => void;
  onAsk: (prompt: string) => void;
}

export function DataTable({ dataset, selection, setSelection, onAsk }: Props) {
  const [drag, setDrag] = useState<{ start: [number, number]; current: [number, number] } | null>(
    null,
  );
  const [additive, setAdditive] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  const cols = dataset.columns;

  const inDrag = useCallback(
    (r: number, c: number): boolean => {
      if (!drag) return false;
      const [r1, c1] = drag.start;
      const [r2, c2] = drag.current;
      return (
        r >= Math.min(r1, r2) &&
        r <= Math.max(r1, r2) &&
        c >= Math.min(c1, c2) &&
        c <= Math.max(c1, c2)
      );
    },
    [drag],
  );

  const isCellSelected = (r: number, c: number) => {
    if (selection.rows.has(r)) return true;
    if (selection.cols.has(cols[c].name)) return true;
    if (selection.cells.has(`${r}:${c}`)) return true;
    return false;
  };

  const onMouseDown = (r: number, c: number, e: React.MouseEvent) => {
    setAdditive(e.shiftKey || e.metaKey || e.ctrlKey);
    setDrag({ start: [r, c], current: [r, c] });
  };
  const onMouseEnter = (r: number, c: number) => {
    if (drag) setDrag({ ...drag, current: [r, c] });
  };
  const onMouseUp = () => {
    if (!drag) return;
    const [r1, c1] = drag.start;
    const [r2, c2] = drag.current;
    const next: Selection = additive
      ? {
          rows: new Set(selection.rows),
          cols: new Set(selection.cols),
          cells: new Set(selection.cells),
        }
      : emptySelection();
    for (let r = Math.min(r1, r2); r <= Math.max(r1, r2); r++) {
      for (let c = Math.min(c1, c2); c <= Math.max(c1, c2); c++) {
        next.cells.add(`${r}:${c}`);
      }
    }
    setSelection(next);
    setDrag(null);
  };

  const toggleColumn = (name: string, e: React.MouseEvent) => {
    const additive = e.shiftKey || e.metaKey || e.ctrlKey;
    const next: Selection = additive
      ? {
          rows: new Set(selection.rows),
          cols: new Set(selection.cols),
          cells: new Set(selection.cells),
        }
      : { ...emptySelection(), cols: new Set<string>() };
    if (next.cols.has(name)) next.cols.delete(name);
    else next.cols.add(name);
    setSelection(next);
  };

  const toggleRow = (r: number, e: React.MouseEvent) => {
    const additive = e.shiftKey || e.metaKey || e.ctrlKey;
    const next: Selection = additive
      ? {
          rows: new Set(selection.rows),
          cols: new Set(selection.cols),
          cells: new Set(selection.cells),
        }
      : { ...emptySelection(), rows: new Set<number>() };
    if (next.rows.has(r)) next.rows.delete(r);
    else next.rows.add(r);
    setSelection(next);
  };

  const renderCell = (v: string | number | null) => {
    if (v === null || v === undefined || v === "") return "—";
    if (typeof v === "number") return fmt(v);
    return String(v);
  };

  const selStats = useMemo(() => {
    const cellRefs: Array<[number, number]> = [];
    if (selection.cells.size) {
      selection.cells.forEach((k) => {
        const [r, c] = k.split(":").map(Number);
        cellRefs.push([r, c]);
      });
    } else if (selection.cols.size || selection.rows.size) {
      const rowIdx =
        selection.rows.size > 0
          ? Array.from(selection.rows)
          : dataset.rows.map((_, i) => i);
      const colIdx =
        selection.cols.size > 0
          ? cols.map((c, i) => (selection.cols.has(c.name) ? i : -1)).filter((i) => i >= 0)
          : cols.map((_, i) => i);
      rowIdx.forEach((r) => colIdx.forEach((c) => cellRefs.push([r, c])));
    }
    const nums: number[] = [];
    cellRefs.forEach(([r, c]) => {
      const v = dataset.rows[r]?.[cols[c].name];
      if (typeof v === "number" && Number.isFinite(v)) nums.push(v);
    });
    if (!nums.length) return null;
    const sum = nums.reduce((a, b) => a + b, 0);
    return {
      count: nums.length,
      sum,
      mean: sum / nums.length,
      min: Math.min(...nums),
      max: Math.max(...nums),
    };
  }, [selection, dataset, cols]);

  return (
    <div
      className="flex flex-col h-[calc(100vh-65px)]"
      onMouseUp={onMouseUp}
      onMouseLeave={() => drag && onMouseUp()}
    >
      {/* Selection bar */}
      <div className="px-6 py-3 border-b border-border flex items-center gap-3 flex-wrap bg-canvas/60 backdrop-blur">
        <p className="eyebrow text-[0.6rem]">Selection</p>
        <p className="text-xs text-muted-foreground font-mono">
          {selectionLabel(selection) ?? "none — drag across cells, click a column or row header"}
        </p>
        {selStats && (
          <div className="text-xs font-mono text-foreground/80 flex gap-4 ml-auto">
            <span>n={selStats.count}</span>
            <span>Σ {fmt(selStats.sum)}</span>
            <span>μ {fmt(selStats.mean)}</span>
            <span>min {fmt(selStats.min)}</span>
            <span>max {fmt(selStats.max)}</span>
          </div>
        )}
        {selectionLabel(selection) && (
          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => onAsk("Plot the selected data in the most insightful way.")}
              className="text-[10px] tracking-widest uppercase bg-gold/10 text-gold border border-gold/40 hover:bg-gold/20 px-3 py-1.5 rounded-sm transition"
            >
              Plot selection
            </button>
            <button
              onClick={() => onAsk("Explain what the selected data shows.")}
              className="text-[10px] tracking-widest uppercase border border-border hover:border-gold/50 hover:text-gold px-3 py-1.5 rounded-sm transition text-muted-foreground"
            >
              Explain
            </button>
            <button
              onClick={() => setSelection(emptySelection())}
              className="text-[10px] tracking-widest uppercase text-muted-foreground hover:text-foreground px-2"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div ref={tableRef} className="flex-1 overflow-auto select-none">
        <table className="w-full text-xs font-mono border-separate border-spacing-0">
          <thead className="sticky top-0 z-10 bg-ink/95 backdrop-blur">
            <tr>
              <th className="w-12 sticky left-0 bg-ink/95 border-b border-r border-border px-2 py-2 text-[10px] text-muted-foreground font-normal">
                #
              </th>
              {cols.map((c) => {
                const active = selection.cols.has(c.name);
                return (
                  <th
                    key={c.name}
                    onClick={(e) => toggleColumn(c.name, e)}
                    className={`group cursor-pointer text-left px-3 py-2 border-b border-border font-normal whitespace-nowrap transition ${
                      active
                        ? "bg-gold/15 text-gold"
                        : "text-gold/80 hover:bg-gold/5"
                    }`}
                    title="Click to select column · Shift to add"
                  >
                    <div className="flex items-center gap-2">
                      <span>{c.name}</span>
                      <span className="text-[9px] text-muted-foreground/60 uppercase tracking-wider">
                        {c.kind}
                      </span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {dataset.rows.map((r, ri) => {
              const rowActive = selection.rows.has(ri);
              return (
                <tr
                  key={ri}
                  className="animate-fade-in"
                  style={{
                    animationDelay: `${Math.min(ri, 30) * 18}ms`,
                    animationFillMode: "backwards",
                  }}
                >
                  <td
                    onClick={(e) => toggleRow(ri, e)}
                    className={`sticky left-0 cursor-pointer text-center text-[10px] border-b border-r border-border transition ${
                      rowActive
                        ? "bg-gold/15 text-gold"
                        : "bg-ink/80 text-muted-foreground hover:bg-gold/5 hover:text-gold"
                    }`}
                    title="Click to select row · Shift to add"
                  >
                    {ri + 1}
                  </td>
                  {cols.map((c, ci) => {
                    const sel = isCellSelected(ri, ci);
                    const dragSel = inDrag(ri, ci);
                    return (
                      <td
                        key={c.name}
                        onMouseDown={(e) => onMouseDown(ri, ci, e)}
                        onMouseEnter={() => onMouseEnter(ri, ci)}
                        className={`px-3 py-1.5 border-b border-border/40 cursor-cell transition ${
                          sel || dragSel
                            ? "bg-gold/20 text-gold-soft"
                            : "text-foreground/85 hover:bg-gold/5"
                        }`}
                      >
                        {renderCell(r[c.name])}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
