import { useRef, useState } from "react";
import { Upload, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SAMPLE_CSV } from "@/lib/dataset";

interface Props {
  onLoad: (csv: string, name: string) => void;
}

export function DataInput({ onLoad }: Props) {
  const [text, setText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (f: File) => {
    const txt = await f.text();
    onLoad(txt, f.name.replace(/\.[^.]+$/, ""));
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-12">
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

        <div className="bg-card/60 backdrop-blur border border-border rounded-sm p-8 shadow-noir">
          <div className="flex items-center justify-between mb-4">
            <p className="eyebrow">I. Submit your data</p>
            <div className="flex gap-2">
              <input
                ref={fileRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileRef.current?.click()}
                className="text-muted-foreground hover:text-gold"
              >
                <Upload className="w-3.5 h-3.5 mr-2" /> Upload CSV
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onLoad(SAMPLE_CSV, "Sample — Annual Revenue")}
                className="text-muted-foreground hover:text-gold"
              >
                <Sparkles className="w-3.5 h-3.5 mr-2" /> Try a sample
              </Button>
            </div>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={"month,revenue,orders\nJan,12400,310\nFeb,13800,342\n..."}
            className="w-full h-56 bg-ink/50 border border-border rounded-sm p-4 font-mono text-xs text-foreground/90 placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold/60 resize-none"
            spellCheck={false}
          />

          <div className="flex items-center justify-between mt-6">
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <FileText className="w-3 h-3" /> Paste CSV with a header row.
            </p>
            <Button
              onClick={() => text.trim() && onLoad(text, "Your dataset")}
              disabled={!text.trim()}
              className="bg-gold hover:bg-gold-soft text-ink font-medium tracking-wide rounded-sm px-6"
            >
              Compose canvas →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
