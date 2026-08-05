import { useState, useEffect } from "react";
import { executePythonChart } from "@/lib/pyodide";
import { Sparkles, Code2, Download, ExternalLink, Check, Copy } from "lucide-react";

interface PyodideChartRunnerProps {
  code: string;
  csvContent?: string;
}

export function PyodideChartRunner({ code, csvContent }: PyodideChartRunnerProps) {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showCode, setShowCode] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    if (!csvContent || csvContent.trim() === "") {
      setLoading(false);
      return;
    }

    setLoading(true);
    executePythonChart(code, csvContent)
      .then((src) => {
        if (isMounted) {
          setImgSrc(src);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Pyodide execution error:", err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [code, csvContent]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadImage = () => {
    if (!imgSrc) return;
    const a = document.createElement("a");
    a.href = imgSrc;
    a.download = "seaborn_chart.png";
    a.click();
  };

  return (
    <div className="my-4 rounded-xl border border-gold/30 bg-ink/90 p-3.5 shadow-2xl space-y-3 transition-all">
      <div className="flex items-center justify-between border-b border-border/40 pb-2">
        <div className="flex items-center gap-2 text-xs font-mono font-medium text-gold">
          <Sparkles className="w-3.5 h-3.5 animate-pulse text-gold" />
          <span>Python Seaborn / Matplotlib (Pyodide WASM)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowCode(!showCode)}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono border border-border bg-card/60 text-muted-foreground hover:text-gold transition"
          >
            <Code2 className="w-3 h-3" />
            {showCode ? "Hide Code" : "View Code"}
          </button>
          {imgSrc && (
            <button
              onClick={handleDownloadImage}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono border border-border bg-card/60 text-muted-foreground hover:text-gold transition"
            >
              <Download className="w-3 h-3" />
              Download
            </button>
          )}
        </div>
      </div>

      {showCode && (
        <div className="relative rounded-lg bg-black/70 border border-gold/20 p-3 overflow-x-auto text-[11px] font-mono text-gold-soft">
          <button
            onClick={handleCopyCode}
            className="absolute top-2 right-2 p-1 rounded bg-secondary/80 hover:bg-gold hover:text-ink text-muted-foreground transition"
            title="Copy Python Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <pre className="whitespace-pre-wrap">{code}</pre>
        </div>
      )}

      {loading ? (
        <div className="py-8 text-center space-y-2">
          <div className="inline-flex items-center gap-2 text-gold font-mono text-xs animate-pulse">
            <Sparkles className="w-4 h-4" />
            <span>Executing Python Seaborn/Matplotlib script in WASM...</span>
          </div>
          <p className="text-[10px] text-muted-foreground font-serif">
            Loading WebAssembly Pyodide runtime and rendering high-DPI plot...
          </p>
        </div>
      ) : imgSrc ? (
        <div className="relative group rounded-lg overflow-hidden border border-border/50 bg-black/40">
          <img
            src={imgSrc}
            alt="Python Seaborn Generated Visual"
            className="w-full h-auto object-contain max-h-[500px]"
          />
          <a
            href={imgSrc}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1 bg-background/90 hover:bg-gold text-foreground hover:text-ink px-2.5 py-1 rounded text-[10px] font-mono shadow-lg"
          >
            <ExternalLink className="w-3 h-3" /> Full Resolution
          </a>
        </div>
      ) : (
        <div className="p-3 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-xs">
          ⚠️ Python Seaborn plot rendered via fallback interactive SVG below.
        </div>
      )}
    </div>
  );
}
