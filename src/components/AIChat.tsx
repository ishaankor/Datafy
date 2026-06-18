import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Send, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { parseChartSegments, ChartRenderer } from "@/components/ChartRenderer";

interface Props {
  open: boolean;
  onClose: () => void;
  datasetContext: string;
  selectionCSV: string;
  selectionLabel: string | null;
  pendingPrompt: string | null;
  onPromptConsumed: () => void;
}

export function AIChat({
  open,
  onClose,
  datasetContext,
  selectionCSV,
  selectionLabel,
  pendingPrompt,
  onPromptConsumed,
}: Props) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatApiUrl = import.meta.env.VITE_CHAT_API_URL ?? "/api/chat";

  const transport = new DefaultChatTransport({
    api: chatApiUrl,
    body: () => ({ datasetContext, selectionCSV, selectionLabel }),
  });

  const { messages, sendMessage, status } = useChat({ transport });

  useEffect(() => {
    if (pendingPrompt) {
      sendMessage({ text: pendingPrompt });
      onPromptConsumed();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingPrompt]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  const submit = () => {
    const text = input.trim();
    if (!text || status === "streaming" || status === "submitted") return;
    sendMessage({ text });
    setInput("");
  };

  const suggestions = selectionLabel
    ? ["Plot this", "What stands out?", "Compare these"]
    : ["Show me a trend", "What's interesting here?", "Suggest a chart"];

  return (
    <aside
      className={`fixed top-0 right-0 h-screen w-full sm:w-[460px] bg-canvas border-l border-border shadow-noir z-40 flex flex-col transition-transform duration-300 ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
    >
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
              Highlight any part of the table and I'll plot it, summarize it, or
              tell you what's interesting.
            </p>
            <p className="text-xs text-muted-foreground/70 mt-4">
              Or just ask me anything about your data.
            </p>
          </div>
        )}

        {messages.map((m: UIMessage) => {
          const text = m.parts
            .map((p) => (p.type === "text" ? p.text : ""))
            .join("");
          if (m.role === "user") {
            return (
              <div key={m.id} className="flex justify-end">
                <div className="max-w-[88%] bg-gold text-ink px-3.5 py-2 rounded-sm text-sm">
                  {text}
                </div>
              </div>
            );
          }
          const segments = parseChartSegments(text);
          return (
            <div key={m.id} className="space-y-1">
              <p className="eyebrow text-[0.55rem]">Sidekick</p>
              <div className="text-sm leading-relaxed text-foreground/90">
                {segments.map((seg, i) => {
                  if (seg.kind === "chart") return <ChartRenderer key={i} spec={seg.spec} />;
                  if (seg.kind === "error")
                    return (
                      <p key={i} className="text-xs text-destructive italic">
                        {seg.text}
                      </p>
                    );
                  return (
                    <p key={i} className="whitespace-pre-wrap">
                      {seg.text}
                    </p>
                  );
                })}
              </div>
            </div>
          );
        })}

        {(status === "submitted" || status === "streaming") &&
          messages[messages.length - 1]?.role === "user" && (
            <div className="space-y-1">
              <p className="eyebrow text-[0.55rem]">Sidekick</p>
              <p className="text-sm text-muted-foreground italic">Looking…</p>
            </div>
          )}
      </div>

      <div className="border-t border-border p-4 space-y-3">
        {selectionLabel && (
          <div className="text-[10px] text-gold/80 font-mono uppercase tracking-widest">
            ✦ Working with {selectionLabel}
          </div>
        )}
        <div className="flex gap-2 flex-wrap">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => sendMessage({ text: s })}
              disabled={status === "streaming" || status === "submitted"}
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
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder={selectionLabel ? "Ask about the selection…" : "Ask me anything about the data…"}
            rows={2}
            className="flex-1 bg-ink/50 border border-border rounded-sm p-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold/50 resize-none"
          />
          <Button
            onClick={submit}
            disabled={!input.trim() || status === "streaming" || status === "submitted"}
            className="bg-gold hover:bg-gold-soft text-ink rounded-sm h-[60px] w-[60px] p-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
