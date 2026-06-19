import { useCallback, useRef, useState } from "react";
import { Upload, FileText } from "lucide-react";

interface Props {
  onLoad: (csv: string, name: string) => void;
}

export function DataInput({ onLoad }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFile = useCallback(
    async (f: File) => {
      setLoading(true);
      const txt = await f.text();
      setTimeout(() => onLoad(txt, f.name.replace(/\.[^.]+$/, "")), 350);
    },
    [onLoad],
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16 animate-fade-in">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-12 animate-fade-in" style={{ animationDelay: "60ms", animationFillMode: "backwards" }}>
          <p className="eyebrow mb-4">Vol. I — A Curated Reading of Data</p>
          <h1 className="text-6xl md:text-7xl font-display leading-[0.95] mb-6">
            The data, <em className="text-gold">interpreted</em>.
          </h1>
          <div className="hairline w-32 mx-auto my-6" />
          <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Bring numbers. Receive an editorial canvas — composed, annotated, and ready
            to be questioned. A quiet curator stands by to explain what you are seeing.
          </p>
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files?.[0];
            if (f) handleFile(f);
          }}
          onClick={() => fileRef.current?.click()}
          className={`group relative cursor-pointer bg-card/40 backdrop-blur border rounded-sm px-10 py-16 shadow-noir transition-all duration-500 animate-scale-in
            ${dragOver ? "border-gold scale-[1.01] shadow-glow" : "border-border hover:border-gold/60"}
            ${loading ? "opacity-60 pointer-events-none" : ""}`}
          style={{ animationDelay: "180ms", animationFillMode: "backwards" }}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />

          <div className="flex flex-col items-center text-center gap-5">
            <div
              className={`relative w-16 h-16 rounded-full border border-gold/40 flex items-center justify-center transition-transform duration-500
                ${loading ? "animate-pulse" : "group-hover:scale-110 group-hover:-translate-y-1"}`}
            >
              <Upload className="w-6 h-6 text-gold" />
              <span className="absolute inset-0 rounded-full border border-gold/20 animate-ping opacity-40" />
            </div>

            <div>
              <p className="font-display text-2xl">
                {loading ? "Composing canvas…" : "Upload a CSV"}
              </p>
              <p className="text-xs text-muted-foreground mt-2 flex items-center justify-center gap-2">
                <FileText className="w-3 h-3" />
                {dragOver ? "Release to open" : "Click to choose, or drag a file in"}
              </p>
            </div>

            <p className="eyebrow text-[0.6rem] mt-2 opacity-60">
              .csv · header row required
            </p>
          </div>

          {loading && (
            <div className="absolute bottom-0 left-0 h-px bg-gold/70 animate-[loading_0.4s_ease-out_forwards]" style={{ width: "100%" }} />
          )}
        </div>
      </div>
    </div>
  );
}
