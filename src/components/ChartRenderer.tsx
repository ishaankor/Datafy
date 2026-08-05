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
  "oklch(0.75 0.18 310)", // Magenta / Purple
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
          <div
            style={{
              fontWeight: "bold",
              marginBottom: "4px",
              paddingBottom: "4px",
              borderBottom: "1px solid oklch(0.78 0.13 80 / 0.2)",
            }}
          >
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

// ---------------------------------------------------------
// NEW: Image Renderer for Matplotlib Base64 Outputs
// ---------------------------------------------------------
export function ImageRenderer({ alt, src }: { alt: string; src: string }) {
  const cleanSrc = src ? src.replace(/[\r\n\s]+/g, "") : "";
  return (
    <div className="my-3 bg-ink/60 border border-gold/30 rounded-sm p-3">
      {alt && <p className="font-display text-base text-gold-soft leading-tight mb-2">{alt}</p>}
      <div className="flex justify-center bg-white/5 rounded-sm p-2">
        <img src={cleanSrc} alt={alt} className="max-w-full h-auto rounded-sm object-contain" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// LEGACY: Recharts Renderer for old JSON configs
// ---------------------------------------------------------
export function ChartRenderer({ spec }: { spec: ChartSpec }) {
  const rawData = spec.data ?? [];

  // Convert stringified numbers in rawData to real JS numbers
  const data = rawData.map((item) => {
    if (!item || typeof item !== "object") return item;
    const newItem: Record<string, any> = { ...item };
    for (const key of Object.keys(newItem)) {
      const val = newItem[key];
      if (typeof val === "string" && val.trim() !== "" && !isNaN(Number(val))) {
        newItem[key] = Number(val);
      }
    }
    return newItem;
  });

  const sampleObj = data[0] ?? {};
  const allKeys = Object.keys(sampleObj);

  const isNumericVal = (val: any) =>
    typeof val === "number" ||
    (typeof val === "string" && val.trim() !== "" && !isNaN(Number(val)));

  // Auto-detect X axis key (prefer non-numeric categorical string keys)
  let x = spec.x;
  if (!x || !allKeys.includes(x)) {
    const stringCategoryKey = allKeys.find(
      (k) => typeof sampleObj[k] === "string" && isNaN(Number(sampleObj[k])),
    );
    x = stringCategoryKey || allKeys[0] || "x";
  }

  // Auto-detect Y series keys (prefer numeric columns excluding X)
  let ys = Array.isArray(spec.y) ? spec.y : spec.y ? [spec.y] : [];
  ys = ys.filter((k) => allKeys.includes(k));
  if (ys.length === 0) {
    const numKeys = allKeys.filter((k) => k !== x && isNumericVal(sampleObj[k]));
    ys = numKeys.length > 0 ? numKeys : allKeys.filter((k) => k !== x);
  }
  if (ys.length === 0 && allKeys.length > 1) {
    ys = [allKeys[1]];
  }

  // Auto-detect Category key for multivariate / categorical color coding
  let categoryKey = spec.category;
  if (!categoryKey || !allKeys.includes(categoryKey)) {
    const categoryCandidate = allKeys.find(
      (k) =>
        k !== x &&
        !ys.includes(k) &&
        (typeof sampleObj[k] === "boolean" ||
          typeof sampleObj[k] === "string" ||
          String(sampleObj[k]).toLowerCase() === "true" ||
          String(sampleObj[k]).toLowerCase() === "false")
    );
    if (categoryCandidate) {
      categoryKey = categoryCandidate;
    }
  }

  const pieY = ys[0] ?? "value";

  const renderInner = () => {
    switch (spec.type) {
      case "line":
        return (
          <LineChart data={data} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid stroke="oklch(0.3 0.005 60)" strokeDasharray="2 4" vertical={false} />
            <XAxis
              dataKey={x}
              stroke="oklch(0.55 0.01 60)"
              fontSize={9}
              tickLine={false}
              axisLine={false}
            />
            <YAxis stroke="oklch(0.55 0.01 60)" fontSize={9} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            {ys.length > 1 && <Legend wrapperStyle={{ fontSize: 10 }} />}
            {ys.map((k, i) => (
              <Line
                key={k}
                type="monotone"
                dataKey={k}
                stroke={PALETTE[i % PALETTE.length]}
                strokeWidth={1.5}
                dot={{ r: 2 }}
              />
            ))}
          </LineChart>
        );
      case "area":
        return (
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid stroke="oklch(0.3 0.005 60)" strokeDasharray="2 4" vertical={false} />
            <XAxis
              dataKey={x}
              stroke="oklch(0.55 0.01 60)"
              fontSize={9}
              tickLine={false}
              axisLine={false}
            />
            <YAxis stroke="oklch(0.55 0.01 60)" fontSize={9} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            {ys.map((k, i) => (
              <Area
                key={k}
                type="monotone"
                dataKey={k}
                stroke={PALETTE[i % PALETTE.length]}
                fill={PALETTE[i % PALETTE.length]}
                fillOpacity={0.25}
              />
            ))}
          </AreaChart>
        );
      case "bar":
      case "column":
      case "histogram":
        return (
          <BarChart data={data} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid stroke="oklch(0.3 0.005 60)" strokeDasharray="2 4" vertical={false} />
            <XAxis
              dataKey={x}
              stroke="oklch(0.55 0.01 60)"
              fontSize={9}
              tickLine={false}
              axisLine={false}
            />
            <YAxis stroke="oklch(0.55 0.01 60)" fontSize={9} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "oklch(0.78 0.13 80 / 0.08)" }} />
            {ys.length > 1 && <Legend wrapperStyle={{ fontSize: 10 }} />}
            {ys.map((k, i) => (
              <Bar key={k} dataKey={k} fill={PALETTE[i % PALETTE.length]} radius={[2, 2, 0, 0]} />
            ))}
          </BarChart>
        );
      case "combo":
        return (
          <BarChart data={data} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid stroke="oklch(0.3 0.005 60)" strokeDasharray="2 4" vertical={false} />
            <XAxis
              dataKey={x}
              stroke="oklch(0.55 0.01 60)"
              fontSize={9}
              tickLine={false}
              axisLine={false}
            />
            <YAxis stroke="oklch(0.55 0.01 60)" fontSize={9} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "oklch(0.78 0.13 80 / 0.08)" }} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            {ys.map((k, i) => (
              <Bar key={k} dataKey={k} fill={PALETTE[i % PALETTE.length]} radius={[2, 2, 0, 0]} />
            ))}
          </BarChart>
        );
      case "pie":
        return (
          <PieChart>
            <Pie
              data={data}
              dataKey={pieY}
              nameKey={x || "name"}
              innerRadius={40}
              outerRadius={75}
              paddingAngle={2}
              stroke="oklch(0.10 0.005 60)"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
          </PieChart>
        );
      case "multivariate":
      case "scatter": {
        if (categoryKey) {
          const categoryValues = Array.from(
            new Set(data.map((item) => String(item[categoryKey!] ?? "N/A")))
          );
          return (
            <ScatterChart margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid stroke="oklch(0.3 0.005 60)" strokeDasharray="2 4" />
              <XAxis
                dataKey={x || "x"}
                name={x || "x"}
                stroke="oklch(0.55 0.01 60)"
                fontSize={9}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                dataKey={ys[0] ?? "y"}
                name={ys[0] ?? "y"}
                stroke="oklch(0.55 0.01 60)"
                fontSize={9}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: GOLD, strokeWidth: 1 }} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              {categoryValues.map((catVal, i) => {
                const groupData = data.filter(
                  (item) => String(item[categoryKey!] ?? "N/A") === catVal
                );
                return (
                  <Scatter
                    key={catVal}
                    name={`${categoryKey}: ${catVal}`}
                    data={groupData}
                    fill={PALETTE[i % PALETTE.length]}
                  />
                );
              })}
            </ScatterChart>
          );
        }

        return (
          <ScatterChart margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid stroke="oklch(0.3 0.005 60)" strokeDasharray="2 4" />
            <XAxis
              dataKey={x || "x"}
              name={x || "x"}
              stroke="oklch(0.55 0.01 60)"
              fontSize={9}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              dataKey={ys[0] ?? "y"}
              name={ys[0] ?? "y"}
              stroke="oklch(0.55 0.01 60)"
              fontSize={9}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: GOLD, strokeWidth: 1 }} />
            <Scatter data={data} fill={GOLD} />
          </ScatterChart>
        );
      }
      default:
        return (
          <BarChart data={data} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid stroke="oklch(0.3 0.005 60)" strokeDasharray="2 4" vertical={false} />
            <XAxis
              dataKey={x || "name"}
              stroke="oklch(0.55 0.01 60)"
              fontSize={9}
              tickLine={false}
              axisLine={false}
            />
            <YAxis stroke="oklch(0.55 0.01 60)" fontSize={9} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            {ys.map((k, i) => (
              <Bar key={k} dataKey={k} fill={PALETTE[i % PALETTE.length]} radius={[2, 2, 0, 0]} />
            ))}
          </BarChart>
        );
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

export function robustParseJson<T = any>(raw: string): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    try {
      let cleaned = raw
        .trim()
        // Fix double curly braces {{ ... }} if present
        .replace(/^\{\{/, "{")
        .replace(/\}\}$/, "}")
        // Remove single-line JS comments
        .replace(/\/\/.*/g, "")
        // Remove multi-line JS comments
        .replace(/\/\*[\s\S]*?\*\//g, "")
        // Replace single quotes around keys/strings with double quotes
        .replace(/'([^'\\]*(\\.[^'\\]*)*)'/g, '"$1"')
        // Remove trailing commas before closing braces/brackets
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
      // It's a JSON chart block
      const spec = robustParseJson<ChartSpec>(m[1]);
      if (spec && typeof spec === "object" && (spec.data || spec.type)) {
        segments.push({ kind: "chart", spec });
      }
    } else if (m[2] !== undefined && m[3]) {
      // It's a new Base64 Matplotlib image
      segments.push({ kind: "image", alt: m[2], src: m[3] });
    }

    last = re.lastIndex;
  }

  if (last < text.length) {
    segments.push({ kind: "text", text: text.slice(last) });
  }

  return segments;
}
