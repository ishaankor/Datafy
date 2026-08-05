import { useState, useMemo } from "react";
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
  type:
    | "line"
    | "bar"
    | "pie"
    | "scatter"
    | "area"
    | "column"
    | "histogram"
    | "combo"
    | "multivariate";
  title?: string;
  caption?: string;
  x?: string;
  y?: string | string[];
  category?: string;
  data: Array<Record<string, string | number | boolean | null>>;
}

export type Segment =
  | { kind: "text"; text: string }
  | { kind: "chart"; spec: ChartSpec }
  | { kind: "image"; alt: string; src: string }
  | { kind: "error"; text: string };

const GOLD = "oklch(0.78 0.13 80)";
const PALETTE = [
  "oklch(0.78 0.13 80)",  // Gold
  "oklch(0.68 0.18 220)", // Vibrant Cyan
  "oklch(0.70 0.22 30)",  // Coral / Red
  "oklch(0.72 0.20 145)", // Emerald Green
  "oklch(0.75 0.18 310)", // Purple / Magenta
  "oklch(0.82 0.15 60)",  // Amber
];

const tooltipStyle = {
  background: "oklch(0.10 0.005 60)",
  border: "1px solid oklch(0.78 0.13 80 / 0.4)",
  borderRadius: 4,
  fontFamily: "JetBrains Mono, monospace",
  fontSize: 11,
  color: "oklch(0.90 0.05 80)",
  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const title = data.name || payload[0].name || label;

    return (
      <div style={{ ...tooltipStyle, padding: "8px 12px" }}>
        {title !== undefined && (
          <div
            style={{
              fontWeight: "bold",
              marginBottom: "4px",
              paddingBottom: "4px",
              borderBottom: "1px solid oklch(0.78 0.13 80 / 0.2)",
            }}
          >
            {String(title)}
          </div>
        )}
        {payload.map((entry: any, index: number) => {
          const showName = entry.name && entry.name !== title;
          return (
            <div key={index} style={{ color: entry.color || GOLD, marginTop: "2px" }}>
              {showName && <span style={{ opacity: 0.8 }}>{entry.name}: </span>}
              <span style={{ fontWeight: 600 }}>{entry.value}</span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

export function ImageRenderer({ alt, src }: { alt: string; src: string }) {
  const cleanSrc = src ? src.replace(/[\r\n\s]+/g, "") : "";
  return (
    <div className="my-3 bg-ink/80 border border-gold/30 rounded-lg p-3 shadow-xl">
      {alt && <p className="font-display text-sm text-gold-soft leading-tight mb-2">{alt}</p>}
      <div className="flex justify-center bg-black/40 rounded p-2">
        <img src={cleanSrc} alt={alt} className="max-w-full h-auto rounded object-contain" />
      </div>
    </div>
  );
}

export function ChartRenderer({ spec }: { spec: ChartSpec }) {
  const [activeType, setActiveType] = useState<ChartSpec["type"]>(spec.type || "bar");

  // Normalize data and compute resolution mapping
  const { data, xKey, yKeys, categoryKey, isCategoryDiscrete } = useMemo(() => {
    const rawData = Array.isArray(spec.data) ? spec.data : [];
    if (rawData.length === 0) {
      return { data: [], xKey: "x", yKeys: [], categoryKey: undefined, isCategoryDiscrete: false };
    }

    // Convert string numbers to JS numbers & index rows if needed
    const processedData = rawData.map((item, idx) => {
      if (!item || typeof item !== "object") return { _index: idx + 1 };
      const newItem: Record<string, any> = { _index: idx + 1 };
      for (const key of Object.keys(item)) {
        const val = item[key];
        if (typeof val === "string" && val.trim() !== "" && !isNaN(Number(val))) {
          newItem[key] = Number(val);
        } else {
          newItem[key] = val;
        }
      }
      return newItem;
    });

    const sampleObj = processedData[0] || {};
    const allKeys = Object.keys(sampleObj).filter((k) => k !== "_index");

    const isNumericColumn = (col: string) => {
      const vals = processedData.map((d) => d[col]).filter((v) => v !== null && v !== undefined);
      return (
        vals.length > 0 &&
        vals.every((v) => typeof v === "number" || (!isNaN(Number(v)) && String(v).trim() !== ""))
      );
    };

    const numCols = allKeys.filter(isNumericColumn);
    const catCols = allKeys.filter((k) => !numCols.includes(k));

    let x = spec.x && allKeys.includes(spec.x) ? spec.x : undefined;
    let ys = Array.isArray(spec.y)
      ? spec.y.filter((k) => allKeys.includes(k))
      : spec.y && allKeys.includes(spec.y)
      ? [spec.y]
      : [];
    let catKey = spec.category && allKeys.includes(spec.category) ? spec.category : undefined;

    // Smart Column Resolution Logic
    if (catCols.length >= 1 && numCols.length >= 1) {
      x = catCols[0];
      ys = ys.length > 0 ? ys : numCols;
      catKey = catCols[0];
    } else if (numCols.length >= 2) {
      if (!x || !numCols.includes(x)) x = numCols[0];
      if (ys.length === 0) ys = numCols.filter((k) => k !== x);
      if (ys.length === 0) ys = [numCols[1] || numCols[0]];
    } else if (numCols.length === 1) {
      x = catCols[0] || "_index";
      ys = [numCols[0]];
    } else if (catCols.length === 1) {
      // 1 Categorical column -> Frequency counts
      const counts: Record<string, number> = {};
      processedData.forEach((d) => {
        const val = String(d[catCols[0]] ?? "N/A");
        counts[val] = (counts[val] || 0) + 1;
      });
      const freqData = Object.keys(counts).map((k) => ({
        [catCols[0]]: k,
        Count: counts[k],
      }));
      return {
        data: freqData,
        xKey: catCols[0],
        yKeys: ["Count"],
        categoryKey: catCols[0],
        isCategoryDiscrete: true,
      };
    }

    if (!x) x = allKeys[0] || "_index";
    if (ys.length === 0) ys = allKeys.filter((k) => k !== x);
    if (ys.length === 0) ys = [x];

    // Determine if category key is truly discrete (e.g. <= 8 unique values like Smoker status)
    let isDiscrete = false;
    if (catKey) {
      const uniqueVals = new Set(processedData.map((d) => String(d[catKey!] ?? "")));
      isDiscrete = uniqueVals.size > 0 && uniqueVals.size <= 8;
    }

    return {
      data: processedData,
      xKey: x,
      yKeys: ys,
      categoryKey: isDiscrete ? catKey : undefined,
      isCategoryDiscrete: isDiscrete,
    };
  }, [spec]);

  if (!spec || data.length === 0) {
    return (
      <div className="my-2 p-3 rounded bg-card/60 border border-border text-muted-foreground font-mono text-xs text-center">
        📊 No valid chart data points available for this selection.
      </div>
    );
  }

  const renderChart = () => {
    switch (activeType) {
      case "line":
        return (
          <LineChart data={data} margin={{ top: 10, right: 15, left: -10, bottom: 5 }}>
            <CartesianGrid stroke="oklch(0.25 0.005 60)" strokeDasharray="2 4" vertical={false} />
            <XAxis
              dataKey={xKey}
              stroke="oklch(0.65 0.01 60)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <YAxis stroke="oklch(0.65 0.01 60)" fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: GOLD, strokeDasharray: "2 2" }} />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
            {yKeys.map((k, i) => (
              <Line
                key={k}
                type="monotone"
                dataKey={k}
                stroke={PALETTE[i % PALETTE.length]}
                strokeWidth={2}
                dot={{ r: 3, fill: PALETTE[i % PALETTE.length] }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        );

      case "area":
        return (
          <AreaChart data={data} margin={{ top: 10, right: 15, left: -10, bottom: 5 }}>
            <CartesianGrid stroke="oklch(0.25 0.005 60)" strokeDasharray="2 4" vertical={false} />
            <XAxis
              dataKey={xKey}
              stroke="oklch(0.65 0.01 60)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <YAxis stroke="oklch(0.65 0.01 60)" fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
            {yKeys.map((k, i) => (
              <Area
                key={k}
                type="monotone"
                dataKey={k}
                stroke={PALETTE[i % PALETTE.length]}
                fill={PALETTE[i % PALETTE.length]}
                fillOpacity={0.25}
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        );

      case "scatter":
      case "multivariate":
        if (categoryKey && isCategoryDiscrete) {
          const catValues = Array.from(new Set(data.map((d) => String(d[categoryKey] ?? "N/A"))));
          return (
            <ScatterChart margin={{ top: 10, right: 15, left: -10, bottom: 5 }}>
              <CartesianGrid stroke="oklch(0.25 0.005 60)" strokeDasharray="2 4" />
              <XAxis
                dataKey={xKey}
                name={xKey}
                stroke="oklch(0.65 0.01 60)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                dataKey={yKeys[0] || "y"}
                name={yKeys[0] || "y"}
                stroke="oklch(0.65 0.01 60)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: GOLD, strokeWidth: 1 }} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
              {catValues.map((catVal, i) => (
                <Scatter
                  key={catVal}
                  name={`${categoryKey}: ${catVal}`}
                  data={data.filter((d) => String(d[categoryKey] ?? "N/A") === catVal)}
                  fill={PALETTE[i % PALETTE.length]}
                />
              ))}
            </ScatterChart>
          );
        }
        return (
          <ScatterChart margin={{ top: 10, right: 15, left: -10, bottom: 5 }}>
            <CartesianGrid stroke="oklch(0.25 0.005 60)" strokeDasharray="2 4" />
            <XAxis
              dataKey={xKey}
              name={xKey}
              stroke="oklch(0.65 0.01 60)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              dataKey={yKeys[0] || "y"}
              name={yKeys[0] || "y"}
              stroke="oklch(0.65 0.01 60)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: GOLD, strokeWidth: 1 }} />
            <Scatter data={data} fill={GOLD} />
          </ScatterChart>
        );

      case "pie":
        return (
          <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Pie
              data={data}
              dataKey={yKeys[0] || "Count"}
              nameKey={xKey}
              cx="50%"
              cy="50%"
              outerRadius={80}
              innerRadius={35}
              paddingAngle={4}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={PALETTE[i % PALETTE.length]} stroke="oklch(0.1 0.005 60)" />
              ))}
            </Pie>
          </PieChart>
        );

      case "bar":
      case "column":
      default:
        return (
          <BarChart data={data} margin={{ top: 10, right: 15, left: -10, bottom: 5 }}>
            <CartesianGrid stroke="oklch(0.25 0.005 60)" strokeDasharray="2 4" vertical={false} />
            <XAxis
              dataKey={xKey}
              stroke="oklch(0.65 0.01 60)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <YAxis stroke="oklch(0.65 0.01 60)" fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
            {yKeys.map((k, i) => (
              <Bar key={k} dataKey={k} fill={PALETTE[i % PALETTE.length]} radius={[3, 3, 0, 0]} />
            ))}
          </BarChart>
        );
    }
  };

  return (
    <div className="my-4 bg-ink/90 border border-gold/30 rounded-xl p-4 shadow-2xl space-y-3">
      <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
        <div>
          {spec.title && (
            <p className="font-display text-base text-gold-soft leading-tight">{spec.title}</p>
          )}
          {spec.caption && (
            <p className="text-[10px] text-muted-foreground italic">{spec.caption}</p>
          )}
        </div>
        <div className="flex items-center gap-1 bg-card/60 p-1 rounded-lg border border-border/50">
          {(["bar", "line", "area", "scatter", "pie"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveType(t)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono capitalize transition ${
                activeType === t || (activeType === "multivariate" && t === "scatter")
                  ? "bg-gold text-ink font-bold shadow"
                  : "text-muted-foreground hover:text-gold"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64 pt-1">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function robustParseJson<T = any>(raw: string): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    try {
      let cleaned = raw
        .trim()
        .replace(/^\{\{/, "{")
        .replace(/\}\}$/, "}")
        .replace(/\/\/.*/g, "")
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/'([^'\\]*(\\.[^'\\]*)*)'/g, '"$1"')
        .replace(/,\s*([}\]])/g, "$1");

      const firstBrace = cleaned.indexOf("{");
      const lastBrace = cleaned.lastIndexOf("}");
      if (firstBrace !== -1 && lastBrace > firstBrace) {
        cleaned = cleaned.slice(firstBrace, lastBrace + 1);
      }

      return JSON.parse(cleaned);
    } catch {
      return null;
    }
  }
}

export function parseChartSegments(text: string): Segment[] {
  const segments: Segment[] = [];

  const re =
    /(?:```chart\s*\n([\s\S]*?)```)|(?:!\[([^\]]*)\]\((data:image\/[a-zA-Z0-9;+,/=\r\n\s]+)\))/g;

  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      segments.push({ kind: "text", text: text.slice(last, m.index) });
    }

    if (m[1]) {
      const spec = robustParseJson<ChartSpec>(m[1]);
      if (spec && typeof spec === "object" && (spec.data || spec.type)) {
        segments.push({ kind: "chart", spec });
      }
    } else if (m[2] !== undefined && m[3]) {
      segments.push({ kind: "image", alt: m[2], src: m[3] });
    }

    last = re.lastIndex;
  }

  if (last < text.length) {
    segments.push({ kind: "text", text: text.slice(last) });
  }

  return segments;
}
