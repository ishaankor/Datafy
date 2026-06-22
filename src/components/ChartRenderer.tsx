import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export interface ChartSpec {
  type: "line" | "bar" | "pie" | "scatter" | "area";
  title?: string;
  caption?: string;
  x?: string;
  y?: string | string[];
  data: Array<Record<string, string | number | null>>;
}

const GOLD = "oklch(0.78 0.13 80)";
const PALETTE = [
  "oklch(0.78 0.13 80)",
  "oklch(0.88 0.09 85)",
  "oklch(0.65 0.11 70)",
  "oklch(0.55 0.08 60)",
  "oklch(0.42 0.05 50)",
];

const tooltipStyle = {
  background: "oklch(0.10 0.005 60)",
  border: "1px solid oklch(0.78 0.13 80 / 0.4)",
  borderRadius: 2,
  fontFamily: "JetBrains Mono, monospace",
  fontSize: 10,
  color: "oklch(0.85 0.05 80)",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const title = data.name || payload[0].name || label;

    return (
      <div style={{ ...tooltipStyle, padding: "8px" }}>
        {title && (
          <div style={{ fontWeight: "bold", marginBottom: "4px", paddingBottom: "4px", borderBottom: "1px solid oklch(0.78 0.13 80 / 0.2)" }}>
            {title}
          </div>
        )}
        {payload.map((entry: any, index: number) => {
          const showName = entry.name && entry.name !== title;
          return (
            <div key={index} style={{ color: entry.color || GOLD, marginTop: "2px" }}>
              {showName && <span style={{ opacity: 0.8 }}>{entry.name}: </span>}
              <span style={{ fontWeight: 500 }}>{entry.value}</span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

export function ChartRenderer({ spec }: { spec: ChartSpec }) {
  const ys = Array.isArray(spec.y) ? spec.y : spec.y ? [spec.y] : [];
  const data = spec.data ?? [];

  const specX = spec.x;
  const specY0 = ys[0];

  const x =
    specX && data.some((d) => d[specX] !== undefined)
      ? specX
      : data.some((d) => d.name !== undefined)
      ? "name"
      : specX ?? "x";

  const pieY =
    specY0 && data.some((d) => d[specY0] !== undefined)
      ? specY0
      : data.some((d) => d.value !== undefined)
      ? "value"
      : specY0 ?? "y";

  const renderInner = () => {
    switch (spec.type) {
      case "line":
        return (
          <LineChart data={data} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid stroke="oklch(0.3 0.005 60)" strokeDasharray="2 4" vertical={false} />
            <XAxis dataKey={x} stroke="oklch(0.55 0.01 60)" fontSize={9} tickLine={false} axisLine={false} />
            <YAxis stroke="oklch(0.55 0.01 60)" fontSize={9} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            {ys.length > 1 && <Legend wrapperStyle={{ fontSize: 10 }} />}
            {ys.map((k, i) => (
              <Line key={k} type="monotone" dataKey={k} stroke={PALETTE[i % PALETTE.length]} strokeWidth={1.5} dot={{ r: 2 }} />
            ))}
          </LineChart>
        );
      case "area":
        return (
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid stroke="oklch(0.3 0.005 60)" strokeDasharray="2 4" vertical={false} />
            <XAxis dataKey={x} stroke="oklch(0.55 0.01 60)" fontSize={9} tickLine={false} axisLine={false} />
            <YAxis stroke="oklch(0.55 0.01 60)" fontSize={9} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            {ys.map((k, i) => (
              <Area key={k} type="monotone" dataKey={k} stroke={PALETTE[i % PALETTE.length]} fill={PALETTE[i % PALETTE.length]} fillOpacity={0.25} />
            ))}
          </AreaChart>
        );
      case "bar":
        return (
          <BarChart data={data} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid stroke="oklch(0.3 0.005 60)" strokeDasharray="2 4" vertical={false} />
            <XAxis dataKey={x} stroke="oklch(0.55 0.01 60)" fontSize={9} tickLine={false} axisLine={false} />
            <YAxis stroke="oklch(0.55 0.01 60)" fontSize={9} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "oklch(0.78 0.13 80 / 0.08)" }} />
            {ys.length > 1 && <Legend wrapperStyle={{ fontSize: 10 }} />}
            {ys.map((k, i) => (
              <Bar key={k} dataKey={k} fill={PALETTE[i % PALETTE.length]} radius={[2, 2, 0, 0]} />
            ))}
          </BarChart>
        );
      case "pie":
        return (
          <PieChart>
            <Pie data={data} dataKey={pieY} nameKey={x} innerRadius={40} outerRadius={75} paddingAngle={2} stroke="oklch(0.10 0.005 60)">
              {data.map((_, i) => (
                <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
          </PieChart>
        );
      case "scatter":
        return (
          <ScatterChart margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid stroke="oklch(0.3 0.005 60)" strokeDasharray="2 4" />
            <XAxis dataKey={x} name={x} stroke="oklch(0.55 0.01 60)" fontSize={9} tickLine={false} axisLine={false} />
            <YAxis dataKey={ys[0] ?? "y"} name={ys[0] ?? "y"} stroke="oklch(0.55 0.01 60)" fontSize={9} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: GOLD, strokeWidth: 1 }} />
            <Scatter data={data} fill={GOLD} />
          </ScatterChart>
        );
      default:
        return <p className="text-xs text-muted-foreground">Unknown chart type: {spec.type}</p>;
    }
  };

  return (
    <div className="my-3 bg-ink/60 border border-gold/30 rounded-sm p-3">
      {spec.title && (
        <p className="font-display text-base text-gold-soft leading-tight">{spec.title}</p>
      )}
      {spec.caption && (
        <p className="text-[10px] text-muted-foreground italic mb-2">{spec.caption}</p>
      )}
      <div className="h-56 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          {renderInner()}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export type Segment =
  | { kind: "text"; text: string }
  | { kind: "chart"; spec: ChartSpec }
  | { kind: "error"; text: string };

export function parseChartSegments(text: string): Segment[] {
  const segments: Segment[] = [];
  const re = /```chart\s*\n([\s\S]*?)```/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      segments.push({ kind: "text", text: text.slice(last, m.index) });
    }
    try {
      const spec = JSON.parse(m[1]) as ChartSpec;
      segments.push({ kind: "chart", spec });
    } catch {
      segments.push({ kind: "error", text: "Could not parse chart spec." });
    }
    last = re.lastIndex;
  }
  if (last < text.length) segments.push({ kind: "text", text: text.slice(last) });
  return segments;
}