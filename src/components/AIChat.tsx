import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { X, Send, Sparkles } from 'lucide-react'; 
import { parseChartSegments, ChartRenderer, ImageRenderer } from '@/components/ChartRenderer';

interface AIChatProps {
  open: boolean;
  onClose: () => void;
  datasetContext?: string;
  selectionCSV?: string;
  selectionLabel?: string | null;
  pendingPrompt?: string | null;
  onPromptConsumed?: () => void;
}

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export const AIChat = ({
  open,
  onClose,
  datasetContext,
  selectionCSV,
  selectionLabel,
  pendingPrompt,
  onPromptConsumed
}: AIChatProps) => {

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const hasRealSelection = Boolean(selectionLabel && selectionLabel.trim() !== "");
  const activeSelectionCSV = hasRealSelection ? selectionCSV : undefined;
  const activeSelectionLabel = hasRealSelection ? selectionLabel : undefined;

  const liveContext = useRef({ datasetContext, activeSelectionCSV, activeSelectionLabel });
  useEffect(() => {
    liveContext.current = { datasetContext, activeSelectionCSV, activeSelectionLabel };
  }, [datasetContext, activeSelectionCSV, activeSelectionLabel]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const append = async (content: string) => {
    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const payload = {
        messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
        datasetContext: liveContext.current.datasetContext,
        selectionCSV: liveContext.current.activeSelectionCSV,
        selectionLabel: liveContext.current.activeSelectionLabel,
      };

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      
      setMessages(prev => [...prev, { 
        id: crypto.randomUUID(), 
        role: 'assistant', 
        content: data.response || "No response generated." 
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        id: crypto.randomUUID(), 
        role: 'assistant', 
        content: "Error communicating with the Python backend." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (pendingPrompt && open) {
      append(pendingPrompt);
      onPromptConsumed?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingPrompt, open]);

  const submit = () => {
    if (!input.trim() || isLoading) return;
    const text = input.trim();
    setInput("");
    append(text);
  };

  const suggestions = activeSelectionLabel
    ? ["Plot this", "What stands out?", "Compare these"]
    : ["Show me a trend", "What's interesting here?", "Suggest a chart"];

  if (!open) return null;

  return (
    <aside className="fixed top-0 right-0 h-screen w-full sm:w-[460px] bg-canvas border-l border-border shadow-noir z-40 flex flex-col transition-transform duration-300">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div>
          <p className="eyebrow text-[0.6rem]">Sidekick</p>
          <p className="font-display text-xl mt-0.5">Let's look at this together</p>
        </div>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-gold transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
        {messages.length === 0 && (
          <div className="text-center py-10">
            <Sparkles className="w-7 h-7 text-gold mx-auto mb-4 opacity-70" />
            <p className="font-display text-lg text-foreground/90 leading-snug max-w-[300px] mx-auto">
              Highlight any part of the table and I'll plot it, summarize it, or tell you what's interesting.
            </p>
            <p className="text-xs text-muted-foreground/70 mt-4">
              Or just ask me anything about your data.
            </p>
          </div>
        )}

        {messages.map((m) => {
          const segments = m.role === 'assistant' ? parseChartSegments(m.content) : [];
          
          return (
            <div key={m.id} className={m.role === 'user' ? "flex justify-end" : "space-y-1"}>
              {m.role === 'user' ? (
                <div className="max-w-[88%] bg-gold text-ink px-3.5 py-2 rounded-sm text-sm">
                  {m.content}
                </div>
              ) : (
                <>
                  <p className="eyebrow text-[0.55rem]">Sidekick</p>
                  <div className="text-sm leading-relaxed text-foreground/90 space-y-4">
                    {segments.map((seg, i) => {
                      if (seg.kind === "chart") return <ChartRenderer key={i} spec={seg.spec} />;
                      if (seg.kind === "image") return <ImageRenderer key={i} alt={seg.alt} src={seg.src} />;
                      if (seg.kind === "error") return <p key={i} className="text-xs text-destructive italic">{seg.text}</p>;
                      return (
                        <p key={i} className="whitespace-pre-wrap">
                          {seg.text}
                        </p>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="space-y-1">
            <p className="eyebrow text-[0.55rem]">Sidekick</p>
            <p className="text-sm text-muted-foreground italic">Thinking and analyzing data...</p>
          </div>
        )}
      </div>

      <div className="border-t border-border p-4 space-y-3">
        {activeSelectionLabel && (
          <div className="text-[10px] text-gold/80 font-mono uppercase tracking-widest">
            ✦ Working with {activeSelectionLabel}
          </div>
        )}
        <div className="flex gap-2 flex-wrap">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => {
                if (!isLoading) append(s);
              }}
              disabled={isLoading}
              className="text-[11px] border border-border text-muted-foreground hover:text-gold hover:border-gold/40 px-2.5 py-1 rounded-sm transition disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder={activeSelectionLabel ? "Ask about the selection..." : "Ask me anything about the data..."}
            rows={2}
            className="flex-1 bg-ink/50 border border-border rounded-sm p-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold/50 resize-none"
          />
          <Button
            onClick={submit}
            disabled={!input.trim() || isLoading}
            className="bg-gold hover:bg-gold-soft text-ink rounded-sm h-[60px] w-[60px] p-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
};