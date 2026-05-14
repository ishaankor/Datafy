import { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { MessageCircle } from "lucide-react";
import { Dataset, stats, fmt, Column } from "@/lib/dataset";

interface Props {
  dataset: Dataset;
  name: string;
  onAsk: (focus: string) => void;
}

const GOLD = "oklch(0.78 0.13 80)";
const GOLD_SOFT = "oklch(0.88 0.09 85)";
const PALETTE = [
  "oklch(0.78 0.13 80)",
  "oklch(0.88 0.09 85)",
  "oklch(0.65 0.11 70)",
  "oklch(0.55 0.08 60)",
  "oklch(0.42 0.05 50)",
];

function CardShell({
  eyebrow,
  title,
  caption,
  onAsk,
  children,
  span = "md:col-span-1",
}: {
  eyebrow: string;
  title: string;
  caption?: string;
  onAsk: () => void;
  children: React.ReactNode;
  span?: string;
}) {
  return (
    <div
      className={`group relative bg-card/70 backdrop-blur border border-border rounded-sm p-6 shadow-noir transition hover:border-gold/40 hover:shadow-glow ${span}`}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="eyebrow">{eyebrow}</p>
        <button
          onClick={onAsk}
          className="opacity-0 group-hover:opacity-100 transition text-gold hover:text-gold-soft text-[10px] tracking-widest uppercase flex items-center gap-1"
          title="Ask the curator about this"
        >
          <MessageCircle className="w-3 h-3" /> Ask
        </button>
      </div>
      <h3 className="font-display text-2xl mb-1 leading-tight">{title}</h3>
      {caption && (
        <p className="text-xs text-muted-foreground italic mb-4">{caption}</p>
      )}
      <div className="mt-4">{children}</div>
    </div>
  );
}

export function CanvasView({ dataset, name, onAsk }: Props) {
  const kpis = useMemo(() => {
    return dataset.numericCols.slice(0, 4).map((c) => ({
      col: c,
      s: stats(c.values as Array<number | null>),
    }));
  }, [dataset]);

  // Pick a label column (first non-numeric) and a primary metric (first numeric)
  const labelCol: Column | undefined = dataset.categoryCols[0];
  const primary = dataset.numericCols[0];
  const secondary = dataset.numericCols[1];

  const seriesData = useMemo(() => {
    if (!primary) return [];
    return dataset.rows.slice(0, 60).map((r, i) => ({
      label: labelCol ? String(r[labelCol.name] ?? i) : String(i + 1),
      [primary.name]: Number(r[primary.name] ?? 0),
      ...(secondary ? { [secondary.name]: Number(r[secondary.name] ?? 0) } : {}),
    }));
  }, [dataset, labelCol, primary, secondary]);

  // Category breakdown (group rows by last category column, sum primary)
  const breakdown = useMemo(() => {
    const cat = dataset.categoryCols[dataset.categoryCols.length - 1];
    if (!cat || !primary) return [];
    const map = new Map<string, number>();
    dataset.rows.forEach((r) => {
      const k = String(r[cat.name] ?? "—");
      map.set(k, (map.get(k) ?? 0) + Number(r[primary.name] ?? 0));
    });
    return Array.from(map, ([name, value]) => ({ name, value }));
  }, [dataset, primary]);

  return (
    <div className="px-6 md:px-12 py-10">
      <header className="mb-10 flex items-baseline justify-between flex-wrap gap-4">
        <div>
          <p className="eyebrow mb-2">An Editorial Reading</p>
          <h2 className="font-display text-4xl md:text-5xl">
            <em className="text-gold">{name}</em>
          </h2>
          <p className="text-xs text-muted-foreground mt-2 font-mono">
            {dataset.rows.length} observations · {dataset.columns.length} fields
          </p>
        </div>
        <div className="hairline flex-1 max-w-xs" />
      </header>

      {/* KPI strip */}
      {kpis.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {kpis.map(({ col, s }) => (
            <button
              key={col.name}
              onClick={() => onAsk(`The metric "${col.name}" — explain its distribution and what's notable.`)}
              className="text-left bg-card/40 border border-border rounded-sm p-5 hover:border-gold/50 transition group"
            >
              <p className="eyebrow text-[0.6rem]">{col.name}</p>
              <p className="font-display text-3xl mt-2 text-gold-soft group-hover:text-gold transition">
                {s ? fmt(s.sum) : "—"}
              </p>
              <p className="text-[10px] text-muted-foreground mt-2 font-mono">
                avg {s ? fmt(s.mean) : "—"} · max {s ? fmt(s.max) : "—"}
              </p>
            </button>
          ))}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {primary && (
          <CardShell
            eyebrow="Plate I — Movement"
            title={primary.name}
            caption={`The principal trajectory across ${labelCol?.name ?? "observations"}.`}
            span="md:col-span-2"
            onAsk={() =>
              onAsk(`Describe the trend of "${primary.name}" over "${labelCol?.name ?? "observations"}". Note inflections.`)
            }
          >
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={seriesData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="oklch(0.3 0.005 60)" strokeDasharray="2 4" vertical={false} />
                <XAxis dataKey="label" stroke="oklch(0.55 0.01 60)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.55 0.01 60)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.12 0.005 60)",
                    border: "1px solid oklch(0.78 0.13 80 / 0.4)",
                    borderRadius: 2,
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: 11,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey={primary.name}
                  stroke={GOLD}
                  strokeWidth={1.5}
                  dot={{ r: 2, fill: GOLD }}
                  activeDot={{ r: 4, fill: GOLD_SOFT }}
                />
                {secondary && (
                  <Line
                    type="monotone"
                    dataKey={secondary.name}
                    stroke={GOLD_SOFT}
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    dot={false}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </CardShell>
        )}

        {breakdown.length > 1 && (
          <CardShell
            eyebrow="Plate II — Composition"
            title="Distribution"
            caption="How the whole divides itself."
            onAsk={() => onAsk(`Analyze the composition breakdown — which segments dominate and why might that matter?`)}
          >
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={breakdown}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={2}
                  stroke="oklch(0.14 0.005 60)"
                >
                  {breakdown.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.12 0.005 60)",
                    border: "1px solid oklch(0.78 0.13 80 / 0.4)",
                    borderRadius: 2,
                    fontSize: 11,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <ul className="mt-3 space-y-1">
              {breakdown.map((b, i) => (
                <li key={b.name} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: PALETTE[i % PALETTE.length] }}
                    />
                    {b.name}
                  </span>
                  <span className="font-mono text-foreground/80">{fmt(b.value)}</span>
                </li>
              ))}
            </ul>
          </CardShell>
        )}

        {primary && (
          <CardShell
            eyebrow="Plate III — Magnitude"
            title={`${primary.name} by row`}
            caption="Bar by bar — the texture of the data."
            span="md:col-span-3"
            onAsk={() => onAsk(`Identify outliers and clusters in "${primary.name}" by ${labelCol?.name ?? "row"}.`)}
          >
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={seriesData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="oklch(0.3 0.005 60)" strokeDasharray="2 4" vertical={false} />
                <XAxis dataKey="label" stroke="oklch(0.55 0.01 60)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.55 0.01 60)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: "oklch(0.78 0.13 80 / 0.08)" }}
                  contentStyle={{
                    background: "oklch(0.12 0.005 60)",
                    border: "1px solid oklch(0.78 0.13 80 / 0.4)",
                    borderRadius: 2,
                    fontSize: 11,
                  }}
                />
                <Bar dataKey={primary.name} fill={GOLD} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardShell>
        )}

        {/* Data table excerpt */}
        <CardShell
          eyebrow="Appendix — The record"
          title="Source observations"
          caption="The raw text from which the canvas was composed."
          span="md:col-span-3"
          onAsk={() => onAsk("Give me three non-obvious observations about this dataset.")}
        >
          <div className="overflow-auto max-h-72 border border-border rounded-sm">
            <table className="w-full text-xs font-mono">
              <thead className="bg-ink/60 sticky top-0">
                <tr>
                  {dataset.columns.map((c) => (
                    <th
                      key={c.name}
                      className="text-left px-3 py-2 border-b border-border text-gold/80 font-normal"
                    >
                      {c.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dataset.rows.slice(0, 50).map((r, i) => (
                  <tr key={i} className="hover:bg-gold/5">
                    {dataset.columns.map((c) => (
                      <td
                        key={c.name}
                        className="px-3 py-1.5 border-b border-border/40 text-foreground/80"
                      >
                        {r[c.name] === null || r[c.name] === undefined
                          ? "—"
                          : typeof r[c.name] === "number"
                            ? fmt(r[c.name] as number)
                            : String(r[c.name])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardShell>
      </div>
    </div>
  );
}
